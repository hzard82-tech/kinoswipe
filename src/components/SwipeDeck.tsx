import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Direction, Movie } from '../types';
import { MovieCard } from './MovieCard';

interface Props {
  queue: Movie[];
  onSwipe: (movie: Movie, direction: Direction) => void;
  onOpenDetails: (movie: Movie) => void;
}

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowRight: 'right',
  ArrowLeft: 'left',
  ArrowUp: 'up',
  ArrowDown: 'down',
};

export function SwipeDeck({ queue, onSwipe, onOpenDetails }: Props) {
  const visible = queue.slice(0, 3);
  const top = visible[0];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const direction = KEY_TO_DIRECTION[e.key];
      if (!direction || !top) return;
      e.preventDefault();
      onSwipe(top, direction);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [top, onSwipe]);

  if (!top) return null;

  return (
    <div className="swipe-deck">
      <div className="card-stack">
        <AnimatePresence>
          {visible.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isTop={index === 0}
              stackIndex={index}
              onSwipe={(direction) => onSwipe(movie, direction)}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="swipe-buttons" role="group" aria-label="Оценить фильм">
        <button
          className="swipe-btn btn-not-interested"
          onClick={() => onSwipe(top, 'left')}
          aria-label="Не интересно"
          title="Не интересно (←)"
        >
          ✕
        </button>
        <button
          className="swipe-btn btn-disliked"
          onClick={() => onSwipe(top, 'down')}
          aria-label="Не понравилось"
          title="Уже смотрел, не понравилось (↓)"
        >
          👎
        </button>
        <button
          className="swipe-btn btn-liked"
          onClick={() => onSwipe(top, 'up')}
          aria-label="Понравилось"
          title="Уже смотрел, понравилось (↑)"
        >
          👍
        </button>
        <button
          className="swipe-btn btn-watchlist"
          onClick={() => onSwipe(top, 'right')}
          aria-label="Буду смотреть"
          title="Буду смотреть (→)"
        >
          ★
        </button>
      </div>
    </div>
  );
}
