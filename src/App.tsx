import { useCallback, useMemo, useState } from 'react';
import type { Category, Direction, Movie, SwipesMap } from './types';
import { DIRECTION_TO_CATEGORY } from './types';
import { fetchMovieDetails, fetchTopRatedCatalog, TmdbError, type MovieDetails } from './lib/tmdb';
import {
  clearApiKey,
  clearSwipes,
  loadApiKey,
  loadCatalog,
  loadSwipes,
  saveApiKey,
  saveCatalog,
  saveSwipes,
} from './lib/storage';
import { ApiKeyScreen } from './components/ApiKeyScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorScreen } from './components/ErrorScreen';
import { Header } from './components/Header';
import { SwipeDeck } from './components/SwipeDeck';
import { CompletionScreen } from './components/CompletionScreen';
import { CategoryGrid } from './components/CategoryGrid';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { MovieDetailModal } from './components/MovieDetailModal';

type Stage = 'need-key' | 'loading' | 'error' | 'ready';

interface UndoEntry {
  movieId: number;
  previous: SwipesMap[number] | undefined;
}

function initialCatalog(): Movie[] | null {
  const cached = loadCatalog();
  return cached ? cached.movies : null;
}

export default function App() {
  const [movies, setMovies] = useState<Movie[] | null>(initialCatalog);
  const [stage, setStage] = useState<Stage>(() => (movies ? 'ready' : loadApiKey() ? 'loading' : 'need-key'));
  const [progress, setProgress] = useState({ loaded: 0, total: 50 });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [swipes, setSwipes] = useState<SwipesMap>(loadSwipes);
  const [undoStack, setUndoStack] = useState<UndoEntry[]>([]);
  const [view, setView] = useState<'swipe' | Category>('swipe');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [detailMovie, setDetailMovie] = useState<Movie | null>(null);
  const [detailsCache, setDetailsCache] = useState<Record<number, MovieDetails>>({});
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const startLoading = useCallback((apiKey: string) => {
    setStage('loading');
    setErrorMessage(null);
    setProgress({ loaded: 0, total: 50 });

    fetchTopRatedCatalog(apiKey, (loaded, total) => setProgress({ loaded, total }))
      .then((fetched) => {
        saveApiKey(apiKey);
        saveCatalog({ movies: fetched, loadedAt: Date.now() });
        setMovies(fetched);
        setStage('ready');
      })
      .catch((err: unknown) => {
        const message =
          err instanceof TmdbError
            ? err.message
            : 'Неизвестная ошибка при загрузке каталога. Попробуйте ещё раз.';
        setErrorMessage(message);
        setStage('error');
      });
  }, []);

  const handleKeySubmit = useCallback(
    (key: string) => {
      startLoading(key);
    },
    [startLoading],
  );

  const handleRetry = useCallback(() => {
    const key = loadApiKey();
    if (key) startLoading(key);
    else setStage('need-key');
  }, [startLoading]);

  const handleChangeKey = useCallback(() => {
    clearApiKey();
    setStage('need-key');
  }, []);

  const queue = useMemo(() => {
    if (!movies) return [];
    return movies.filter((m) => !(m.id in swipes));
  }, [movies, swipes]);

  const counts = useMemo(() => {
    const result: Record<Category, number> = {
      watchlist: 0,
      not_interested: 0,
      liked: 0,
      disliked: 0,
    };
    for (const record of Object.values(swipes)) {
      result[DIRECTION_TO_CATEGORY[record.direction]]++;
    }
    return result;
  }, [swipes]);

  const moviesByCategory = useCallback(
    (category: Category): Movie[] => {
      if (!movies) return [];
      return movies.filter((m) => {
        const record = swipes[m.id];
        return record && DIRECTION_TO_CATEGORY[record.direction] === category;
      });
    },
    [movies, swipes],
  );

  const handleSwipe = useCallback((movie: Movie, direction: Direction) => {
    setSwipes((prev) => {
      const next = { ...prev, [movie.id]: { direction, timestamp: Date.now() } };
      saveSwipes(next);
      return next;
    });
    setUndoStack((prev) => [...prev, { movieId: movie.id, previous: undefined }]);
  }, []);

  const handleUndo = useCallback(() => {
    setUndoStack((prevStack) => {
      if (prevStack.length === 0) return prevStack;
      const last = prevStack[prevStack.length - 1];
      setSwipes((prevSwipes) => {
        const next = { ...prevSwipes };
        if (last.previous) {
          next[last.movieId] = last.previous;
        } else {
          delete next[last.movieId];
        }
        saveSwipes(next);
        return next;
      });
      return prevStack.slice(0, -1);
    });
  }, []);

  const handleRequeue = useCallback((movieId: number) => {
    setSwipes((prev) => {
      const next = { ...prev };
      delete next[movieId];
      saveSwipes(next);
      return next;
    });
  }, []);

  const handleResetConfirmed = useCallback(() => {
    clearSwipes();
    setSwipes({});
    setUndoStack([]);
    setShowResetConfirm(false);
    setView('swipe');
  }, []);

  const handleOpenDetails = useCallback(
    (movie: Movie) => {
      setDetailMovie(movie);
      setDetailsError(null);

      if (detailsCache[movie.id]) return;

      const apiKey = loadApiKey();
      if (!apiKey) return;

      setDetailsLoading(true);
      fetchMovieDetails(apiKey, movie.id)
        .then((details) => {
          setDetailsCache((prev) => ({ ...prev, [movie.id]: details }));
        })
        .catch((err: unknown) => {
          const message = err instanceof TmdbError ? err.message : 'Не удалось загрузить подробности фильма.';
          setDetailsError(message);
        })
        .finally(() => setDetailsLoading(false));
    },
    [detailsCache],
  );

  const handleCloseDetails = useCallback(() => {
    setDetailMovie(null);
    setDetailsError(null);
  }, []);

  if (stage === 'need-key') {
    return <ApiKeyScreen onSubmit={handleKeySubmit} errorMessage={errorMessage} />;
  }

  if (stage === 'loading') {
    return <LoadingScreen loadedPages={progress.loaded} totalPages={progress.total} />;
  }

  if (stage === 'error') {
    return <ErrorScreen message={errorMessage ?? 'Произошла ошибка.'} onRetry={handleRetry} onChangeKey={handleChangeKey} />;
  }

  const total = movies?.length ?? 0;
  const rated = Object.keys(swipes).length;

  return (
    <div className="app-shell">
      <Header
        rated={rated}
        total={total}
        canUndo={undoStack.length > 0}
        onUndo={handleUndo}
        onResetClick={() => setShowResetConfirm(true)}
        activeView={view}
        onChangeView={setView}
        counts={counts}
      />

      <main className="app-main">
        {view === 'swipe' &&
          (queue.length > 0 ? (
            <SwipeDeck queue={queue} onSwipe={handleSwipe} onOpenDetails={handleOpenDetails} />
          ) : (
            <CompletionScreen total={total} rated={rated} />
          ))}
        {view !== 'swipe' && (
          <CategoryGrid
            category={view}
            movies={moviesByCategory(view)}
            onRequeue={handleRequeue}
            onOpenDetails={handleOpenDetails}
          />
        )}
      </main>

      {showResetConfirm && (
        <ResetConfirmModal onConfirm={handleResetConfirmed} onCancel={() => setShowResetConfirm(false)} />
      )}

      {detailMovie && (
        <MovieDetailModal
          movie={detailMovie}
          details={detailsCache[detailMovie.id] ?? null}
          loading={detailsLoading}
          error={detailsError}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}
