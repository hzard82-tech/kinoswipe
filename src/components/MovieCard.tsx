import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useRef } from 'react';
import type { Direction, Movie } from '../types';
import { POSTER_BASE } from '../lib/tmdb';

interface Props {
  movie: Movie;
  onSwipe: (direction: Direction) => void;
  onOpenDetails: (movie: Movie) => void;
  isTop: boolean;
  stackIndex: number;
}

const SWIPE_THRESHOLD = 100;
const SPRING_BACK = { type: 'spring', stiffness: 500, damping: 32 } as const;

function resolveDirection(offsetX: number, offsetY: number): Direction | null {
  const absX = Math.abs(offsetX);
  const absY = Math.abs(offsetY);

  if (Math.max(absX, absY) < SWIPE_THRESHOLD) return null;

  if (absX > absY) {
    return offsetX > 0 ? 'right' : 'left';
  }
  return offsetY > 0 ? 'down' : 'up';
}

const DIRECTION_LABEL: Record<Direction, string> = {
  right: 'БУДУ СМОТРЕТЬ',
  left: 'НЕ ИНТЕРЕСНО',
  up: 'ПОНРАВИЛОСЬ',
  down: 'НЕ ПОНРАВИЛОСЬ',
};

const DIRECTION_CLASS: Record<Direction, string> = {
  right: 'hint-right',
  left: 'hint-left',
  up: 'hint-up',
  down: 'hint-down',
};

export function MovieCard({ movie, onSwipe, onOpenDetails, isTop, stackIndex }: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotate = useTransform(x, [-300, 300], [-18, 18]);

  const rightOpacity = useTransform(x, [20, SWIPE_THRESHOLD], [0, 1]);
  const leftOpacity = useTransform(x, [-SWIPE_THRESHOLD, -20], [1, 0]);
  const upOpacity = useTransform(y, [-SWIPE_THRESHOLD, -20], [1, 0]);
  const downOpacity = useTransform(y, [20, SWIPE_THRESHOLD], [0, 1]);

  const dragState = useRef<{ pointerId: number; startX: number; startY: number; dragging: boolean } | null>(null);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!isTop) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Pointer capture can fail in rare edge cases; dragging still works via document-level move/up.
    }
    dragState.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, dragging: true };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const state = dragState.current;
    if (!state || !state.dragging || state.pointerId !== e.pointerId || !isTop) return;
    x.set(e.clientX - state.startX);
    y.set(e.clientY - state.startY);
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    const state = dragState.current;
    if (!state || state.pointerId !== e.pointerId) return;
    dragState.current = null;

    const direction = resolveDirection(x.get(), y.get());
    if (direction && isTop) {
      onSwipe(direction);
      return;
    }
    animate(x, 0, SPRING_BACK);
    animate(y, 0, SPRING_BACK);
  }

  const scale = 1 - stackIndex * 0.04;
  const yOffset = stackIndex * 12;

  return (
    <motion.div
      className="movie-card"
      style={isTop ? { x, y, rotate, touchAction: 'none' } : undefined}
      initial={false}
      animate={
        isTop
          ? undefined
          : { scale, y: yOffset, opacity: stackIndex < 3 ? 1 : 0 }
      }
      onPointerDown={isTop ? handlePointerDown : undefined}
      onPointerMove={isTop ? handlePointerMove : undefined}
      onPointerUp={isTop ? endDrag : undefined}
      onPointerCancel={isTop ? endDrag : undefined}
      exit={{ opacity: 0 }}
    >
      <div className="perforation perforation-left" />
      <div className="perforation perforation-right" />

      {isTop && (
        <>
          <motion.div className={`swipe-hint ${DIRECTION_CLASS.right}`} style={{ opacity: rightOpacity }}>
            {DIRECTION_LABEL.right}
          </motion.div>
          <motion.div className={`swipe-hint ${DIRECTION_CLASS.left}`} style={{ opacity: leftOpacity }}>
            {DIRECTION_LABEL.left}
          </motion.div>
          <motion.div className={`swipe-hint ${DIRECTION_CLASS.up}`} style={{ opacity: upOpacity }}>
            {DIRECTION_LABEL.up}
          </motion.div>
          <motion.div className={`swipe-hint ${DIRECTION_CLASS.down}`} style={{ opacity: downOpacity }}>
            {DIRECTION_LABEL.down}
          </motion.div>
        </>
      )}

      <div className="poster-wrap">
        {movie.posterPath ? (
          <img
            src={`${POSTER_BASE}${movie.posterPath}`}
            alt={movie.title}
            className="poster-img"
            draggable={false}
          />
        ) : (
          <div className="poster-placeholder">
            <span>{movie.title}</span>
          </div>
        )}
        <button
          type="button"
          className="info-btn"
          aria-label="Подробнее о фильме"
          title="Подробнее"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(movie);
          }}
        >
          i
        </button>
      </div>

      <div className="movie-info">
        <h2 className="movie-title">
          {movie.title} <span className="movie-year mono">{movie.year}</span>
        </h2>
        <div className="movie-meta">
          <span className="rating">★ {movie.rating.toFixed(1)}</span>
          <span className="vote-count mono">{movie.voteCount.toLocaleString('ru-RU')} голосов</span>
        </div>
        <div className="genre-list">
          {movie.genres.map((g) => (
            <span key={g} className="genre-chip">
              {g}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
