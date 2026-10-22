// Onglet « 📓 Carnet » : noter ce qu'on a fait, sans rien pouvoir rater.
// Pas de série, pas d'échéance : des projets loisirs avec leur avancement, et un
// journal des petites victoires (avec une note de plaisir facultative, pour repérer
// ce qui fait vraiment du bien).

import { dateKey, weekKeyOf } from './quests';

export const PROJECTS_KEY = 'planner_projects';
export const JOURNAL_KEY = 'planner_journal';

// Projets en cours au 22 oct. 2026 ; total null = inconnu, à renseigner au besoin
export const DEFAULT_PROJECTS = [
  { id: 'proj_minas', icon: '🏰', label: 'Minas Tirith (avec mon coloc)', unit: 'sachet', current: 8, total: null },
  { id: 'proj_bike', icon: '🚲', label: 'Vélo de course Lego', unit: 'sachet', current: 3, total: null },
  { id: 'proj_odyssey', icon: '📖', label: 'L’Odyssée', unit: 'chant', current: 0, total: 24 },
  { id: 'proj_wc', icon: '📒', label: 'Album Coupe du monde', unit: 'sticker collé', current: 0, total: 923 },
  { id: 'proj_tdf', icon: '🚴', label: 'Album Tour de France', unit: 'sticker collé', current: 0, total: null },
  { id: 'proj_cards', icon: '🃏', label: 'Vente de cartes foot & basket', unit: 'carte vendue', current: 0, total: null },
  { id: 'proj_steam', icon: '🎮', label: 'Liste Steam', unit: 'jeu fini', current: 0, total: null },
  { id: 'proj_app', icon: '💻', label: 'Planner-app', unit: 'amélioration', current: 0, total: null },
].map((p) => ({ ...p, status: 'active', createdAt: '2026-10-22T12:00:00.000Z' }));

// Étape d'un projet. atValue : cochée d'office quand l'avancement l'atteint (ex. 52 %) ;
// amount : ajoutée à l'avancement quand on la coche (ex. +1 succès).
const step = (id, label, extra = {}) => ({ id, label, done: false, ...extra });

export const stepDone = (project, st) =>
  st.done || (st.atValue !== undefined && project.current >= st.atValue);

