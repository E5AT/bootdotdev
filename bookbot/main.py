from stats import count_words, char_count, chars_dict_to_sorted_list
import sys

def get_book_text(book_path: str) -> str:
    with open(book_path) as f:
        content = f.read()
    return content

def print_report(book_path: str, word_count: int, sorted_chars: list[tuple[str, int]]) -> None:
    print("============ BOOKBOT ============")
    print(f"Analyzing book found at {book_path}...")
    print("----------- Word Count ----------")
    print(f"Found {word_count} total words")
    print("--------- Character Count -------")

    for c in sorted_chars:
        if c[0].isalpha():
            print(f"{c[0]}: {c[1]}")

    print("============= END ===============")

def main():
    
    if len(sys.argv) < 2:
        print("Usage: python main.py <path_to_book>")
        sys.exit(1)

    book_path = sys.argv[1]
    content = get_book_text(book_path)
    word_count = count_words(content)
    sorted_chars = chars_dict_to_sorted_list(char_count(content))

    print_report(book_path, word_count, sorted_chars)

main()
