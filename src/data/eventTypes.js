// Types d'événements du planning : chaque type impose sa couleur.
// Un événement a un type choisi (category) ; sans choix, le type est deviné d'après le
// titre (mots-clés, emojis). category === 'none' : pas de type, la couleur propre reste.

export const EVENT_TYPES = [
  {
    id: 'health',
    label: 'Santé',
    icon: '🩺',
    color: '#D81B60',
    keywords: ['medecin', 'docteur', 'kine', 'dentiste', 'ophtalmo', 'psy', 'psychologue', 'pharmacie', 'prise de sang', 'osteo', 'dermato', 'hopital', 'vaccin'],
    emojis: ['🩺', '💊', '🦷'],
  },
  {
    id: 'sport',
    label: 'Sport',
    icon: '🏃',
    color: '#E53935',
    keywords: ['ultimate', 'natation', 'piscine', 'nage', 'velo', 'course', 'footing', 'running', 'run', 'sport', 'muscu', 'gainage', 'triathlon', 'foot', 'basket', 'match', 'entrainement', 'yoga', 'rando', 'escalade', 'tennis', 'badminton'],
    // ⚽ et 🏀 n'y sont pas : les matchs du PSG regardés à la télé sont des loisirs
    emojis: ['🏊', '🚴', '🏃', '🥏', '🧘', '💪'],
  },
  {
    id: 'learning',
    label: 'Apprentissage',
    icon: '🧮',
    color: '#8E24AA',
    keywords: ['maths', 'math', 'culture', 'lecture', 'lire', 'livre', 'odyssee', 'podcast', 'revision', 'apprendre', 'euler', 'zetamac', 'memoire', 'documentaire'],
    emojis: ['🧮', '📚', '📖', '🧠'],
  },
  {
    id: 'work',
    label: 'Travail',
    icon: '💼',
    color: '#1E88E5',
    keywords: ['travail', 'boulot', 'taf', 'reunion', 'meeting', 'call', 'bureau', 'client', 'cours', 'td', 'tp', 'exam', 'partiel', 'stage', 'entretien', 'teletravail'],
    emojis: ['💼', '💻'],
  },
  {
    id: 'social',
    label: 'Social',
    icon: '🎉',
    color: '#FB8C00',
    keywords: ['amis', 'ami', 'pote', 'potes', 'coloc', 'famille', 'parents', 'maman', 'papa', 'anniversaire', 'anniv', 'soiree', 'apero', 'brunch', 'resto', 'restaurant', 'diner', 'mariage', 'week-end chez'],
    emojis: ['🎉', '🍻', '🎂'],
  },
  {
    id: 'leisure',
    label: 'Loisirs',
    icon: '🎮',
    color: '#43A047',
    keywords: ['lego', 'jeu', 'jeux', 'steam', 'gaming', 'cine', 'cinema', 'film', 'serie', 'panini', 'puzzle', 'concert', 'musee', 'expo', 'psg'],
    emojis: ['🎮', '🎬', '🧩', '🏰'],
  },
  {
    id: 'daily',
    label: 'Quotidien',
    icon: '🏠',
    color: '#6D4C41',
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

const STARTS_WITH_EMOJI = /^\p{Extended_Pictographic}/u;

// Titre affiché : l'emoji du type est ajouté si le titre ne commence pas déjà par un emoji
export const eventLabel = (activity) => {
  const title = activity.title ?? '';
  const type = eventTypeById(eventTypeId(activity));
  return type && !STARTS_WITH_EMOJI.test(title.trim()) ? `${type.icon} ${title}` : title;
};

export const eventColor = (activity) =>
  eventTypeById(eventTypeId(activity))?.color ?? activity.color ?? '#4f8ef7';

// « 9 h », « 1 h 30 », « 45 min »
export const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
};
