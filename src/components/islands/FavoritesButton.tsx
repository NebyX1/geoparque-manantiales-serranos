import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import { $favorites, toggleFavorite } from '../../features/trip/store';
import { Icon } from './Icon';
export function FavoritesButton({
  id,
  name,
  compact = true,
}: {
  id: number;
  name: string;
  compact?: boolean;
}) {
  const ids = useStore($favorites);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const saved = hydrated && ids.includes(id);
  return (
    <button
      type="button"
      className={`${compact ? 'save-btn' : 'btn'}${saved ? ' saved' : ''}`}
      aria-pressed={saved}
      aria-label={`${saved ? 'Quitar' : 'Guardar'} ${name} ${saved ? 'de' : 'en'} mi cuaderno`}
      data-favorite={id}
      onClick={() => {
        toggleFavorite(id);
        window.dispatchEvent(
          new CustomEvent('geopark:toast', {
            detail: saved ? 'Ficha quitada de tu cuaderno.' : `Guardaste ${name}.`,
          }),
        );
      }}
    >
      <Icon name={saved ? 'check' : 'save'} />
      {!compact && <span>{saved ? 'Guardado en mi cuaderno' : 'Guardar en mi cuaderno'}</span>}
    </button>
  );
}
