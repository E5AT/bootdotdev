from textnode import TextType, TextNode
import os
import shutil
from copystatic import copy_files_recurive
from generate import generate_pages_recursive

def main():
    source_dir = "static"
    dest_dir = "public"

    if os.path.exists(dest_dir):
        print("cleaning up old public/")
        shutil.rmtree(dest_dir)

    print("creaing new empty public/")
    os.mkdir(dest_dir)

    print("beginning static asset sync...")
    copy_files_recurive(source_dir, dest_dir)
    print("static sync complete!")

    print("generating index webpage...")
    generate_pages_recursive("content", "template.html", "public")
    print("build step successful!")

if __name__ == "__main__":
    main()
