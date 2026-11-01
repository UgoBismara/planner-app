import { Circle, CircleCheck, CircleDashed, Clock, RotateCcw, Star } from 'lucide-react';
import { DIFFICULTIES, kindLabel } from '../../data/maths';
import { ExerciseKindIcon } from '../Icons';

export function Stars({ n, size = 12 }) {
  const label = DIFFICULTIES.find((d) => d.id === n)?.label;
  return (
    <span className="maths-stars" title={label} aria-label={`${n} étoile${n > 1 ? 's' : ''} : ${label}`}>
      {DIFFICULTIES.map((d) => (
        <Star key={d.id} size={size} fill={d.id <= n ? 'currentColor' : 'none'} aria-hidden="true" />
      ))}
    </span>
  );
}

const STATUS_ICONS = {
  new: { Icon: Circle, label: 'À faire' },
  tried: { Icon: CircleDashed, label: 'Entraînement entamé' },
  review: { Icon: RotateCcw, label: 'À retenter' },
  later: { Icon: Clock, label: 'Revient bientôt' },
  validated: { Icon: CircleCheck, label: 'Validé' },
};

export function StatusIcon({ status, size = 18 }) {
  const { Icon, label } = STATUS_ICONS[status] ?? STATUS_ICONS.new;
  return (
    <span className={`maths-status maths-status-${status}`} title={label}>
      <Icon size={size} aria-label={label} />
    </span>
  );
}

// Étoiles, type d'exercice et niveau, sur une ligne
export default function ItemMeta({ item, children }) {
  return (
    <span className="maths-meta">
      <Stars n={item.difficulty} />
      <span className="maths-meta-kind">
        <ExerciseKindIcon id={item.kind} size={13} />
        {kindLabel(item.kind)}
      </span>
      <span className="maths-level">{item.level}</span>
      {children}
    </span>
  );
}
