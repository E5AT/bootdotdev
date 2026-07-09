def count_words(text: str) -> int:
    return len(text.split())

def char_count(text: str) -> dict[str, int]:
    result: dict[str, int] = {}

    for c in text.lower():
        if c in result:
            result[c] += 1
        else:
            result[c] = 1

    return result

def sort_on(char_tuple: tuple[str, int]) -> int:
    return char_tuple[1]

def chars_dict_to_sorted_list(dictionary: dict[str, int]) -> list[tuple[str, int]]:
    result = []

    for c in dictionary:
        result.append((c, dictionary[c]))

    return sorted(result, key=sort_on, reverse=True)