// Projets proposés depuis l'extérieur (ex. ta bibliothèque Steam, 22 oct. 2026), ajoutés d'un
// clic depuis le Carnet s'ils n'y sont pas déjà (ou leurs étapes, si le projet existe sans)
export const SUGGESTED_PROJECTS = [
  {
    id: 'proj_mega_mosaic',
    icon: '🧩',
    label: 'Mega Mosaic',
    unit: '%',
    current: 33,
    total: 100,
    hint: 'environ 13 h à ton rythme, 1 h à 1 h 30 par étape',
    steps: [
      step('mm_r1', 'Finir la région 1 (succès Skull)'),
      ...[37, 42, 48].map((v) => step(`mm_${v}`, `Atteindre ${v} %`, { atValue: v })),
      step('mm_52', 'Atteindre 52 % : la moitié !', { atValue: 52 }),
      ...[58, 62, 69, 78, 88, 96].map((v) => step(`mm_${v}`, `Atteindre ${v} %`, { atValue: v })),
      step('mm_100', 'Atteindre 100 % 🏆', { atValue: 100 }),
      step('mm_check', 'Vérifier les régions et bordures oubliées'),
    ],
  },
  {
    id: 'proj_sky_force',
    icon: '🚀',
    label: 'Sky Force Reloaded',
    unit: 'succès',
    current: 4,
    total: 30,
    hint: 'Insane se débloque sur un stage avec les 4 médailles en Hard',
    steps: [
      step('sf_tournament', '🎁 Participer à un tournoi', { amount: 1 }),
      ...[4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((n) =>
        step(`sf_s${n}`, `Stage ${n} en Insane`, { amount: 1 }),
      ),
      ...['B1', 'B2', 'B3'].map((n) => step(`sf_${n}`, `Stage ${n} en Insane`, { amount: 1 })),
      step('sf_decide', 'Décider si je vise le 100 % (9 avions, cartes, Nightmare)'),
    ],
  },
  {
    // Remplace le projet par défaut « Liste Steam » (refresh : nom, unité et avancement repris)
    id: 'proj_steam',
    refresh: true,
    icon: '🎮',
    label: 'Jeux Steam à 100 %',
    unit: 'jeu',
    current: 14,
    total: null,
    hint: 'les prochains 100 % les plus proches, du plus rapide au plus long',
    steps: [
      step('st_snake', '🐍 Snakecremental : débloquer les 14 skins → 100 %', { amount: 1 }),
      step('st_bal_flush', '🃏 Balatro : jouer une Flush avec 5 Wild Cards'),
      step('st_bal_tiny', '🃏 Balatro : finir avec un deck de 20 cartes ou moins'),
      step('st_ccc_buy', '🖱️ Clicker Clicker Clicker : acheter la spike ball et la ball turret'),
      step('st_ccc_idle', '🖱️ Clicker Clicker Clicker : les 5 compteurs (or, flèches, balles…) → 100 %', { amount: 1 }),
      step('st_astro', '🪐 Astro Prospector : les 16 succès restants → 100 %', { amount: 1 }),
      step('st_bal_challenges', '🃏 Balatro : finir tous les défis (Rule Breaker)'),
      step('st_bal_gold', '🃏 Balatro : Completionist+ et ++ (le très long cours) → 100 %', { amount: 1 }),
      step('st_next', '🎲 Choisir le prochain jeu parmi les 77 jamais lancés'),
    ],
  },
];

const sameProject = (a, b) => a.id === b.id || a.label.toLowerCase() === b.label.toLowerCase();

export const suggestionsToAdd = (projects) =>
  SUGGESTED_PROJECTS.filter((s) => {
    const existing = projects.find((p) => sameProject(p, s));
    return !existing || (s.steps && !existing.steps?.length);
  });

// Ajoute les projets suggérés absents, et les étapes aux projets suggérés qui n'en ont pas
export const mergeSuggestions = (projects) => {
  const next = projects.map((p) => {
    const s = SUGGESTED_PROJECTS.find((x) => sameProject(p, x));
    if (!s?.steps || p.steps?.length) return p;
    // refresh : le projet existant prend le nom, l'unité et l'avancement à jour
    return s.refresh
      ? { ...p, icon: s.icon, label: s.label, unit: s.unit, total: s.total, current: Math.max(p.current, s.current), steps: s.steps }
      : { ...p, steps: s.steps };
  });
  SUGGESTED_PROJECTS.forEach(({ id, icon, label, unit, current, total, steps }) => {
    if (next.some((p) => sameProject(p, { id, label }))) return;
    next.push({ id, icon, label, unit, current, total, steps, status: 'active', createdAt: new Date().toISOString() });
  });
  return next;
};

export const PLEASURE_LEVELS = Array.from({ length: 11 }, (_, i) => i);

export const makeProject = ({ icon, label, unit, total }) => ({
  id: `proj_${Date.now()}`,
  icon: icon || '⭐',
  label,
  unit: unit || 'étape',
  current: 0,
  total: total || null,
  status: 'active',
  createdAt: new Date().toISOString(),
});

export const makeEntry = ({ projectId = null, text = '', amount = 0, pleasure = null }) => ({
  id: `entry_${Date.now()}`,
  date: dateKey(new Date()),
  createdAt: new Date().toISOString(),
  projectId,
  text,
  amount,
  pleasure,
});

// « 3 sachets », « 1 jeu fini » : pluriel simple sur le premier mot de l'unité
export const formatAmount = (n, unit) => {
  if (unit === '%') return `${n} %`;
  if (n <= 1 || !unit) return `${n} ${unit ?? ''}`.trim();
  const [first, ...rest] = unit.split(' ');
  const plural = (w) => (/[sxz]$/.test(w) ? w : /(eu|au)$/.test(w) ? `${w}x` : `${w}s`);
  return [n, plural(first), ...rest.map(plural)].join(' ');
};

export const entriesOfWeek = (entries, today = new Date()) => {
  const week = weekKeyOf(today);
  return entries.filter((e) => weekKeyOf(new Date(`${e.date}T12:00:00`)) === week);
};

export const averagePleasure = (entries) => {
  const rated = entries.filter((e) => e.pleasure !== null && e.pleasure !== undefined);
  if (rated.length === 0) return null;
  return Math.round((rated.reduce((sum, e) => sum + e.pleasure, 0) / rated.length) * 10) / 10;
};
