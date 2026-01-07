import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type ResourceType,
  type SWAPIResource,
  type SWAPIListResponse,
  type GlobalSearchResult,
  fetchResource,
  searchAllResources,
  getResourceDisplayName,
} from "@/lib/api";

type CacheKey = `${ResourceType}-${number}-${number}`;
type ApiPageCacheKey = `${ResourceType}-api-${number}`;

interface CachedData {
  [key: string]: SWAPIListResponse<SWAPIResource>;
}

interface ApiPageCache {
  [key: ApiPageCacheKey]: SWAPIListResponse<SWAPIResource>;
}

interface SWAPIState {
  currentResource: ResourceType;
  data: SWAPIListResponse<SWAPIResource> | null;
  loading: boolean;
  error: string | null;
  page: number;
  itemsPerPage: number;
  cache: CachedData;
  apiPageCache: ApiPageCache;

  // Global search
  globalSearchQuery: string;
  globalSearchResults: GlobalSearchResult[];
  globalSearchLoading: boolean;

  setCurrentResource: (resource: ResourceType) => void;
  setPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  fetchData: () => Promise<void>;
  setGlobalSearchQuery: (query: string) => void;
  globalSearch: () => Promise<void>;
  clearGlobalSearch: () => void;
}

const API_PAGE_SIZE = 10;

export const useSWAPIStore = create<SWAPIState>()(
  persist(
    (set, get) => ({
      currentResource: "people",
      data: null,
      loading: false,
      error: null,
      page: 1,
      itemsPerPage: 24,
      cache: {},
      apiPageCache: {},

      // Global search state
      globalSearchQuery: "",
      globalSearchResults: [],
      globalSearchLoading: false,

      setCurrentResource: (resource) => {
        const { itemsPerPage, cache } = get();
        const cacheKey: CacheKey = `${resource}-1-${itemsPerPage}`;
        const cached = cache[cacheKey];
        set({
          currentResource: resource,
          page: 1,
          data: cached || null,
          loading: !cached,
          // Clear global search when changing resource
          globalSearchQuery: "",
          globalSearchResults: [],
        });
        get().fetchData();
      },

      setPage: (page) => {
        const { currentResource, itemsPerPage, cache } = get();
        const cacheKey: CacheKey = `${currentResource}-${page}-${itemsPerPage}`;
        const cached = cache[cacheKey];

        set({
          page,
          data: cached || get().data,
          loading: !cached,
        });

        get().fetchData();
      },

      setItemsPerPage: (itemsPerPage) => {
        set({ itemsPerPage, page: 1 });
        get().fetchData();
      },

      fetchData: async () => {
        const { currentResource, page, itemsPerPage, cache, apiPageCache } = get();
        const cacheKey: CacheKey = `${currentResource}-${page}-${itemsPerPage}`;
        const cached = cache[cacheKey];

        // Capture the resource we're fetching for to detect stale responses
        const fetchingResource = currentResource;
        const fetchingPage = page;

        // Show cached data immediately if available
        if (cached && !get().data) {
          set({ data: cached, loading: true });
        } else if (!cached) {
          set({ loading: true, error: null });
        }

        // Helper to fetch or get from cache
        const fetchApiPage = async (apiPage: number): Promise<SWAPIListResponse<SWAPIResource>> => {
          const apiCacheKey: ApiPageCacheKey = `${fetchingResource}-api-${apiPage}`;
          const cachedApiPage = get().apiPageCache[apiCacheKey];
          if (cachedApiPage) {
            return cachedApiPage;
          }
          const response = await fetchResource<SWAPIResource>(fetchingResource, apiPage);
          // Cache the API page response
          set((state) => ({
            apiPageCache: {
              ...state.apiPageCache,
              [apiCacheKey]: response,
            },
          }));
          return response;
        };

        try {
          // Calculate which API pages we need
          const startItem = (fetchingPage - 1) * itemsPerPage;
          const endItem = startItem + itemsPerPage;
          const startApiPage = Math.floor(startItem / API_PAGE_SIZE) + 1;
          const endApiPage = Math.ceil(endItem / API_PAGE_SIZE);

          // Fetch first page to get total count
          const firstPage = await fetchApiPage(startApiPage);

          // Check if resource changed while fetching - abort if stale
          if (get().currentResource !== fetchingResource || get().page !== fetchingPage) {
            return;
          }

          let allResults = [...firstPage.results];

          // Calculate max valid API page based on total count
          const maxApiPage = Math.ceil(firstPage.count / API_PAGE_SIZE);
          const actualEndApiPage = Math.min(endApiPage, maxApiPage);

          // Fetch additional pages if needed (only pages that exist)
          const additionalPageNumbers: number[] = [];
          for (let p = startApiPage + 1; p <= actualEndApiPage; p++) {
            additionalPageNumbers.push(p);
          }

          if (additionalPageNumbers.length > 0) {
            const additionalPages = await Promise.all(
              additionalPageNumbers.map(p => fetchApiPage(p))
            );

            // Check again after additional fetches
            if (get().currentResource !== fetchingResource || get().page !== fetchingPage) {
              return;
            }

            for (const pageData of additionalPages) {
              allResults = [...allResults, ...pageData.results];
            }
          }

          // Slice to get exactly the items we need for this page
          const offsetInFirstPage = startItem % API_PAGE_SIZE;
          const slicedResults = allResults.slice(offsetInFirstPage, offsetInFirstPage + itemsPerPage);

          // Sort alphabetically by display name
          slicedResults.sort((a, b) =>
            getResourceDisplayName(a).localeCompare(getResourceDisplayName(b))
          );

          const data: SWAPIListResponse<SWAPIResource> = {
            count: firstPage.count,
            next: endItem < firstPage.count ? `page=${page + 1}` : null,
            previous: page > 1 ? `page=${page - 1}` : null,
            results: slicedResults,
          };

          // Final check before setting state
          if (get().currentResource !== fetchingResource || get().page !== fetchingPage) {
            return;
          }

          set((state) => ({
            data,
            loading: false,
            cache: {
              ...state.cache,
              [cacheKey]: data,
            },
          }));
        } catch (err) {
          // Only set error if still on same resource/page
          if (get().currentResource !== fetchingResource || get().page !== fetchingPage) {
            return;
          }

          if (cached) {
            set({ data: cached, loading: false });
          } else {
            set({
              error: err instanceof Error ? err.message : "Failed to fetch data",
              loading: false,
            });
          }
        }
      },

      setGlobalSearchQuery: (query) => {
        set({ globalSearchQuery: query });
      },

      globalSearch: async () => {
        const { globalSearchQuery } = get();
        if (!globalSearchQuery.trim()) {
          set({ globalSearchResults: [], globalSearchLoading: false });
          return;
        }

        set({ globalSearchLoading: true });

        try {
          const results = await searchAllResources(globalSearchQuery);
          set({ globalSearchResults: results, globalSearchLoading: false });
        } catch {
          set({ globalSearchResults: [], globalSearchLoading: false });
        }
      },

      clearGlobalSearch: () => {
        set({ globalSearchQuery: "", globalSearchResults: [], globalSearchLoading: false });
      },
    }),
    {
      name: "swapi-cache",
      partialize: (state) => ({
        cache: state.cache,
        apiPageCache: state.apiPageCache,
        itemsPerPage: state.itemsPerPage
      }),
    }
  )
);
