import { State } from "./state.js"

export async function commandPokedex(state: State): Promise<void> {
    const names = Object.keys(state.pokedex);

    if (names.length === 0) {
        console.log("Your Pokedex is empty. Go catch some Pokemon!");
        return;
    }

    console.log("Your Pokedex:");
    for (const name of names) {
        console.log(` - ${name}`);
    }
}
