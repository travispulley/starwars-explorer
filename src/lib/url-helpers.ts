import { type ResourceType, type SWAPIResource, ALL_RESOURCE_TYPES, SWAPI_BASE } from "@/lib/api";

// Entity with type for detail view/modal
export interface EntityWithType {
  item: SWAPIResource;
  type: ResourceType;
}

// Global state setters for entity modal and detail view
export let setGlobalSelectedEntity: ((entity: EntityWithType | null) => void) | null = null;
export let setGlobalDetailView: ((entity: EntityWithType | null) => void) | null = null;

export function registerGlobalSetters(
  setSelected: (entity: EntityWithType | null) => void,
  setDetail: (entity: EntityWithType | null) => void
) {
  setGlobalSelectedEntity = setSelected;
  setGlobalDetailView = setDetail;
}

export function unregisterGlobalSetters() {
  setGlobalSelectedEntity = null;
  setGlobalDetailView = null;
}

// Extract resource type from SWAPI URL
export function getResourceTypeFromUrl(url: string): ResourceType | null {
  const match = url.match(/\/api\/(\w+)\//);
  const type = match?.[1];
  if (type && ["people", "planets", "films", "species", "vehicles", "starships"].includes(type)) {
    return type as ResourceType;
  }
  return null;
}

// Extract detail param from SWAPI resource: "https://swapi.py4e.com/api/people/1/" -> "people/1"
export function getDetailParam(item: SWAPIResource): string {
  const url = item.url;
  const match = url.match(/\/api\/(\w+)\/(\d+)\//);
  return match ? `${match[1]}/${match[2]}` : "";
}

// Parse detail param back to fetchable URL
export function parseDetailParam(param: string): { type: ResourceType; url: string } | null {
  const match = param.match(/^(\w+)\/(\d+)$/);
  if (!match) return null;
  const type = match[1] as ResourceType;
  if (!ALL_RESOURCE_TYPES.includes(type)) return null;
  return { type, url: `${SWAPI_BASE}/${type}/${match[2]}/` };
}
