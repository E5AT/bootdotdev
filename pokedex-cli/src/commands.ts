import { CLICommand } from "./state.js"
import { commandExit } from "./command_exit.js"
import { commandHelp } from "./command_help.js"
import { commandMap } from "./command_map.js"
import { commandMapb } from "./command_mapb.js"
import { commandExplore } from "./command_explore.js"
import { commandCatch } from "./command_catch.js"
import { commandInspect } from "./command_inspect.js"
import { commandPokedex } from "./command_pokedex.js"

export function getCommands(): Record<string, CLICommand> {
  return {
    exit: {
      name: "exit",
      description: "Exit the Pokedex",
      callback: commandExit,
    },
    help: {
        name: "help",
        description: "Displays a help message",
        callback: commandHelp,
    },
    map: {
        name: "map",
        description: "Get the next page of locations",
        callback: commandMap,
    },
    mapb: {
        name: "mapb",
        description: "Get the previous page of locations",
        callback: commandMapb,
    },
    explore: {
        name: "explore",
        description: "Explore a location area to see its Pokemon",
        callback: commandExplore,
    },
    catch: {
        name: "catch",
        description: "Attempt to catch a Pokemon and add it to your Pokedex",
        callback: commandCatch,
    },
    inspect: {
        name: "inspect",
        description: "View stats and info about caught Pokemon",
        callback: commandInspect,
    },
    pokedex: {
        name: "pokedex",
        description: "List all Pokemon you have caught",
        callback: commandPokedex,
    },
  };
}
