from note import Note
from note_service import NoteService
from datetime import datetime
import sys

def main():
    print()

    if len(sys.argv) < 2:
        print("Usage:")
        print("     python main.py <command>")

        print()

        print("List of all commands:")
        print("     python main.py help")

    else:
        match sys.argv[1]:
            case "help":
                print("Usage:")
                print("     python main.py <command>")

                print()

                print("Commands:")
                print("     add      add a note")
                print("     list     list all notes")
                print("     delete   delete a note by id")

            case "add":
                if len(sys.argv) != 3:
                    print("Usage:")
                    print("     python main.py add <note>")
                else:
                    NoteService.add_note(Note(sys.argv[2], datetime.now().strftime("%Y-%m-%d %H:%M")))
            case "list":
                if len(sys.argv) != 2:
                    print("Usage:")
                    print("     python main.py list")
                else:
                    NoteService.list_notes()
            case "delete":
                if len(sys.argv) != 3:
                    print("Usage:")
                    print("     python main.py delete <note_id>")
                else:
                    NoteService.delete_note(int(sys.argv[2]))
            case _:
                print("Invalid command.")

    print()

if __name__ == "__main__":
    main()