interface Props {
  message: string;
  onRetry: () => void;
  onChangeKey: () => void;
}

export function ErrorScreen({ message, onRetry, onChangeKey }: Props) {
  return (
    <div className="screen-center">
      <div className="film-card error-card">
        <div className="perforation perforation-left" />
        <div className="perforation perforation-right" />
        <h1 className="brand-title">KINOSWIPE</h1>
        <p className="error-message">{message}</p>
        <div className="error-actions">
          <button className="btn btn-gold" onClick={onRetry}>
            Повторить
          </button>
          <button className="btn btn-outline" onClick={onChangeKey}>
            Сменить ключ
          </button>
        </div>
      </div>
    </div>
  );
}
