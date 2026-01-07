import ky from "ky";

export const SWAPI_BASE = "https://swapi.py4e.com/api";

export const api = ky.create({
  prefixUrl: SWAPI_BASE,
  timeout: 10000,
});

export type ResourceType = "people" | "planets" | "films" | "species" | "vehicles" | "starships";

export interface SWAPIListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Person {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  films: string[];
  species: string[];
  vehicles: string[];
  starships: string[];
  url: string;
}

export interface Planet {
  name: string;
  rotation_period: string;
  orbital_period: string;
  diameter: string;
  climate: string;
  gravity: string;
  terrain: string;
  surface_water: string;
  population: string;
  residents: string[];
  films: string[];
  url: string;
}

export interface Film {
  title: string;
  episode_id: number;
  opening_crawl: string;
  director: string;
  producer: string;
  release_date: string;
  characters: string[];
  planets: string[];
  starships: string[];
  vehicles: string[];
  species: string[];
  url: string;
}

export interface Species {
  name: string;
  classification: string;
  designation: string;
  average_height: string;
  skin_colors: string;
  hair_colors: string;
  eye_colors: string;
  average_lifespan: string;
  homeworld: string | null;
  language: string;
  people: string[];
  films: string[];
  url: string;
}

export interface Vehicle {
  name: string;
  model: string;
  manufacturer: string;
  cost_in_credits: string;
  length: string;
  max_atmosphering_speed: string;
  crew: string;
  passengers: string;
  cargo_capacity: string;
  consumables: string;
  vehicle_class: string;
  pilots: string[];
  films: string[];
  url: string;
}

export interface Starship {
  name: string;
  model: string;
  manufacturer: string;
  cost_in_credits: string;
  length: string;
  max_atmosphering_speed: string;
  crew: string;
  passengers: string;
  cargo_capacity: string;
  consumables: string;
  hyperdrive_rating: string;
  MGLT: string;
  starship_class: string;
  pilots: string[];
  films: string[];
  url: string;
}

export type SWAPIResource = Person | Planet | Film | Species | Vehicle | Starship;

export const ALL_RESOURCE_TYPES: ResourceType[] = ["people", "planets", "films", "species", "vehicles", "starships"];

export async function fetchResource<T>(resource: ResourceType, page = 1): Promise<SWAPIListResponse<T>> {
  return api.get(`${resource}/?page=${page}`).json();
}

export async function fetchByUrl<T>(url: string): Promise<T> {
  // URL is full URL like "https://swapi.py4e.com/api/people/1/"
  // Extract the path after /api/
  const path = url.replace(SWAPI_BASE + "/", "").replace(/\/$/, "");
  return api.get(path).json();
}

export async function searchResource<T>(resource: ResourceType, query: string): Promise<SWAPIListResponse<T>> {
  return api.get(`${resource}/?search=${encodeURIComponent(query)}`).json();
}

// Get display name for any resource type
export function getResourceDisplayName(item: SWAPIResource): string {
  if ("name" in item) return item.name;
  if ("title" in item) return item.title;
  return "Unknown";
}

export interface GlobalSearchResult {
  type: ResourceType;
  item: SWAPIResource;
}

export async function searchAllResources(query: string): Promise<GlobalSearchResult[]> {
  const promises = ALL_RESOURCE_TYPES.map(async (type) => {
    try {
      const response = await searchResource<SWAPIResource>(type, query);
      return response.results.map(item => ({ type, item }));
    } catch {
      return [];
    }
  });

  const results = await Promise.all(promises);
  return results.flat();
}
