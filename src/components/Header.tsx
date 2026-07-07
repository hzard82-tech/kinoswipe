import { useEffect, useRef, useState } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  function selectView(view: 'swipe' | Category) {
    onChangeView(view);
    setMenuOpen(false);
  }

  return (
    <header className="app-header">
      <div className="header-top">
        <h1 className="brand-title small">KINOSWIPE</h1>
        <p className="rated-counter mono">
          {rated}/{total}
        </p>
        <div className="header-actions">
          <button className="btn btn-outline btn-small" onClick={onUndo} disabled={!canUndo}>
            ↺ Отменить
          </button>
          <button className="btn btn-outline btn-small btn-danger" onClick={onResetClick}>
            Сбросить всё
          </button>
        </div>

        <div className="menu-wrap" ref={menuRef}>
          <button
            className="menu-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Разделы"
            aria-expanded={menuOpen}
          >
            ⋮
          </button>
          {menuOpen && (
            <div className="dropdown-menu" role="menu">
              <button
                className={`dropdown-item ${activeView === 'swipe' ? 'dropdown-item-active' : ''}`}
                onClick={() => selectView('swipe')}
              >
                Свайп
              </button>
              {CATEGORY_ORDER.map((cat) => (
                <button
                  key={cat}
                  className={`dropdown-item ${activeView === cat ? 'dropdown-item-active' : ''}`}
                  onClick={() => selectView(cat)}
                >
                  {CATEGORY_LABELS[cat]} <span className="mono tab-count">{counts[cat]}</span>
                </button>
              ))}
              <div className="dropdown-divider" />
              <button
                className="dropdown-item"
                onClick={() => {
                  onUndo();
                  setMenuOpen(false);
                }}
                disabled={!canUndo}
              >
                ↺ Отменить свайп
              </button>
              <button
                className="dropdown-item dropdown-item-danger"
                onClick={() => {
                  onResetClick();
                  setMenuOpen(false);
                }}
              >
                Сбросить всё
              </button>
            </div>
          )}
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
