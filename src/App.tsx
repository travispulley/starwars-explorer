import "./index.css";
import { useEffect, useState, useRef } from "react";
import { useSWAPIStore } from "@/store/swapi";
import {
  type ResourceType,
  type SWAPIResource,
  fetchByUrl,
  getResourceDisplayName,
  ALL_RESOURCE_TYPES,
} from "@/lib/api";
import {
  type EntityWithType,
  registerGlobalSetters,
  unregisterGlobalSetters,
  getDetailParam,
  parseDetailParam,
} from "@/lib/url-helpers";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, X, ArrowLeft } from "lucide-react";
import { ResourceCard, resourceIcons } from "@/components/ResourceCard";
import { Pagination } from "@/components/Pagination";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48] as const;

export function App() {
  const {
    currentResource,
    data,
    loading,
    error,
    page,
    itemsPerPage,
    globalSearchQuery,
    globalSearchResults,
    globalSearchLoading,
    setCurrentResource,
    setPage,
    setItemsPerPage,
    fetchData,
    setGlobalSearchQuery,
    globalSearch,
    clearGlobalSearch,
  } = useSWAPIStore();

  const [localGlobalQuery, setLocalGlobalQuery] = useState(globalSearchQuery);
  const [selectedEntity, setSelectedEntity] = useState<EntityWithType | null>(null);
  const [detailViewEntity, setDetailViewEntity] = useState<EntityWithType | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Register global setters for entity modal and detail view
  useEffect(() => {
    registerGlobalSetters(setSelectedEntity, setDetailViewEntity);
    return () => unregisterGlobalSetters();
  }, []);

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Read type
    const typeParam = params.get("type") as ResourceType;
    if (typeParam && ALL_RESOURCE_TYPES.includes(typeParam)) {
      setCurrentResource(typeParam);
    }

    // Read page
    const pageParam = params.get("page");
    if (pageParam) {
      const pageNum = parseInt(pageParam, 10);
      if (!isNaN(pageNum) && pageNum > 0) setPage(pageNum);
    }

    // Read search query
    const q = params.get("q");
    if (q) {
      setLocalGlobalQuery(q);
      setGlobalSearchQuery(q);
      globalSearch();
    }

    // Read detail view
    const detail = params.get("detail");
    if (detail) {
      const parsed = parseDetailParam(detail);
      if (parsed) {
        fetchByUrl<SWAPIResource>(parsed.url).then(item => {
          setDetailViewEntity({ item, type: parsed.type });
        });
      }
    }

    // Fetch data if not searching or viewing detail
    if (!q && !detail) {
      fetchData();
    }
  }, []);

  // Debounced global search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (localGlobalQuery !== globalSearchQuery) {
        setGlobalSearchQuery(localGlobalQuery);
        if (localGlobalQuery.trim()) {
          globalSearch();
        } else {
          clearGlobalSearch();
        }
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localGlobalQuery]);

  // Update URL when state changes
  const isInitialMount = useRef(true);
  useEffect(() => {
    // Skip on initial mount to avoid overwriting URL params we just read
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams();

    if (detailViewEntity) {
      // Detail view - only need detail param
      params.set("detail", getDetailParam(detailViewEntity.item));
    } else {
      // Normal view
      if (currentResource !== "people") params.set("type", currentResource);
      if (page > 1) params.set("page", String(page));
      if (globalSearchQuery) params.set("q", globalSearchQuery);
    }

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.pushState({}, "", newUrl);
  }, [currentResource, page, globalSearchQuery, detailViewEntity]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);

      // Check for detail view first
      const detail = params.get("detail");
      if (detail) {
        const parsed = parseDetailParam(detail);
        if (parsed) {
          fetchByUrl<SWAPIResource>(parsed.url).then(item => {
            setDetailViewEntity({ item, type: parsed.type });
          });
        }
        return;
      }

      // Clear detail view if not in URL
      setDetailViewEntity(null);

      // Read type
      const typeParam = params.get("type") as ResourceType;
      if (typeParam && ALL_RESOURCE_TYPES.includes(typeParam)) {
        setCurrentResource(typeParam);
      } else {
        setCurrentResource("people");
      }

      // Read page
      const pageParam = params.get("page");
      if (pageParam) {
        const pageNum = parseInt(pageParam, 10);
        if (!isNaN(pageNum) && pageNum > 0) setPage(pageNum);
      } else {
        setPage(1);
      }

      // Read search query
      const q = params.get("q");
      if (q) {
        setLocalGlobalQuery(q);
        setGlobalSearchQuery(q);
        globalSearch();
      } else {
        setLocalGlobalQuery("");
        clearGlobalSearch();
        fetchData();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const totalItems = data?.count ?? 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const visibleItems = data?.results ?? [];

  const showGlobalResults = globalSearchResults.length > 0 || globalSearchLoading;

  return (
    <div className="min-h-screen w-full max-w-6xl mx-auto p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
          Star Wars Explorer
        </h1>
      </header>

      {/* Detail View - Single Item */}
      {detailViewEntity ? (
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => setDetailViewEntity(null)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to list
          </Button>
          <div className="max-w-md mx-auto">
            <ResourceCard
              resource={detailViewEntity.item}
              type={detailViewEntity.type}
            />
          </div>
        </div>
      ) : (
      <>
      <Tabs value={currentResource} onValueChange={(v) => setCurrentResource(v as ResourceType)} className="mb-6">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
          {(Object.keys(resourceIcons) as ResourceType[]).map((resource) => (
            <TabsTrigger key={resource} value={resource} className="flex items-center gap-2 capitalize">
              {resourceIcons[resource]}
              <span className="hidden sm:inline">{resource}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={localGlobalQuery}
            onChange={(e) => setLocalGlobalQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {localGlobalQuery && (
          <Button
            variant="outline"
            onClick={() => {
              setLocalGlobalQuery("");
              clearGlobalSearch();
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        <Select value={String(itemsPerPage)} onValueChange={(v) => setItemsPerPage(Number(v))}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ITEMS_PER_PAGE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} per page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6 text-destructive">
            Error: {error}
          </CardContent>
        </Card>
      )}

      {/* Global Search Results */}
      {showGlobalResults ? (
        globalSearchLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Found {globalSearchResults.length} results across all types
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {globalSearchResults.map((result, index) => (
                <div key={index} className="relative">
                  <Badge className="absolute top-2 right-2 z-10 capitalize">
                    {result.type}
                  </Badge>
                  <ResourceCard resource={result.item} type={result.type} />
                </div>
              ))}
            </div>

            {globalSearchResults.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No results found across any type. Try a different search term.
                </CardContent>
              </Card>
            )}
          </>
        )
      ) : loading ? (
        <LoadingSkeleton />
      ) : data && data.results.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Found {data.count} {currentResource}
              {totalPages > 1 && ` • Page ${page} of ${totalPages}`}
            </p>
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleItems.map((item, index) => (
              <ResourceCard key={index} resource={item} type={currentResource} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No {currentResource} found. Try a different search term.
          </CardContent>
        </Card>
      )}
      </>
      )}

      {/* Entity Detail Modal */}
      <Dialog open={selectedEntity !== null} onOpenChange={(open) => !open && setSelectedEntity(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-transparent border-none shadow-none">
          <DialogTitle className="sr-only">
            {selectedEntity ? getResourceDisplayName(selectedEntity.item) : "Entity Details"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detailed information about this Star Wars entity
          </DialogDescription>
          {selectedEntity && (
            <ResourceCard
              resource={selectedEntity.item}
              type={selectedEntity.type}
              disableBadges
              onViewFull={() => {
                setDetailViewEntity(selectedEntity);
                setSelectedEntity(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <footer className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
        <p>
          Powered by{" "}
          <a href="https://swapi.py4e.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">SWAPI</a>,{" "}
          <a href="https://zustand-demo.pmnd.rs/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">Zustand</a>,{" "}
          <a href="https://github.com/sindresorhus/ky" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">Ky</a>, and{" "}
          <a href="https://ui.shadcn.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">shadcn/ui</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
