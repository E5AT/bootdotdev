from textnode import TextType, TextNode
import os
import shutil
from copystatic import copy_files_recurive
from generate import generate_pages_recursive
import sys

def main():
    basepath = "/"
    if len(sys.argv) > 1:
        basepath = sys.argv[1]


    source_dir = "static"
    dest_dir = "../docs"

    if os.path.exists(dest_dir):
        print("cleaning up old public/")
        shutil.rmtree(dest_dir)

    print("creaing new empty public/")
    os.mkdir(dest_dir)

    print("beginning static asset sync...")
    copy_files_recurive(source_dir, dest_dir)
    print("static sync complete!")

    print("generating index webpage...")
    generate_pages_recursive("content", "template.html", dest_dir, basepath)
    print("build step successful!")

if __name__ == "__main__":
    main()
