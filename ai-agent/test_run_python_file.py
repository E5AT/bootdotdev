import os
from functions.run_python_file import run_python_file

print("Test 1: Standard usage instructions")
print(run_python_file("calculator", "main.py"))
print("-" * 40)

print("Test 2: With arguments")
print(run_python_file("calculator", "main.py", ["3 + 5"]))
print("-" * 40)

print("Test 3: Running tests file")
print(run_python_file("calculator", "tests.py"))
print("-" * 40)

print("Test 4: Outside working directory error")
print(run_python_file("calculator", "../main.py"))
print("-" * 40)

print("Test 5: Nonexistent file error")
print(run_python_file("calculator", "nonexistent.py"))
print("-" * 40)

print("Test 6: Invalid extension error")
print(run_python_file("calculator", "lorem.txt"))
print("-" * 40)
