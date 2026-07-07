import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import type { Direction, Movie } from '../types';
import { POSTER_BASE } from '../lib/tmdb';

interface Props {
  movie: Movie;
  onSwipe: (direction: Direction) => void;
  onOpenDetails: (movie: Movie) => void;
  isTop: boolean;
  stackIndex: number;
}

const SWIPE_THRESHOLD = 110;

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

  function handleDragEnd(_e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    const direction = resolveDirection(info.offset.x, info.offset.y);
    if (direction && isTop) {
      onSwipe(direction);
    }
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
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      dragMomentum={false}
      onDragEnd={isTop ? handleDragEnd : undefined}
      whileTap={isTop ? { cursor: 'grabbing' } : undefined}
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
