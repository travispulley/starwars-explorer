import { describe, expect, test, beforeEach, mock, spyOn } from "bun:test";
import { useSWAPIStore } from "./swapi";

// Reset store before each test
beforeEach(() => {
  useSWAPIStore.setState({
    currentResource: "people",
    data: null,
    loading: false,
    error: null,
    page: 1,
    itemsPerPage: 24,
    cache: {},
    apiPageCache: {},
    globalSearchQuery: "",
    globalSearchResults: [],
    globalSearchLoading: false,
  });
});

describe("useSWAPIStore initial state", () => {
  test("has correct initial currentResource", () => {
    expect(useSWAPIStore.getState().currentResource).toBe("people");
  });

  test("has null initial data", () => {
    expect(useSWAPIStore.getState().data).toBeNull();
  });

  test("has false initial loading", () => {
    expect(useSWAPIStore.getState().loading).toBe(false);
  });

  test("has null initial error", () => {
    expect(useSWAPIStore.getState().error).toBeNull();
  });

  test("has correct initial page", () => {
    expect(useSWAPIStore.getState().page).toBe(1);
  });

  test("has correct initial itemsPerPage", () => {
    expect(useSWAPIStore.getState().itemsPerPage).toBe(24);
  });

  test("has empty initial cache", () => {
    expect(useSWAPIStore.getState().cache).toEqual({});
  });

  test("has empty initial apiPageCache", () => {
    expect(useSWAPIStore.getState().apiPageCache).toEqual({});
  });

  test("has empty initial globalSearchQuery", () => {
    expect(useSWAPIStore.getState().globalSearchQuery).toBe("");
  });

  test("has empty initial globalSearchResults", () => {
    expect(useSWAPIStore.getState().globalSearchResults).toEqual([]);
  });

  test("has false initial globalSearchLoading", () => {
    expect(useSWAPIStore.getState().globalSearchLoading).toBe(false);
  });
});

describe("setCurrentResource", () => {
  test("updates currentResource", () => {
    useSWAPIStore.getState().setCurrentResource("planets");
    expect(useSWAPIStore.getState().currentResource).toBe("planets");
  });

  test("resets page to 1", () => {
    useSWAPIStore.setState({ page: 5 });
    useSWAPIStore.getState().setCurrentResource("films");
    expect(useSWAPIStore.getState().page).toBe(1);
  });

  test("clears global search query", () => {
    useSWAPIStore.setState({ globalSearchQuery: "luke" });
    useSWAPIStore.getState().setCurrentResource("species");
    expect(useSWAPIStore.getState().globalSearchQuery).toBe("");
  });

  test("clears global search results", () => {
    useSWAPIStore.setState({
      globalSearchResults: [{ type: "people", item: { name: "Luke", url: "" } as any }],
    });
    useSWAPIStore.getState().setCurrentResource("vehicles");
    expect(useSWAPIStore.getState().globalSearchResults).toEqual([]);
  });

  test("sets loading to true when no cache", () => {
    useSWAPIStore.getState().setCurrentResource("starships");
    expect(useSWAPIStore.getState().loading).toBe(true);
  });

  test("uses cached data if available", () => {
    const cachedData = {
      count: 10,
      next: null,
      previous: null,
      results: [{ name: "Tatooine", url: "https://swapi.py4e.com/api/planets/1/" }],
    };
    useSWAPIStore.setState({
      cache: { "planets-1-24": cachedData as any },
    });
    useSWAPIStore.getState().setCurrentResource("planets");
    expect(useSWAPIStore.getState().data).toEqual(cachedData);
    expect(useSWAPIStore.getState().loading).toBe(false);
  });
});

describe("setPage", () => {
  test("updates page number", () => {
    useSWAPIStore.getState().setPage(3);
    expect(useSWAPIStore.getState().page).toBe(3);
  });

  test("sets loading to true when no cache for new page", () => {
    useSWAPIStore.getState().setPage(2);
    expect(useSWAPIStore.getState().loading).toBe(true);
  });

  test("uses cached data for page if available", () => {
    const cachedData = {
      count: 50,
      next: "page=3",
      previous: "page=1",
      results: [{ name: "Darth Vader", url: "https://swapi.py4e.com/api/people/4/" }],
    };
    useSWAPIStore.setState({
      cache: { "people-2-24": cachedData as any },
    });
    useSWAPIStore.getState().setPage(2);
    expect(useSWAPIStore.getState().data).toEqual(cachedData);
    expect(useSWAPIStore.getState().loading).toBe(false);
  });
});

