interface Props {
  loadedPages: number;
  totalPages: number;
}

export function LoadingScreen({ loadedPages, totalPages }: Props) {
  const percent = totalPages > 0 ? Math.round((loadedPages / totalPages) * 100) : 0;

  return (
    <div className="screen-center">
      <div className="film-card loading-card">
        <div className="perforation perforation-left" />
        <div className="perforation perforation-right" />
        <h1 className="brand-title">KINOSWIPE</h1>
        <p className="subtitle">Собираем топ фильмов…</p>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
        </div>
        <p className="progress-label mono">{percent}%</p>
      </div>
    </div>
  );
}
