import { State } from "./state.js"

export async function commandMapb(state: State): Promise<void> {
    if (!state.prevLocationsURL) {
        console.log("you're on the first page");
        return;
    }

    const locations = await state.pokeapi.fetchLocations(state.prevLocationsURL);

    state.nextLocationsURL = locations.next;
    state.prevLocationsURL = locations.previous;

    for (const location of locations.results) {
        console.log(location.name);
    }
}
