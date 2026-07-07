import { useState } from 'react';

interface Props {
  onSubmit: (key: string) => void;
  errorMessage?: string | null;
}

export function ApiKeyScreen({ onSubmit, errorMessage }: Props) {
  const [key, setKey] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = key.trim();
    if (trimmed) onSubmit(trimmed);
  }

  return (
    <div className="screen-center">
      <div className="film-card api-key-card">
        <div className="perforation perforation-left" />
        <div className="perforation perforation-right" />
        <h1 className="brand-title">KINOSWIPE</h1>
        <p className="subtitle">Тиндер для фильмов</p>
        <form onSubmit={handleSubmit} className="api-key-form">
          <label htmlFor="apiKey">API-ключ TMDB</label>
          <input
            id="apiKey"
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Вставьте ваш ключ TMDB v3"
            autoComplete="off"
            autoFocus
          />
          <p className="hint">
            Получите бесплатный ключ на{' '}
            <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">
              themoviedb.org/settings/api
            </a>{' '}
            (личное некоммерческое использование).
          </p>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit" className="btn btn-gold" disabled={!key.trim()}>
            Загрузить каталог
          </button>
        </form>
      </div>
    </div>
  );
}
