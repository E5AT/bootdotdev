import os

def write_file(working_directory: str, file_path: str, content: str) -> str:
    try:
        working_dir_abs = os.path.abspath(working_directory)
        target_path_abs = os.path.abspath(os.path.join(working_dir_abs, file_path))

        if os.path.commonpath([working_dir_abs, target_path_abs]) != working_dir_abs or working_dir_abs == target_path_abs:
            return f'Error: Cannot write to "{file_path}" as it is outside or equals the permitted working directory'

        if os.path.isdir(target_path_abs):
            return f'Error: Cannot write to "{file_path}" because it is an existing directory'

        target_dir = os.path.dirname(target_path_abs)
        os.makedirs(target_dir, exist_ok=True)

        with open(target_path_abs, "w", encoding="utf-8") as f:
            f.write(content)

        return f'Successfully wrote to "{file_path}" ({len(content)} characters written)'

    except Exception as e:
        return f"Error: {e}"

schema_write_file = {
    "type": "function",
    "function": {
        "name": "write_file",
        "description": "Writes the specified text content to a file. It automatically creates any missing parent directories, provided they are within the permitted working directory security boundary.",
        "parameters": {
            "type": "object",
            "properties": {
                "working_directory": {
                    "type": "string",
                    "description": "The root directory that acts as the security boundary for the file operation.",
                },
                "file_path": {
                    "type": "string",
                    "description": "The path to the file to write, relative to the working directory.",
                },
                "content": {
                    "type": "string",
                    "description": "The text content to write into the file.",
                },
            },
            "required": ["file_path", "content"],
        },
    },
}
