import { State } from "./state.js"

export async function commandExplore(state: State, ...args: string[]): Promise<void> {
    const areaName = args[0];

    if (!areaName) {
        console.log("Please provide a location area name to explore.");
        return;
    }

    console.log(`Exploring ${areaName}...`);

    try {
        const data = await state.pokeapi.fetchLocation(areaName);
        console.log("Found Pokemon:");
        for (const pokemon of data.pokemon_encounters) {
            console.log(` - ${pokemon.pokemon.name}`);
        }
    } catch (err) {
        console.log(`Could not find location area: ${areaName}`);
    }
}
