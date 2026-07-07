import type { Category, Movie } from '../types';
import { CATEGORY_LABELS } from '../types';
import { POSTER_BASE } from '../lib/tmdb';

interface Props {
  category: Category;
  movies: Movie[];
  onRequeue: (movieId: number) => void;
  onOpenDetails: (movie: Movie) => void;
}

export function CategoryGrid({ category, movies, onRequeue, onOpenDetails }: Props) {
  return (
    <div className="category-view">
      <h2 className="category-heading">
        {CATEGORY_LABELS[category]} <span className="mono">({movies.length})</span>
      </h2>
      {movies.length === 0 ? (
        <p className="hint">Пока пусто.</p>
      ) : (
        <div className="poster-grid">
          {movies.map((movie) => (
            <div key={movie.id} className="grid-item">
              <button
                type="button"
                className="grid-poster-btn"
                onClick={() => onOpenDetails(movie)}
                aria-label={`Подробнее: ${movie.title}`}
              >
                {movie.posterPath ? (
                  <img src={`${POSTER_BASE}${movie.posterPath}`} alt={movie.title} className="grid-poster" />
                ) : (
                  <div className="grid-poster grid-poster-placeholder">{movie.title}</div>
                )}
              </button>
              <p className="grid-title">{movie.title}</p>
              <p className="grid-meta mono">
                {movie.year} · ★ {movie.rating.toFixed(1)}
              </p>
              <button className="btn btn-outline btn-small" onClick={() => onRequeue(movie.id)}>
                Оценить заново
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
