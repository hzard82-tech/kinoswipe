import type { Category } from '../types';
import { CATEGORY_LABELS } from '../types';

interface Props {
  rated: number;
  total: number;
  canUndo: boolean;
  onUndo: () => void;
  onResetClick: () => void;
  activeView: 'swipe' | Category;
  onChangeView: (view: 'swipe' | Category) => void;
  counts: Record<Category, number>;
}

const CATEGORY_ORDER: Category[] = ['watchlist', 'not_interested', 'liked', 'disliked'];

export function Header({ rated, total, canUndo, onUndo, onResetClick, activeView, onChangeView, counts }: Props) {
  return (
    <header className="app-header">
      <div className="header-top">
        <h1 className="brand-title small">KINOSWIPE</h1>
        <p className="rated-counter mono">
          Оценено {rated} из {total}
        </p>
        <div className="header-actions">
          <button className="btn btn-outline btn-small" onClick={onUndo} disabled={!canUndo}>
            ↺ Отменить
          </button>
          <button className="btn btn-outline btn-small btn-danger" onClick={onResetClick}>
            Сбросить всё
          </button>
        </div>
      </div>

      <nav className="tabs" aria-label="Категории">
        <button
          className={`tab ${activeView === 'swipe' ? 'tab-active' : ''}`}
          onClick={() => onChangeView('swipe')}
        >
          Свайп
        </button>
        {CATEGORY_ORDER.map((cat) => (
          <button
            key={cat}
            className={`tab ${activeView === cat ? 'tab-active' : ''}`}
            onClick={() => onChangeView(cat)}
          >
            {CATEGORY_LABELS[cat]} <span className="mono tab-count">{counts[cat]}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}
