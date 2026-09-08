import { Cache } from "./pokecache.js"

export class PokeAPI {
  private static readonly baseURL = "https://pokeapi.co/api/v2";
  private cache: Cache;

  constructor(cacheInterval = 5 * 60 * 1000) {
      this.cache = new Cache(cacheInterval);
  }

  async fetchLocations(pageURL?: string): Promise<ShallowLocations> {
    const url = pageURL ?? `${PokeAPI.baseURL}/location-area`;

    const cached = this.cache.get<ShallowLocations>(url);
    if (cached) {
        return cached;
    }

    const resp = await fetch(url);
    if (!resp.ok) {
        throw new Error(`Failed to fetch location areas: ${resp.statusText}`);
    }

    const data = (await resp.json()) as ShallowLocations
    this.cache.add(url, data);
    return data;
  }

  async fetchLocation(locationName: string): Promise<Location> {
    const url = `${PokeAPI.baseURL}/location-area/${locationName}`;

    const cached = this.cache.get<Location>(url);
    if (cached) {
        return cached;
    }

    const resp = await fetch(url);
    if (!resp.ok) {
        throw new Error(`Failed to fetch location area ${locationName}: ${resp.statusText}`);
    }

    const data = (await resp.json()) as Location
    this.cache.add(url, data);
    return data;
  }

  async fetchPokemon(name: string): Promise<Pokemon> {
      const url = `${PokeAPI.baseURL}/pokemon/${name}`;

      const cached = this.cache.get<Pokemon>(url);
      if (cached) {
          return cached;
      }

      const resp = await fetch(url);
      if (!resp.ok) {
          throw new Error(`Failed to fetch pokemon ${name}: ${resp.statusText}`);
      }

      const data = (await resp.json()) as Pokemon;
      this.cache.add(url, data);
      return data;
  }
}

export type ShallowLocations = {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
      name: string;
      url: string;
  }[];
};

export type Location = {
  id: number;
  name: string;
  pokemon_encounters: {
      pokemon: {
        name: string;
        url: string;
      }
  }[];
};

export type Pokemon = {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  weight: number;
  stats: {
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }[];
  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];
};
