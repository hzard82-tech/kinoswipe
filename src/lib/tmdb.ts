import type { Movie } from '../types';

const BASE_URL = 'https://api.themoviedb.org/3';
export const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

const TOTAL_PAGES = 50; // 50 * 20 = 1000 movies

export class TmdbError extends Error {
  kind: 'auth' | 'network' | 'unknown';
  constructor(kind: 'auth' | 'network' | 'unknown', message: string) {
    super(message);
    this.kind = kind;
  }
}

interface TmdbGenre {
  id: number;
  name: string;
}

interface TmdbMovieResult {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  poster_path: string | null;
  genre_ids: number[];
}

interface TmdbListResponse {
  page: number;
  total_pages: number;
  results: TmdbMovieResult[];
}

interface TmdbCastMember {
  name: string;
  character: string;
  order: number;
}

interface TmdbCrewMember {
  name: string;
  job: string;
}

interface TmdbMovieDetailsResponse {
  overview: string;
  tagline: string;
  runtime: number | null;
  credits: {
    cast: TmdbCastMember[];
    crew: TmdbCrewMember[];
  };
}

export interface MovieDetails {
  overview: string;
  tagline: string;
  runtime: number | null;
  directors: string[];
  cast: { name: string; character: string }[];
}

async function tmdbFetch<T>(path: string, apiKey: string): Promise<T> {
  const separator = path.includes('?') ? '&' : '?';
  const url = `${BASE_URL}${path}${separator}api_key=${encodeURIComponent(apiKey)}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new TmdbError('network', 'Не удалось подключиться к TMDB. Проверьте интернет-соединение.');
  }

  if (response.status === 401) {
    throw new TmdbError('auth', 'Неверный API-ключ TMDB. Проверьте ключ и попробуйте снова.');
  }
  if (!response.ok) {
    throw new TmdbError('unknown', `TMDB вернул ошибку ${response.status}.`);
  }

  return (await response.json()) as T;
}

export async function fetchGenreMap(apiKey: string): Promise<Map<number, string>> {
  const data = await tmdbFetch<{ genres: TmdbGenre[] }>('/genre/movie/list?language=ru-RU', apiKey);
  return new Map(data.genres.map((g) => [g.id, g.name]));
}

export async function fetchTopRatedCatalog(
  apiKey: string,
  onProgress: (loadedPages: number, totalPages: number) => void,
): Promise<Movie[]> {
  const genreMap = await fetchGenreMap(apiKey);
  const movies: Movie[] = [];

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    const data = await tmdbFetch<TmdbListResponse>(`/movie/top_rated?language=ru-RU&page=${page}`, apiKey);

    for (const r of data.results) {
      movies.push({
        id: r.id,
        title: r.title,
        year: r.release_date ? r.release_date.slice(0, 4) : '—',
        rating: r.vote_average,
        voteCount: r.vote_count,
        posterPath: r.poster_path,
        genres: r.genre_ids.slice(0, 3).map((id) => genreMap.get(id) ?? '').filter(Boolean),
      });
    }

    onProgress(page, TOTAL_PAGES);

    if (page >= data.total_pages) break;
  }

  return movies;
}

export async function fetchMovieDetails(apiKey: string, movieId: number): Promise<MovieDetails> {
  const data = await tmdbFetch<TmdbMovieDetailsResponse>(
    `/movie/${movieId}?language=ru-RU&append_to_response=credits`,
    apiKey,
  );

  return {
    overview: data.overview,
    tagline: data.tagline,
    runtime: data.runtime,
    directors: data.credits.crew.filter((c) => c.job === 'Director').map((c) => c.name),
    cast: data.credits.cast
      .slice()
      .sort((a, b) => a.order - b.order)
      .slice(0, 8)
      .map((c) => ({ name: c.name, character: c.character })),
  };
}
