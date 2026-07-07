export interface Movie {
  id: number;
  title: string;
  year: string;
  rating: number;
  voteCount: number;
  posterPath: string | null;
  genres: string[];
}

export type Direction = 'right' | 'left' | 'up' | 'down';

export type Category = 'watchlist' | 'not_interested' | 'liked' | 'disliked';

export const DIRECTION_TO_CATEGORY: Record<Direction, Category> = {
  right: 'watchlist',
  left: 'not_interested',
  up: 'liked',
  down: 'disliked',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  watchlist: 'Буду смотреть',
  not_interested: 'Не интересно',
  liked: 'Понравилось',
  disliked: 'Не понравилось',
};

export interface SwipeRecord {
  direction: Direction;
  timestamp: number;
}

export type SwipesMap = Record<number, SwipeRecord>;

export interface Catalog {
  movies: Movie[];
  loadedAt: number;
}
