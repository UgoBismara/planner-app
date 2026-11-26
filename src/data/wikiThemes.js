// Thèmes des cartes de Wikichasse, devinés à partir de la description Wikidata
// (« footballeur brésilien », « commune française »…) ou, faute de mieux, de la
// première phrase de l'extrait. Rien n'est enregistré : le thème est recalculé.
//
// Le mot reconnu le plus tôt dans le texte l'emporte : une description commence
// par ce qu'est l'article (« municipalité du Nicaragua… près d'un cratère » est
// un Lieu). À égalité, l'ordre de ORDER départage.

export const THEMES = [
  { id: 'sport', name: 'Sport', short: 'Sport', color: '#ff9f0a' },
  { id: 'people', name: 'Personnalités', short: 'Personne', color: '#ff375f' },
  { id: 'nature', name: 'Nature & sciences', short: 'Nature', color: '#30d158' },
  { id: 'culture', name: 'Arts & culture', short: 'Culture', color: '#bf5af2' },
  { id: 'history', name: 'Histoire & société', short: 'Histoire', color: '#ac8e68' },
  { id: 'geo', name: 'Lieux', short: 'Lieu', color: '#0a84ff' },
  { id: 'misc', name: 'Divers', short: 'Divers', color: '#98989f' },
];

// Mots sans accents ni majuscules (le texte est normalisé avant le test).
// Une entrée qui finit par * est un préfixe.
const WORDS = {
  sport: [
    'football*', 'rugby', 'basket*', 'tennis*', 'handball*', 'volley*', 'hockey*', 'baseball', 'golf*',
    'cycliste', 'cyclisme', 'boxeu*', 'skieu*', 'athlete', 'athletisme', 'nageu*', 'natation', 'judoka',
    'taekwondoiste', 'karateka', 'lutteu*', 'escrimeu*', 'patineu*', 'gymnaste', 'rameu*', 'aviron',
    'sprinteu*', 'marathonien*', 'tireu*', 'biathlete', 'pilote', 'joueur', 'joueuse', 'entraineu*',
    'club', 'championnat*', 'tournoi', 'coupe', 'fc', 'competition', 'etape', 'handisport', 'pongiste', 'avironneu*', 'olympiques', 'olympique', 'paralympiques', 'patinoire', 'cup', 'velodrome', 'hippodrome', 'arts martiaux',
    'catcheu*', 'catch', 'ufc', 'stade', 'equipe', 'grand prix', 'rallye', 'sport', 'sportif', 'sportive',
    'alpiniste', 'jockey', 'arbitre', 'match', 'echecs', 'snooker', 'cricket', 'triathlete', 'surfeu*',
  ],
  people: [
    'ecrivain*', 'auteur*', 'autrice', 'romancier*', 'poete*', 'poetesse', 'dramaturge', 'acteur', 'actrice',
    'comedien*', 'chanteu*', 'musicien*', 'compositeu*', 'compositrice', 'pianiste', 'violoniste', 'guitariste',
    'rappeu*', 'chef d\'orchestre', 'realisateu*', 'realisatrice', 'producteu*', 'scenariste', 'peintre',
    'sculpteu*', 'graveu*', 'photographe', 'illustrateur', 'illustratrice', 'dessinat*', 'architecte', 'designer', 'styliste',
    'danseu*', 'humoriste', 'animateur', 'animatrice', 'mangaka', 'journaliste', 'mannequin', 'homme politique', 'femme politique',
    'personnalite*', 'politicien*', 'depute*', 'senateu*', 'maire', 'ministre', 'gouverneu*', 'diplomate',
    'ambassadeu*', 'president', 'presidente', 'syndicaliste', 'militant*', 'suffragiste', 'resistant*',
    'general', 'officier', 'amiral', 'soldat', 'aviateur', 'aviatrice', 'mathematicien*', 'physicien*', 'chimiste', 'biologiste',
    'botaniste', 'zoologiste', 'entomologiste', 'naturaliste', 'astronome', 'geographe', 'geologue', 'ethnologue',
    'anthropologue', 'archeologue', 'historien*', 'philosophe', 'sociologue', 'economiste', 'linguiste',
    'theologien*', 'medecin', 'chirurgien*', 'ingenieu*', 'inventeu*', 'scientifique', 'chercheu*',
    'universitaire', 'professeu*', 'juriste', 'avocat*', 'magistrat', 'juge', 'eveque', 'archeveque', 'pretre',
    'moine', 'pape', 'cardinal', 'abbe', 'roi', 'reine', 'empereur', 'imperatrice',
    'prince', 'princesse', 'duc', 'duchesse', 'comtesse', 'marquis*', 'baron*', 'noble', 'aristocrate',
    'pharaon', 'sultan', 'calife', 'tsar', 'explorateur', 'exploratrice', 'navigateur', 'navigatrice', 'entrepreneu*', 'industriel', 'banquier*',
    'homme d\'affaires', 'femme d\'affaires', 'criminel*', 'tueur', 'pirate', 'egyptologue', 'editeu*',
    'traducteu*', 'traductrice', 'blogueu*', 'youtubeu*', 'vidasta', 'chef cuisinier', 'cuisinier*',
    'agronome', 'specialiste', 'horloger*', 'lama', 'matador', 'secretaire', 'psychologue', 'psychanalyste', 'psychiatre', 'pharmacien*', 'veterinaire', 'infirmier*',
    'sculptrice', 'ne le', 'nee le', 'ne en', 'nee en', 'mort le', 'morte le', 'ne a', 'nee a', 'decede*',
  ],
  nature: [
    'espece*', 'genre d*', 'sous-famille', 'taxon', 'insecte*', 'plante*',
    'arachnide*', 'araignee*', 'scorpion*', 'pseudoscorpion*', 'reptile*', 'serpent*', 'lezard*', 'oiseau*',
    'poisson*', 'mammifere*', 'chauve-souris', 'rongeur*', 'primate*', 'champignon*', 'lichen*', 'mousse*',
    'algue*', 'bacterie*', 'virus', 'mollusque*', 'gasteropode*', 'amphibien*', 'grenouille*', 'papillon*',
    'coleoptere*', 'lepidoptere*', 'dipteres', 'hymenoptere*', 'fourmi*', 'abeille*', 'crustace*', 'arbre*',
    'arbuste*', 'fleur*', 'orchidee*', 'cepage', 'race', 'dinosaure*', 'fossile*', 'asteroide', 'etoile',
    'galaxie', 'planete', 'exoplanete', 'comete', 'nebuleuse', 'satellite naturel', 'cratere', 'constellation',
    'composé chimique', 'compose chimique', 'molecule', 'proteine', 'enzyme', 'gene', 'genome', 'adn', 'maladie',
    'syndrome', 'medicament', 'mineral', 'roche', 'element chimique', 'isotope', 'theoreme', 'equation',
    'mathematiques', 'physique', 'chimie', 'biologie', 'astronomie', 'cellule', 'hormone', 'recepteur*', 'polymere', 'cycle solaire',
    'volcan', 'seisme', 'cyclone', 'ouragan', 'tempete',
  ],
  culture: [
    'film', 'court metrage', 'long metrage', 'documentaire', 'serie televisee', 'serie', 'telefilm', 'feuilleton',
    'episode', 'emission', 'album', 'chanson', 'single', 'ep', 'groupe', 'orchestre', 'opera', 'ballet',
    'comedie musicale', 'roman', 'livre', 'recueil', 'recompense*', 'poeme', 'essai', 'conte', 'bande dessinee',
    'manga', 'anime', 'jeu video', 'jeu de societe', 'jeu', 'tableau', 'peinture', 'fresque', 'sculpture',
    'statue', 'oeuvre', 'piece de theatre', 'theatre', 'festival', 'media', 'journal', 'quotidien', 'magazine',
    'revue', 'periodique', 'chaine de television', 'station de radio', 'radio', 'personnage', 'mythologie',
    'divinite', 'dieu', 'deesse', 'legende', 'fromage', 'vin', 'biere', 'plat', 'recette', 'cuisine',
    'patisserie', 'langue', 'alphabet', 'lettre', 'police d\'ecriture', 'logiciel', 'site web', 'mode',
    'danse', 'instrument', 'musique', 'genre musical', 'cinema', 'litterature', 'prix litteraire', 'prix',
  ],
  history: [
    'bataille', 'guerre', 'siege', 'traite', 'dynastie', 'royaume', 'empire', 'principaute', 'duche', 'annee',
    'revolution', 'revolte', 'insurrection', 'massacre', 'attentat', 'catastrophe', 'naufrage', 'accident',
    'eglise', 'cathedrale', 'basilique', 'chapelle', 'abbaye', 'prieure', 'monastere', 'couvent', 'temple',
    'mosquee', 'synagogue', 'chateau', 'manoir', 'forteresse', 'fort', 'citadelle', 'palais', 'hotel particulier',
    'monument', 'batiment', 'edifice', 'immeuble', 'gratte-ciel', 'tour', 'musee', 'site archeologique',
    'necropole', 'decoration', 'medaille', 'ordre', 'resolution', 'legislature', 'election*', 'referendum',
    'parti', 'gouvernement', 'loi', 'constitution', 'regiment', 'armee', 'escadrille', 'navire',
    'cuirasse', 'fregate', 'sous-marin', 'paquebot', 'avion', 'locomotive', 'automobile', 'voiture', 'modele',
    'entreprise', 'societe', 'marque', 'organisation', 'association', 'fondation', 'syndicat', 'universite',
    'ecole', 'lycee', 'college', 'institut', 'hopital', 'prison', 'evenement', 'compagnie', 'reseau', 'mouvement', 'conference', 'concile',
    'famille', 'maison de', 'romain', 'antique', 'medieval', 'siecle', 'decennie', 'diocese', 'paroisse',
  ],
  geo: [
    'commune*', 'ville', 'village', 'localite', 'municipalite', 'quartier', 'canton', 'district', 'province',
    'comte', 'region', 'departement', 'arrondissement', 'oblast', 'raion', 'voblast', 'prefecture', 'etat',
    'territoire', 'hameau', 'agglomeration', 'census-designated place', 'township', 'cite', 'banlieue',
    'riviere', 'fleuve', 'affluent', 'cours d\'eau', 'ruisseau', 'lac', 'etang', 'baie', 'golfe', 'detroit',
    'mer', 'ocean', 'ile', 'ilot', 'archipel', 'atoll', 'presqu\'ile', 'peninsule', 'cap', 'plage', 'montagne',
    'mont', 'sommet', 'pic', 'massif', 'chaine de montagnes', 'col', 'vallee', 'gorge', 'plateau', 'plaine',
    'desert', 'foret', 'glacier', 'grotte', 'cascade', 'chute', 'parc', 'reserve naturelle', 'rue', 'avenue',
    'boulevard', 'place', 'pont', 'route', 'autoroute', 'gare', 'station', 'aeroport', 'port', 'phare', 'barrage',
    'canal', 'tunnel', 'ligne', 'unite urbaine', 'etablissement humain', 'parallele', 'meridien', 'pays', 'capitale', 'chef-lieu',
  ],
};

