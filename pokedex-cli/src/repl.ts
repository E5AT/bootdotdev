import { State } from "./state.js"

export function cleanInput(input: string): string[] {
    return input
        .toLowerCase()
        .trim()
        .split(" ")
        .filter((word) => word !== "");
}

export function startREPL(state: State): void {
    state.rl.prompt();

    state.rl.on("line", async (line: string) => {
        const words = cleanInput(line);

        if (words.length === 0) {
            state.rl.prompt();
            return;
        }

        const command = words[0]
        const args = words.slice(1)

        if (command in state.commands) {
            try {
                await state.commands[command].callback(state, ...args);
            } catch (err) {
                if (err instanceof Error) {
                    console.log(err.message);
                } else {
                    console.log(err);
                }
            }
        } else {
            console.log("Unknown command");
        }

        state.rl.prompt();
    })
}
