from functions.get_file_content import get_file_content

print("Testing lorem.txt:")
result = get_file_content("calculator", "lorem.txt")
print(f"lorem.txt length: {len(result)}")
print(f"lorem.txt truncated: {'truncated' in result}")

print("\nTesting main.py:")
result = get_file_content("calculator", "main.py")
print(result)

print("\nTesting pkg/calculator.py:")
result = get_file_content("calculator", "pkg/calculator.py")
print(result)

print("\nTesting /bin/cat:")
result = get_file_content("calculator", "/bin/cat") 
print(result)

print("\nTesting pkg/does_not_exists.py")
result = get_file_content("calculator", "pkg/does_not_exist.py")
print(result)
