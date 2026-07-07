interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ResetConfirmModal({ onConfirm, onCancel }: Props) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-box film-card">
        <h2 className="brand-title small">Сбросить весь прогресс?</h2>
        <p className="hint">Все оценённые фильмы вернутся в очередь свайпа. Это действие нельзя отменить.</p>
        <div className="error-actions">
          <button className="btn btn-outline" onClick={onCancel}>
            Отмена
          </button>
          <button className="btn btn-danger-solid" onClick={onConfirm}>
            Да, сбросить
          </button>
        </div>
      </div>
    </div>
  );
}
