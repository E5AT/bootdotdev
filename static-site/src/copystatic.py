import os
from os.path import isfile
import shutil

def copy_files_recurive(source_dir: str, dest_dir: str) -> None:
    if not os.path.exists(source_dir):
        raise ValueError("source_dir does not exist")

    for item in os.listdir(source_dir):
        source_path = os.path.join(source_dir, item)
        dest_path = os.path.join(dest_dir, item)

        if os.path.isfile(source_path):
            print(f"copying file: {source_path} -> {dest_path}")
            shutil.copy(source_path, dest_path)
        else:
            print("creating directory: {dest_dir}")
            os.mkdir(dest_path)
            copy_files_recurive(source_path, dest_path)
