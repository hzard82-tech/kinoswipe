import type { Catalog, SwipesMap } from '../types';

const CATALOG_KEY = 'kino-catalog-v1';
const SWIPES_KEY = 'kino-swipes-v1';
const API_KEY_KEY = 'kino-tmdb-key';

export function loadCatalog(): Catalog | null {
  try {
    const raw = localStorage.getItem(CATALOG_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Catalog;
  } catch {
    return null;
  }
}

export function saveCatalog(catalog: Catalog): void {
  localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));
}

export function loadSwipes(): SwipesMap {
  try {
    const raw = localStorage.getItem(SWIPES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SwipesMap;
  } catch {
    return {};
  }
}

export function saveSwipes(swipes: SwipesMap): void {
  localStorage.setItem(SWIPES_KEY, JSON.stringify(swipes));
}

export function clearSwipes(): void {
  localStorage.removeItem(SWIPES_KEY);
}

export function loadApiKey(): string | null {
  return localStorage.getItem(API_KEY_KEY);
}

export function saveApiKey(key: string): void {
  localStorage.setItem(API_KEY_KEY, key);
}

export function clearApiKey(): void {
  localStorage.removeItem(API_KEY_KEY);
}
