from textnode import TextNode, TextType
import re

def split_nodes_delimiter(old_nodes: list[TextNode], delimiter: str, text_type: TextType) -> list[TextNode]:
    new_nodes = []

    for old_node in old_nodes:
        if old_node.text_type != TextType.TEXT:
            new_nodes.append(old_node)
            continue

        parts = old_node.text.split(delimiter)

        if len(parts) % 2 == 0:
            raise ValueError("invalid syntax")

        for i, part in enumerate(parts):
            if part == "":
                continue

            if i % 2 == 0:
                new_nodes.append(TextNode(part, TextType.TEXT))
            else:
                new_nodes.append(TextNode(part, text_type))

    return new_nodes

def extract_markdown_images(text: str) -> list[tuple[str, str]]:
    pattern = r"!\[([^\[\]]*)\]\(([^\(\)]*)\)"
    return re.findall(pattern, text)

def extract_markdown_links(text: str) -> list[tuple[str, str]]:
    pattern = r"(?<!!)\[([^\[\]]*)\]\(([^\(\)]*)\)"
    return re.findall(pattern, text)

def split_nodes_image(old_nodes: list[TextNode]) -> list[TextNode]:
    new_nodes = []
    for old_node in old_nodes:
        if old_node.text_type != TextType.TEXT:
            new_nodes.append(old_node)
            continue
            
        current_text = old_node.text
        images = extract_markdown_images(current_text)
        
        if len(images) == 0:
            new_nodes.append(old_node)
            continue
            
        for alt, url in images:
            target_syntax = f"![{alt}]({url})"
            sections = current_text.split(target_syntax, 1)
            
            if len(sections) != 2:
                raise ValueError("invalid markdown")
                
            if sections[0] != "":
                new_nodes.append(TextNode(sections[0], TextType.TEXT))
                
            new_nodes.append(TextNode(alt, TextType.IMAGE, url))
            
            current_text = sections[1]
            
        if current_text != "":
            new_nodes.append(TextNode(current_text, TextType.TEXT))
            
    return new_nodes

def split_nodes_link(old_nodes: list[TextNode]) -> list[TextNode]:
    new_nodes = []
    for old_node in old_nodes:
        if old_node.text_type != TextType.TEXT:
            new_nodes.append(old_node)
            continue
            
        current_text = old_node.text
        links = extract_markdown_links(current_text)
        
        if len(links) == 0:
            new_nodes.append(old_node)
            continue
            
        for anchor, url in links:
            target_syntax = f"[{anchor}]({url})"
            sections = current_text.split(target_syntax, 1)
            
            if len(sections) != 2:
                raise ValueError("invalid markdown")
                
            if sections[0] != "":
                new_nodes.append(TextNode(sections[0], TextType.TEXT))
                
            new_nodes.append(TextNode(anchor, TextType.LINK, url))
            
            current_text = sections[1]
            
        if current_text != "":
            new_nodes.append(TextNode(current_text, TextType.TEXT))
            
    return new_nodes

def text_to_textnodes(text: str) -> list[TextNode]:
    nodes = [TextNode(text, TextType.TEXT)]

    nodes = split_nodes_image(nodes)
    nodes = split_nodes_link(nodes)

    nodes = split_nodes_delimiter(nodes, "**", TextType.BOLD)
    nodes = split_nodes_delimiter(nodes, "_", TextType.ITALIC)
    nodes = split_nodes_delimiter(nodes, "`", TextType.CODE)

    return nodes
