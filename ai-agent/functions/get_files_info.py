import os

def get_files_info(working_directory: str, directory: str = ".") -> str:

    try:
        working_dir_abs = os.path.abspath(working_directory)
        target_dir = os.path.normpath(os.path.join(working_dir_abs, directory))

        if not os.path.commonpath([working_dir_abs, target_dir]) == working_dir_abs:
            return f'Error: Cannot list "{directory}" as it is outside the permitted working directory'

        if not os.path.isdir(target_dir):
            return f'Error: "{target_dir}" is not a directory'

        # return f'Success: "{directory}" is within the working directory'
        
        result = ""

        for filename in os.listdir(target_dir):
            full_path = os.path.join(target_dir, filename)
            file_size: int = os.path.getsize(full_path) # if os.path.isfile(full_path) else 0
            is_dir: bool = os.path.isdir(full_path)

            if result == "":
                result = f"- {filename}: file_size: {file_size} bytes, is_dir={is_dir}"
            else:
                result += f"\n- {filename}: file_size={file_size} bytes, is_dir={is_dir}"

        return result



    except Exception as e:
        return f'Error: {e}'

schema_get_files_info = {
    "type": "function",
    "function": {
        "name": "get_files_info",
        "description": "Lists files in a specified directory relative to the working directory, providing file size and directory status",
        "parameters": {
            "type": "object",
            "properties": {
                "directory": {
                    "type": "string",
                    "description": "Directory path to list files from, relative to the working directory (default is the working directory itself)",
                },
            },
        },
    },
}
