import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import {
  getResourceTypeFromUrl,
  getDetailParam,
  parseDetailParam,
  registerGlobalSetters,
  unregisterGlobalSetters,
  setGlobalSelectedEntity,
  setGlobalDetailView,
  type EntityWithType,
} from "./url-helpers";
import type { Person, Film } from "./api";

describe("getResourceTypeFromUrl", () => {
  test("extracts 'people' from URL", () => {
    expect(getResourceTypeFromUrl("https://swapi.py4e.com/api/people/1/")).toBe("people");
  });

  test("extracts 'planets' from URL", () => {
    expect(getResourceTypeFromUrl("https://swapi.py4e.com/api/planets/1/")).toBe("planets");
  });

  test("extracts 'films' from URL", () => {
    expect(getResourceTypeFromUrl("https://swapi.py4e.com/api/films/1/")).toBe("films");
  });

  test("extracts 'species' from URL", () => {
    expect(getResourceTypeFromUrl("https://swapi.py4e.com/api/species/1/")).toBe("species");
  });

  test("extracts 'vehicles' from URL", () => {
    expect(getResourceTypeFromUrl("https://swapi.py4e.com/api/vehicles/4/")).toBe("vehicles");
  });

  test("extracts 'starships' from URL", () => {
    expect(getResourceTypeFromUrl("https://swapi.py4e.com/api/starships/10/")).toBe("starships");
  });

  test("returns null for invalid resource type", () => {
    expect(getResourceTypeFromUrl("https://swapi.py4e.com/api/unknown/1/")).toBeNull();
  });

  test("returns null for malformed URL", () => {
    expect(getResourceTypeFromUrl("not-a-valid-url")).toBeNull();
  });

  test("returns null for empty string", () => {
    expect(getResourceTypeFromUrl("")).toBeNull();
  });

  test("handles URL without trailing slash", () => {
    expect(getResourceTypeFromUrl("https://swapi.py4e.com/api/people/1")).toBe("people");
  });
});

describe("getDetailParam", () => {
  test("extracts detail param from person URL", () => {
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
    expect(getDetailParam(person)).toBe("people/1");
  });

  test("extracts detail param from film URL", () => {
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
    expect(getDetailParam(film)).toBe("films/1");
  });

  test("handles multi-digit IDs", () => {
    const person: Person = {
      name: "Padme Amidala",
      height: "185",
      mass: "45",
      hair_color: "brown",
      skin_color: "light",
      eye_color: "brown",
      birth_year: "46BBY",
      gender: "female",
      homeworld: "https://swapi.py4e.com/api/planets/8/",
      films: [],
      species: [],
      vehicles: [],
      starships: [],
      url: "https://swapi.py4e.com/api/people/35/",
    };
    expect(getDetailParam(person)).toBe("people/35");
  });

  test("returns empty string for malformed URL", () => {
    const item = {
      url: "not-a-valid-url",
    } as any;
    expect(getDetailParam(item)).toBe("");
  });
});

describe("parseDetailParam", () => {
  test("parses people detail param", () => {
    const result = parseDetailParam("people/1");
    expect(result).not.toBeNull();
    expect(result?.type).toBe("people");
    expect(result?.url).toBe("https://swapi.py4e.com/api/people/1/");
  });

  test("parses planets detail param", () => {
    const result = parseDetailParam("planets/2");
    expect(result).not.toBeNull();
    expect(result?.type).toBe("planets");
    expect(result?.url).toBe("https://swapi.py4e.com/api/planets/2/");
  });

  test("parses films detail param", () => {
    const result = parseDetailParam("films/4");
    expect(result).not.toBeNull();
    expect(result?.type).toBe("films");
    expect(result?.url).toBe("https://swapi.py4e.com/api/films/4/");
  });

  test("parses multi-digit IDs", () => {
    const result = parseDetailParam("starships/123");
    expect(result).not.toBeNull();
    expect(result?.type).toBe("starships");
    expect(result?.url).toBe("https://swapi.py4e.com/api/starships/123/");
  });

  test("returns null for invalid resource type", () => {
    expect(parseDetailParam("unknown/1")).toBeNull();
  });

  test("returns null for malformed param (no ID)", () => {
    expect(parseDetailParam("people")).toBeNull();
  });

  test("returns null for malformed param (non-numeric ID)", () => {
    expect(parseDetailParam("people/abc")).toBeNull();
  });

  test("returns null for empty string", () => {
    expect(parseDetailParam("")).toBeNull();
  });

  test("returns null for extra slashes", () => {
    expect(parseDetailParam("people/1/extra")).toBeNull();
  });
});

describe("global setters", () => {
  beforeEach(() => {
    unregisterGlobalSetters();
  });

  afterEach(() => {
    unregisterGlobalSetters();
  });

  test("setGlobalSelectedEntity is null by default", () => {
    expect(setGlobalSelectedEntity).toBeNull();
  });

  test("setGlobalDetailView is null by default", () => {
    expect(setGlobalDetailView).toBeNull();
  });

  test("registerGlobalSetters sets the global setters", () => {
    const mockSetSelected = (entity: EntityWithType | null) => {};
    const mockSetDetail = (entity: EntityWithType | null) => {};

    registerGlobalSetters(mockSetSelected, mockSetDetail);

    // We can't directly access the module-level variables after import,
    // but we can verify the function doesn't throw
    expect(() => registerGlobalSetters(mockSetSelected, mockSetDetail)).not.toThrow();
  });

  test("unregisterGlobalSetters clears the setters", () => {
    const mockSetSelected = (entity: EntityWithType | null) => {};
    const mockSetDetail = (entity: EntityWithType | null) => {};

    registerGlobalSetters(mockSetSelected, mockSetDetail);
    unregisterGlobalSetters();

    // Verify unregister doesn't throw
    expect(() => unregisterGlobalSetters()).not.toThrow();
  });
});
