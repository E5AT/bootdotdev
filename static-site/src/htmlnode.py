class HTMLNode:
    def __init__(self, tag = None, value = None, children = None, props = None) -> None:
        self.tag = tag
        self.value = value
        self.children = children
        self.props = props

    def to_html(self):
        raise NotImplementedError()

    def props_to_html(self):
        if self.props is None:
            return ""

        result = ""

        for key, value in self.props.items():
            result += f" {key}=\"{value}\""
        
        return result

    def __repr__(self) -> str:
        return f"HTMLNode(tag={self.tag!r}, value={self.value!r}, children={self.children!r}, props={self.props!r})"

class LeafNode(HTMLNode):
    def __init__(self, tag: str | None, value: str, props: dict[str, str] | None = None) -> None:
        super().__init__(tag=tag, value=value, children=None, props=props)

    def to_html(self) -> str:
        if self.value is None:
            raise ValueError("no value")

        if self.tag is None:
            return self.value

        return f"<{self.tag}{self.props_to_html()}>{self.value}</{self.tag}>"

    def __repr__(self) -> str:
        return f"LeafNode(tag={self.tag!r}, value={self.value!r}, props={self.props!r})"

class ParentNode(HTMLNode):
    def __init__(self, tag: str, children: list[HTMLNode] | None, props: dict[str, str] | None = None) -> None:
        super().__init__(tag=tag, value=None, children=children, props=props)

    def to_html(self) -> str:
        if self.tag is None:
            raise ValueError("no tag")
        if self.children is None:
            raise ValueError("no children")

        children_html = ""
        for child in self.children:
            children_html += child.to_html()

        return f"<{self.tag}{self.props_to_html()}>{children_html}</{self.tag}>"

    def __repr__(self) -> str:
        return f"ParentNode(tag={self.tag!r}, children={self.children!r}, props={self.props!r})"
        
