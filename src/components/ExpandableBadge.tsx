import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Loader2 } from "lucide-react";
import { type SWAPIResource, fetchByUrl, getResourceDisplayName } from "@/lib/api";
import { getResourceTypeFromUrl, setGlobalSelectedEntity } from "@/lib/url-helpers";

// Cache for related item fetches
const relatedItemsCache = new Map<string, SWAPIResource>();

interface FetchedItem {
  url: string;
  item: SWAPIResource;
}

interface ExpandableBadgeProps {
  urls: string[];
  label: string;
  disabled?: boolean;
}

export function ExpandableBadge({ urls, label, disabled = false }: ExpandableBadgeProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<FetchedItem[]>([]);

  const count = urls.length;

  if (count === 0) return null;

  // When disabled, just show static badge
  if (disabled) {
    return (
      <Badge variant="outline">
        {count} {label}
      </Badge>
    );
  }

  const handleClick = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }

    // Check if we already have the items
    if (items.length === count) {
      setExpanded(true);
      return;
    }

    setLoading(true);
    setExpanded(true);

    try {
      const fetchedItems = await Promise.all(
        urls.map(async (url) => {
          // Check cache first
          if (relatedItemsCache.has(url)) {
            return { url, item: relatedItemsCache.get(url)! };
          }
          const item = await fetchByUrl<SWAPIResource>(url);
          relatedItemsCache.set(url, item);
          return { url, item };
        })
      );
      // Sort alphabetically by display name
      fetchedItems.sort((a, b) =>
        getResourceDisplayName(a.item).localeCompare(getResourceDisplayName(b.item))
      );
      setItems(fetchedItems);
    } catch {
      // Silently fail, just show what we have
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (url: string, item: SWAPIResource) => {
    const type = getResourceTypeFromUrl(url);
    if (type && setGlobalSelectedEntity) {
      setGlobalSelectedEntity({ item, type });
    }
  };

  return (
    <div className="inline-flex flex-col">
      <Badge
        variant="outline"
        className="cursor-pointer hover:bg-accent transition-colors gap-1"
        onClick={handleClick}
      >
        {count} {label}
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
        )}
      </Badge>
      {expanded && (
        <div className="mt-2 pl-2 border-l-2 border-muted text-xs flex flex-col gap-1">
          {loading ? (
            <div className="text-muted-foreground py-1">Loading...</div>
          ) : items.length > 0 ? (
            items.map(({ url, item }, i) => (
              <button
                key={i}
                className="text-muted-foreground hover:text-foreground hover:bg-accent/50 truncate max-w-[180px] text-left transition-all px-2 py-1 rounded-sm -ml-1"
                onClick={() => handleItemClick(url, item)}
              >
                {getResourceDisplayName(item)}
              </button>
            ))
          ) : (
            <div className="text-muted-foreground py-1">No data</div>
          )}
        </div>
      )}
    </div>
  );
}
