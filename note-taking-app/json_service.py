import json
from note import Note
from pathlib import Path
from config import NOTES_FILE_PATH

class JSONService:

    @staticmethod
    def parse() -> list[Note]:

        if not NOTES_FILE_PATH.is_file():
            return []

        with open(NOTES_FILE_PATH, "r") as file:
            notes = json.load(file)

        return [Note.from_dict(note) for note in notes]

    @staticmethod
    def write(notes: list[Note]) -> None:

        with open(NOTES_FILE_PATH, "w") as file:
            json.dump(
                [note.to_dict() for note in notes],
                file,
                indent=4
            )