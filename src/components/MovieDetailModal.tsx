import { useEffect } from 'react';
import type { Movie } from '../types';
import type { MovieDetails } from '../lib/tmdb';
import { POSTER_BASE } from '../lib/tmdb';

interface Props {
  movie: Movie;
  details: MovieDetails | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

export function MovieDetailModal({ movie, details, loading, error, onClose }: Props) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={movie.title} onClick={onClose}>
      <div className="film-card detail-card" onClick={(e) => e.stopPropagation()}>
        <div className="perforation perforation-left" />
        <div className="perforation perforation-right" />
        <button className="modal-close" onClick={onClose} aria-label="Закрыть">
          ✕
        </button>

        <div className="detail-body">
          <div className="detail-poster-wrap">
            {movie.posterPath ? (
              <img src={`${POSTER_BASE}${movie.posterPath}`} alt={movie.title} className="detail-poster" />
            ) : (
              <div className="poster-placeholder detail-poster">
                <span>{movie.title}</span>
              </div>
            )}
          </div>

          <div className="detail-info">
            <h2 className="movie-title">
              {movie.title} <span className="movie-year mono">{movie.year}</span>
            </h2>
            <div className="movie-meta">
              <span className="rating">★ {movie.rating.toFixed(1)}</span>
              <span className="vote-count mono">{movie.voteCount.toLocaleString('ru-RU')} голосов</span>
              {details?.runtime ? <span className="vote-count mono">{details.runtime} мин</span> : null}
            </div>
            <div className="genre-list">
              {movie.genres.map((g) => (
                <span key={g} className="genre-chip">
                  {g}
                </span>
              ))}
            </div>

            {loading && <p className="hint">Загружаем подробности…</p>}
            {error && <p className="error-message">{error}</p>}

            {details && (
              <>
                {details.tagline && <p className="detail-tagline">«{details.tagline}»</p>}
                <p className="detail-overview">{details.overview || 'Описание отсутствует.'}</p>

                {details.directors.length > 0 && (
                  <div className="detail-section">
                    <h3 className="detail-heading">Режиссёр{details.directors.length > 1 ? 'ы' : ''}</h3>
                    <p className="detail-text">{details.directors.join(', ')}</p>
                  </div>
                )}

                {details.cast.length > 0 && (
                  <div className="detail-section">
                    <h3 className="detail-heading">В ролях</h3>
                    <ul className="cast-list">
                      {details.cast.map((c) => (
                        <li key={c.name}>
                          <span className="cast-name">{c.name}</span>
                          {c.character && <span className="cast-character mono"> — {c.character}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