const norm = (t) =>
  (t ?? '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Une expression par thème : \bmot\b, ou \bprefixe\w* pour les entrées en *
const PATTERNS = Object.fromEntries(
  Object.entries(WORDS).map(([id, list]) => [
    id,
    new RegExp(
      `\\b(?:${list
        .map(norm)
        .map((w) => (w.endsWith('*') ? `${esc(w.slice(0, -1))}[\\w-]*` : `${esc(w)}\\b`))
        .join('|')})`,
    ),
  ]),
);

// Années de naissance et de mort « (1850-1920) » : une personne
const LIFESPAN = /\(\s*(?:ne\s+en\s+)?\d{3,4}\s*[-–]\s*\d{3,4}\s*\)|\b\d{4}\s*[-–]\s*\d{4}\b/;

const ORDER = ['sport', 'people', 'nature', 'culture', 'history', 'geo'];

function classify(text) {
  if (!text) return null;
  // Noms de pays qui contiennent un mot d'un autre thème
  const t = norm(text).replace(/royaume-uni|etats-unis|emirats arabes unis/g, ' ');
  let best = null;
  let bestAt = Infinity;
  for (const id of ORDER) {
    const m = PATTERNS[id].exec(t);
    if (m && m.index < bestAt) {
      best = id;
      bestAt = m.index;
    }
  }
  if (!best && LIFESPAN.test(t)) return 'people';
  return best;
}

// Première phrase de l'extrait, sans le titre (« X est une commune… » → « est une commune… »)
function firstSentence(card) {
  const ex = (card.extract ?? '').split(/(?<=[.!?])\s/)[0] ?? '';
  return ex.replace(card.title, '').slice(0, 200);
}

const cache = new Map();

export function themeIdOf(card) {
  const key = `${card.id}:${card.description ?? ''}`;
  if (cache.has(key)) return cache.get(key);
  const id = classify(card.description) ?? classify(firstSentence(card)) ?? 'misc';
  cache.set(key, id);
  return id;
}

export const themeById = (id) => THEMES.find((t) => t.id === id) ?? THEMES[THEMES.length - 1];
export const themeOf = (card) => themeById(themeIdOf(card));

// Paliers d'album par thème
export const ALBUM_TIERS = [
  { id: 'bronze', label: 'Bronze', min: 5, color: '#c87533' },
  { id: 'silver', label: 'Argent', min: 15, color: '#c7c7cc' },
  { id: 'gold', label: 'Or', min: 40, color: '#ffcc00' },
  { id: 'diamond', label: 'Diamant', min: 100, color: '#64d2ff' },
];

export const tierOf = (count) => [...ALBUM_TIERS].reverse().find((t) => count >= t.min) ?? null;
export const nextTierOf = (count) => ALBUM_TIERS.find((t) => count < t.min) ?? null;

// Albums façon Mosaic : chaque thème se remplit page par page, une case par carte
// capturée (dans l'ordre des captures). Une page complète rapporte une récompense,
// et la première page d'un thème débloque son atout.
export const ALBUM_PAGE = 10;
export const PAGE_REWARD = { xp: 80, points: 5 };

export function albumBoard(cards, caught) {
  const albums = THEMES.map((t) => {
    const got = cards
      .filter((c) => caught[c.id] && themeIdOf(c) === t.id)
      .sort((a, b) => caught[a.id].localeCompare(caught[b.id]) || a.title.localeCompare(b.title));
    const pages = Math.floor(got.length / ALBUM_PAGE);
    return { theme: t, total: got.length, pages, page: got.slice(pages * ALBUM_PAGE) };
  });
  const pages = albums.reduce((s, a) => s + a.pages, 0);
  return {
    albums,
    pages,
    pagesByTheme: Object.fromEntries(albums.map((a) => [a.theme.id, a.pages])),
    xp: pages * PAGE_REWARD.xp,
    points: pages * PAGE_REWARD.points,
  };
}
