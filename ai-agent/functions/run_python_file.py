import os
import subprocess

def run_python_file(
        working_directory: str, file_path: str, args: list[str] | None = None
) -> str:

    try:
        abs_working_dir = os.path.abspath(working_directory)
        abs_file_path = os.path.abspath(os.path.join(abs_working_dir, file_path))
        
        if not abs_file_path.startswith(abs_working_dir + os.sep) and abs_file_path != abs_working_dir:
            return f'Error: Cannot execute "{file_path}" as it is outside the permitted working directory'
        
        if not os.path.isfile(abs_file_path):
            return f'Error: "{file_path}" does not exist or is not a regular file'

        if not file_path.endswith(".py"):
            return f'Error: "{file_path}" is not a Python file'

        command = ["python", abs_file_path]
        if args:
            command.extend(args)
        
        result = subprocess.run(
                command,
                cwd=abs_working_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=30
                )
        output_parts = []
            
        if result.returncode != 0:
            output_parts.append(f"Process exited with code {result.returncode}")
                
        if not result.stdout.strip() and not result.stderr.strip():
            output_parts.append("No output produced")
        else:
            if result.stdout:
                output_parts.append(f"STDOUT:\n{result.stdout}")
            if result.stderr:
                output_parts.append(f"STDERR:\n{result.stderr}")
                
        return "\n".join(output_parts)

    except Exception as e:
        return f"Error: executing Python file: {e}"

schema_run_python_file = {
    "type": "function",
    "function": {
        "name": "run_python_file",
        "description": "Executes a Python script located within the permitted working directory and returns its output (STDOUT/STDERR). This function safely handles command execution with an execution timeout.",
        "parameters": {
            "type": "object",
            "properties": {
                "working_directory": {
                    "type": "string",
                    "description": "The root directory that acts as the security boundary and execution environment (cwd) for the script. If no working directory is specified, you MUST explicitly provide '.' as the value.",
                },
                "file_path": {
                    "type": "string",
                    "description": "The path to the Python file (.py) to execute, relative to the working directory.",
                },
                "args": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "description": "Optional list of command-line arguments to pass to the Python script.",
                },
            },
            "required": ["file_path"],
        },
    },
}
