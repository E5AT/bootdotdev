from note import Note
from json_service import JSONService

class NoteService:

    @staticmethod
    def add_note(note: Note) -> None:
        notes = JSONService.parse()
        notes.append(note)
        JSONService.write(notes)
        print(f"Added new note: {note}")

    @staticmethod
    def list_notes() -> None:
        notes = JSONService.parse()

        if len(notes) == 0:
            print("No notes found.")
        else:
            print("List of all notes:")
            for i in range(0, len(notes)):
                print(f"[ID: {i}] - {notes[i]}")

    @staticmethod
    def delete_note(note_id: int) -> None:
        notes = JSONService.parse()

        if len(notes) <= note_id:
            print(f"<note_id> is out of range.")

        else:
            deleted_note = notes.pop(note_id)
            JSONService.write(notes)
            print(f"Deleted note: {deleted_note}")