interface Props {
  total: number;
  rated: number;
}

export function CompletionScreen({ total, rated }: Props) {
  return (
    <div className="screen-center">
      <div className="film-card completion-card">
        <div className="perforation perforation-left" />
        <div className="perforation perforation-right" />
        <h1 className="brand-title">ГОТОВО</h1>
        <p className="subtitle">
          Вы оценили <span className="mono">{rated}</span> из <span className="mono">{total}</span> фильмов
        </p>
        <p className="hint">Загляните во вкладки категорий, чтобы посмотреть результаты.</p>
      </div>
    </div>
  );
}
