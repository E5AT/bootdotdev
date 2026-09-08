import { State } from "./state.js"

export async function commandInspect(state: State, ...args: string[]): Promise<void> {
    const name = args[0];

    if (!name) {
        console.log("Please provide a Pokemon name to inspect.");
        return;
    }

    const pokemon = state.pokedex[name.toLowerCase()];

    if (!pokemon) {
        console.log("you have not caught this pokemon");
        return;
    }

    console.log(`Name: ${pokemon.name}`);
    console.log(`Height: ${pokemon.height}`);
    console.log(`Weight: ${pokemon.weight}`);

    console.log("Stats:");
    for (const stat of pokemon.stats) {
        console.log(`  -${stat.stat.name}: ${stat.base_stat}`);
    }

    console.log("Types:");
    for (const type of pokemon.types) {
        console.log(`  -${type.type.name}`);
    }
}
