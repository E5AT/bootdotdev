import { State } from "./state.js"

export async function commandMap(state: State): Promise<void> {
    const url = state.nextLocationsURL ?? undefined;
    const locations = await state.pokeapi.fetchLocations(url);

    state.nextLocationsURL = locations.next;
    state.prevLocationsURL = locations.previous;

    for (const location of locations.results) {
        console.log(location.name);
    }
}
