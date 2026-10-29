// Types d'événements du planning : chaque type impose sa couleur, une teinte bien
// distincte des autres (couleurs système iOS).
// Un événement a un type choisi (category) ; sans choix, le type est deviné d'après le
// titre (mots-clés, emojis). category === 'none' : pas de type, la couleur propre reste.

export const EVENT_TYPES = [
  {
    id: 'health',
    label: 'Santé',
    color: '#63E6E2',
    keywords: ['medecin', 'docteur', 'kine', 'dentiste', 'ophtalmo', 'psy', 'psychologue', 'pharmacie', 'prise de sang', 'osteo', 'dermato', 'hopital', 'vaccin'],
    emojis: ['🩺', '💊', '🦷'],
  },
  {
    id: 'sport',
    label: 'Sport',
    color: '#FF453A',
    keywords: ['ultimate', 'natation', 'piscine', 'nage', 'velo', 'course', 'footing', 'running', 'run', 'sport', 'muscu', 'gainage', 'triathlon', 'foot', 'basket', 'match', 'entrainement', 'yoga', 'rando', 'escalade', 'tennis', 'badminton'],
    // ⚽ et 🏀 n'y sont pas : les matchs du PSG regardés à la télé sont des loisirs
    emojis: ['🏊', '🚴', '🏃', '🥏', '🧘', '💪'],
  },
  {
    id: 'learning',
    label: 'Apprentissage',
    color: '#BF5AF2',
    keywords: ['maths', 'math', 'culture', 'lecture', 'lire', 'livre', 'odyssee', 'podcast', 'revision', 'apprendre', 'euler', 'zetamac', 'memoire', 'documentaire'],
    emojis: ['🧮', '📚', '📖', '🧠'],
  },
  {
    id: 'work',
    label: 'Travail',
    color: '#0A84FF',
    keywords: ['travail', 'boulot', 'taf', 'reunion', 'meeting', 'call', 'bureau', 'client', 'cours', 'td', 'tp', 'exam', 'partiel', 'stage', 'entretien', 'teletravail'],
    emojis: ['💼', '💻'],
  },
  {
    id: 'social',
    label: 'Social',
    color: '#FF9F0A',
    keywords: ['amis', 'ami', 'pote', 'potes', 'coloc', 'famille', 'parents', 'maman', 'papa', 'anniversaire', 'anniv', 'soiree', 'apero', 'brunch', 'resto', 'restaurant', 'diner', 'mariage', 'week-end chez'],
    emojis: ['🎉', '🍻', '🎂'],
  },
  {
    id: 'leisure',
    label: 'Loisirs',
    color: '#30D158',
    keywords: ['lego', 'jeu', 'jeux', 'steam', 'gaming', 'cine', 'cinema', 'film', 'serie', 'panini', 'puzzle', 'concert', 'musee', 'expo', 'psg'],
    emojis: ['🎮', '🎬', '🧩', '🏰'],
  },
  {
    id: 'daily',
    label: 'Quotidien',
    color: '#FFD60A',
    keywords: ['courses', 'menage', 'lessive', 'vaisselle', 'appart', 'admin', 'banque', 'impots', 'papiers', 'vinted', 'colis', 'poste', 'rangement', 'ranger', 'cuisine', 'repas', 'batch', 'cooking', 'coiffeur', 'demenagement'],
    emojis: ['🛒', '🧺', '📦', '🏠', '🍳', '🧹'],
  },
];

export const eventTypeById = (id) => EVENT_TYPES.find((t) => t.id === id) ?? null;

// Minuscules sans accents, pour comparer « Vélo » et « velo »
const normalize = (text) =>
  (text ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const hasWord = (text, word) =>
  new RegExp(`(^|[^a-z0-9])${word.replace(/[-]/g, '\\-')}([^a-z0-9]|$)`).test(text);

// L'ordre de EVENT_TYPES départage : un « match de foot » est du sport avant d'être du loisir
export const guessEventType = (title) => {
  const text = normalize(title);
  return (
    EVENT_TYPES.find(
      (t) => t.emojis.some((e) => (title ?? '').includes(e)) || t.keywords.some((k) => hasWord(text, k)),
    )?.id ?? null
  );
};

// Type effectif : celui choisi, sinon celui deviné ; null = sans type
export const eventTypeId = (activity) => {
  if (activity.category === 'none') return null;
  return activity.category ?? guessEventType(activity.title);
};

const EMOJI = /\p{Extended_Pictographic}️?/gu;

// Titre affiché sans emoji : le type se lit à sa couleur. Le titre enregistré garde
// ses emojis, ils servent encore à deviner le type.
export const eventLabel = (activity) =>
  (activity.title ?? '').replace(EMOJI, '').replace(/\s{2,}/g, ' ').trim();

export const eventColor = (activity) =>
  eventTypeById(eventTypeId(activity))?.color ?? activity.color ?? '#0A84FF';

// « 9 h », « 1 h 30 », « 45 min »
export const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
};
