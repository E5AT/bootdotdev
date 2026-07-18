import unittest
from htmlnode import HTMLNode, LeafNode, ParentNode

class TestHTMLNode(unittest.TestCase):
    def test_props_to_html_with_values(self):
        node = HTMLNode(
            tag="a", 
            props={"href": "https://www.google.com", "target": "_blank"}
        )
        self.assertEqual(
            node.props_to_html(), 
            ' href="https://www.google.com" target="_blank"'
        )

    def test_props_to_html_empty(self):
        node = HTMLNode(tag="p", value="Hello world")
        self.assertEqual(node.props_to_html(), "")

    def test_props_to_html_empty_dict(self):
        node = HTMLNode(tag="div", props={})
        self.assertEqual(node.props_to_html(), "")

    def test_repr_output(self):
        node = HTMLNode(tag="h1", value="Header text")
        expected = "HTMLNode(tag='h1', value='Header text', children=None, props=None)"
        self.assertEqual(repr(node), expected)
    def test_leaf_to_html_p(self):
        node = LeafNode("p", "Hello, world!")
        self.assertEqual(node.to_html(), "<p>Hello, world!</p>")

    def test_leaf_to_html_with_props(self):
        node = LeafNode("a", "Click me!", {"href": "https://www.google.com"})
        self.assertEqual(node.to_html(), '<a href="https://www.google.com">Click me!</a>')

    def test_leaf_to_html_raw_text(self):
        node = LeafNode(None, "Just plain raw text.")
        self.assertEqual(node.to_html(), "Just plain raw text.")

    def test_leaf_to_html_missing_value(self):
        node = LeafNode("p", None) # type: ignore
        with self.assertRaises(ValueError):
            node.to_html()

    def test_leaf_repr(self):
        node = LeafNode("b", "Bold text")
        expected = "LeafNode(tag='b', value='Bold text', props=None)"
        self.assertEqual(repr(node), expected)

    def test_to_html_with_children(self):
        child_node = LeafNode("span", "child")
        parent_node = ParentNode("div", [child_node])
        self.assertEqual(parent_node.to_html(), "<div><span>child</span></div>")

    def test_to_html_with_grandchildren(self):
        grandchild_node = LeafNode("b", "grandchild")
        child_node = ParentNode("span", [grandchild_node])
        parent_node = ParentNode("div", [child_node])
        self.assertEqual(
            parent_node.to_html(),
            "<div><span><b>grandchild</b></span></div>",
        )

    def test_to_html_many_children(self):
        node = ParentNode(
            "p",
            [
                LeafNode("b", "Bold text"),
                LeafNode(None, "Normal text"),
                LeafNode("i", "italic text"),
                LeafNode(None, "Normal text"),
            ],
        )
        self.assertEqual(
            node.to_html(),
            "<p><b>Bold text</b>Normal text<i>italic text</i>Normal text</p>"
        )

    def test_to_html_with_parent_props(self):
        child_node = LeafNode("span", "hello")
        parent_node = ParentNode("div", [child_node], {"id": "main-container", "class": "box"})
        self.assertEqual(
            parent_node.to_html(),
            '<div id="main-container" class="box"><span>hello</span></div>'
        )

    def test_to_html_missing_tag(self):
        node = ParentNode(None, [LeafNode("span", "text")]) # type: ignore
        with self.assertRaises(ValueError):
            node.to_html()

    def test_to_html_missing_children(self):
        node = ParentNode("div", None) # type: ignore
        with self.assertRaises(ValueError):
            node.to_html()

if __name__ == "__main__":
    unittest.main()
