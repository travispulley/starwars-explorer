import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import {
  SWAPI_BASE,
  ALL_RESOURCE_TYPES,
  getResourceDisplayName,
  type Person,
  type Planet,
  type Film,
  type Species,
  type Vehicle,
  type Starship,
  type ResourceType,
} from "./api";

describe("api constants", () => {
  test("SWAPI_BASE is correct URL", () => {
    expect(SWAPI_BASE).toBe("https://swapi.py4e.com/api");
  });

  test("ALL_RESOURCE_TYPES contains all 6 resource types", () => {
    expect(ALL_RESOURCE_TYPES).toHaveLength(6);
    expect(ALL_RESOURCE_TYPES).toContain("people");
    expect(ALL_RESOURCE_TYPES).toContain("planets");
    expect(ALL_RESOURCE_TYPES).toContain("films");
    expect(ALL_RESOURCE_TYPES).toContain("species");
    expect(ALL_RESOURCE_TYPES).toContain("vehicles");
    expect(ALL_RESOURCE_TYPES).toContain("starships");
  });
});

describe("getResourceDisplayName", () => {
  test("returns name for Person", () => {
    const person: Person = {
      name: "Luke Skywalker",
      height: "172",
      mass: "77",
      hair_color: "blond",
      skin_color: "fair",
      eye_color: "blue",
      birth_year: "19BBY",
      gender: "male",
      homeworld: "https://swapi.py4e.com/api/planets/1/",
      films: [],
      species: [],
      vehicles: [],
      starships: [],
      url: "https://swapi.py4e.com/api/people/1/",
    };
    expect(getResourceDisplayName(person)).toBe("Luke Skywalker");
  });

  test("returns name for Planet", () => {
    const planet: Planet = {
      name: "Tatooine",
      rotation_period: "23",
      orbital_period: "304",
      diameter: "10465",
      climate: "arid",
      gravity: "1 standard",
      terrain: "desert",
      surface_water: "1",
      population: "200000",
      residents: [],
      films: [],
      url: "https://swapi.py4e.com/api/planets/1/",
    };
    expect(getResourceDisplayName(planet)).toBe("Tatooine");
  });

  test("returns title for Film", () => {
    const film: Film = {
      title: "A New Hope",
      episode_id: 4,
      opening_crawl: "It is a period of civil war...",
      director: "George Lucas",
      producer: "Gary Kurtz, Rick McCallum",
      release_date: "1977-05-25",
      characters: [],
      planets: [],
      starships: [],
      vehicles: [],
      species: [],
      url: "https://swapi.py4e.com/api/films/1/",
    };
    expect(getResourceDisplayName(film)).toBe("A New Hope");
  });

  test("returns name for Species", () => {
    const species: Species = {
      name: "Wookiee",
      classification: "mammal",
      designation: "sentient",
      average_height: "210",
      skin_colors: "gray",
      hair_colors: "black, brown",
      eye_colors: "blue, green, yellow",
      average_lifespan: "400",
      homeworld: "https://swapi.py4e.com/api/planets/14/",
      language: "Shyriiwook",
      people: [],
      films: [],
      url: "https://swapi.py4e.com/api/species/3/",
    };
    expect(getResourceDisplayName(species)).toBe("Wookiee");
  });

  test("returns name for Vehicle", () => {
    const vehicle: Vehicle = {
      name: "Sand Crawler",
      model: "Digger Crawler",
      manufacturer: "Corellia Mining Corporation",
      cost_in_credits: "150000",
      length: "36.8",
      max_atmosphering_speed: "30",
      crew: "46",
      passengers: "30",
      cargo_capacity: "50000",
      consumables: "2 months",
      vehicle_class: "wheeled",
      pilots: [],
      films: [],
      url: "https://swapi.py4e.com/api/vehicles/4/",
    };
    expect(getResourceDisplayName(vehicle)).toBe("Sand Crawler");
  });

  test("returns name for Starship", () => {
    const starship: Starship = {
      name: "Millennium Falcon",
      model: "YT-1300 light freighter",
      manufacturer: "Corellian Engineering Corporation",
      cost_in_credits: "100000",
      length: "34.37",
      max_atmosphering_speed: "1050",
      crew: "4",
      passengers: "6",
      cargo_capacity: "100000",
      consumables: "2 months",
      hyperdrive_rating: "0.5",
      MGLT: "75",
      starship_class: "Light freighter",
      pilots: [],
      films: [],
      url: "https://swapi.py4e.com/api/starships/10/",
    };
    expect(getResourceDisplayName(starship)).toBe("Millennium Falcon");
  });

  test("returns Unknown for item without name or title", () => {
    const unknownItem = {
      url: "https://swapi.py4e.com/api/unknown/1/",
    } as any;
    expect(getResourceDisplayName(unknownItem)).toBe("Unknown");
  });
});

describe("ResourceType type", () => {
  test("valid resource types are accepted", () => {
    const types: ResourceType[] = [
      "people",
      "planets",
      "films",
      "species",
      "vehicles",
      "starships",
    ];
    expect(types).toHaveLength(6);
  });
});
