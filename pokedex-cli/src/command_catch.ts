import { State } from "./state.js"

export async function commandCatch(state: State, ...args: string[]): Promise<void> {
    const name = args[0];

    if (!name) {
        console.log("Please provide a pokemon name to catch.");
        return;
    }

    console.log(`Throwing a Pokeball at ${name}...`);

    try {
        const pokemon = await state.pokeapi.fetchPokemon(name);
        const threshold = Math.max(0.1, 1 - pokemon.base_experience / 300);
        const roll = Math.random();

        if (roll < threshold) {
            console.log(`${pokemon.name} was caught!`);
            console.log("You may now inspect it with the inspect command.");
            state.pokedex[pokemon.name] = pokemon;
        } else {
            console.log(`${pokemon.name} escaped!`);
        }
    } catch (err) {
        console.log(`Could not find Pokemon: ${name}`);
    }
}
