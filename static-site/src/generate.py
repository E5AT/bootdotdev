import os
from pathlib import Path
from block_markdown import markdown_to_html_node, extract_title

def generate_page(from_path: str, template_path: str, dest_path: str, basepath: str) -> None:
    print(f"Generating page from {from_path} to {dest_path} using {template_path}")
    
    with open(from_path, "r", encoding="utf-8") as f:
        markdown_content = f.read()
        
    with open(template_path, "r", encoding="utf-8") as f:
        template_content = f.read()
        
    html_node = markdown_to_html_node(markdown_content)
    html_string = html_node.to_html()
    
    page_title = extract_title(markdown_content)
    
    full_html = template_content.replace("{{ Title }}", page_title)
    full_html = full_html.replace("{{ Content }}", html_string)
    
    full_html = full_html.replace('href="/', f'href="{basepath}')
    full_html = full_html.replace('src="/', f'src="{basepath}')
    
    dest_dir = os.path.dirname(dest_path)
    if dest_dir:
        os.makedirs(dest_dir, exist_ok=True)
        
    with open(dest_path, "w", encoding="utf-8") as f:
        f.write(full_html)

def generate_pages_recursive(dir_path_content: str, template_path: str, dest_dir_path: str, basepath: str) -> None:
    content_path = Path(dir_path_content)
    
    for entry in content_path.iterdir():
        if entry.is_file() and entry.suffix == ".md":
            relative_path = entry.relative_to(dir_path_content)
            dest_file_path = Path(dest_dir_path) / relative_path.with_suffix(".html")
            
            generate_page(str(entry), template_path, str(dest_file_path), basepath)
            
        elif entry.is_dir():
            next_dest_dir = Path(dest_dir_path) / entry.relative_to(dir_path_content)
            generate_pages_recursive(str(entry), template_path, str(next_dest_dir), basepath)