describe("setItemsPerPage", () => {
  test("updates itemsPerPage", () => {
    useSWAPIStore.getState().setItemsPerPage(12);
    expect(useSWAPIStore.getState().itemsPerPage).toBe(12);
  });

  test("resets page to 1", () => {
    useSWAPIStore.setState({ page: 3 });
    useSWAPIStore.getState().setItemsPerPage(48);
    expect(useSWAPIStore.getState().page).toBe(1);
  });
});

describe("setGlobalSearchQuery", () => {
  test("updates globalSearchQuery", () => {
    useSWAPIStore.getState().setGlobalSearchQuery("vader");
    expect(useSWAPIStore.getState().globalSearchQuery).toBe("vader");
  });

  test("handles empty string", () => {
    useSWAPIStore.setState({ globalSearchQuery: "luke" });
    useSWAPIStore.getState().setGlobalSearchQuery("");
    expect(useSWAPIStore.getState().globalSearchQuery).toBe("");
  });
});

describe("clearGlobalSearch", () => {
  test("clears globalSearchQuery", () => {
    useSWAPIStore.setState({ globalSearchQuery: "yoda" });
    useSWAPIStore.getState().clearGlobalSearch();
    expect(useSWAPIStore.getState().globalSearchQuery).toBe("");
  });

  test("clears globalSearchResults", () => {
    useSWAPIStore.setState({
      globalSearchResults: [{ type: "people", item: { name: "Yoda", url: "" } as any }],
    });
    useSWAPIStore.getState().clearGlobalSearch();
    expect(useSWAPIStore.getState().globalSearchResults).toEqual([]);
  });

  test("sets globalSearchLoading to false", () => {
    useSWAPIStore.setState({ globalSearchLoading: true });
    useSWAPIStore.getState().clearGlobalSearch();
    expect(useSWAPIStore.getState().globalSearchLoading).toBe(false);
  });
});

describe("globalSearch with empty query", () => {
  test("clears results when query is empty", async () => {
    useSWAPIStore.setState({
      globalSearchQuery: "",
      globalSearchResults: [{ type: "people", item: { name: "Luke", url: "" } as any }],
    });
    await useSWAPIStore.getState().globalSearch();
    expect(useSWAPIStore.getState().globalSearchResults).toEqual([]);
  });

  test("clears results when query is only whitespace", async () => {
    useSWAPIStore.setState({
      globalSearchQuery: "   ",
      globalSearchResults: [{ type: "people", item: { name: "Luke", url: "" } as any }],
    });
    await useSWAPIStore.getState().globalSearch();
    expect(useSWAPIStore.getState().globalSearchResults).toEqual([]);
  });

  test("sets globalSearchLoading to false", async () => {
    useSWAPIStore.setState({
      globalSearchQuery: "",
      globalSearchLoading: true,
    });
    await useSWAPIStore.getState().globalSearch();
    expect(useSWAPIStore.getState().globalSearchLoading).toBe(false);
  });
});

describe("cache key format", () => {
  test("cache key format is resource-page-itemsPerPage", () => {
    const cachedData = {
      count: 10,
      next: null,
      previous: null,
      results: [],
    };

    // Setting up cache with specific key
    useSWAPIStore.setState({
      cache: { "people-1-24": cachedData as any },
      currentResource: "people",
      page: 1,
      itemsPerPage: 24,
    });

    // Verify the key format works
    const state = useSWAPIStore.getState();
    const cacheKey = `${state.currentResource}-${state.page}-${state.itemsPerPage}`;
    expect(cacheKey).toBe("people-1-24");
    expect(state.cache[cacheKey]).toEqual(cachedData);
  });
});
