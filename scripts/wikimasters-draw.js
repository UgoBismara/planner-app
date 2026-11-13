// Tire N articles au hasard dans Wikipédia FR (articles uniquement, sans
// redirections ni pages d'homonymie) et les ajoute aux cartes de l'onglet Wikichasse,
// directement dans Firestore (doc planner/wikimasters-cards, format { v: JSON }).
//
// Chaque carte garde ses vues des 30 derniers jours (views), qui donnent sa rareté
// dans l'onglet (plus l'article est lu, plus la carte est rare, comme dans le jeu).
// Les cartes bonus tirées par l'appli (doc wikimasters-bonus) sont lues pour ne
// jamais retomber sur un article déjà sorti.
//
// Usage : node scripts/wikimasters-draw.js [N=5] [--dry-run] [--force]
//         node scripts/wikimasters-draw.js --backfill   (ajoute les vues manquantes)
// Lancé chaque jour à 8h (Paris) par la routine cloud « Cartes WikiMasters du jour ».

import { drawCard, parisToday, titleKey, views30 } from '../src/data/wikiDraw.js';

const PROJECT = 'planner-app-83b8b';
const API_KEY = 'AIzaSyAXdi1h53I67xY4EZ0oHKtI6wtmoXR6hM8';
const docUrl = (key) =>
  `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/planner/${key}?key=${API_KEY}`;
const CARDS_URL = docUrl('wikimasters-cards');
const BONUS_URL = docUrl('wikimasters-bonus');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const count = Number(args.find((a) => /^\d+$/.test(a)) ?? 5);
const today = parisToday();

// Lit une liste et l'horodatage du doc : l'écriture n'aboutit que si personne
// n'a modifié le doc entre-temps (deux tirages simultanés ne peuvent pas se cumuler)
async function readList(url) {
  const res = await fetch(url);
  if (res.status === 404) return { list: [], updateTime: null };
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — lecture Firestore\n${await res.text()}`);
  const doc = await res.json();
  const raw = doc.fields?.v?.stringValue;
  return { list: raw ? JSON.parse(raw) : [], updateTime: doc.updateTime ?? null };
}

async function writeCards(cards, updateTime) {
  const precondition = updateTime
    ? `&currentDocument.updateTime=${encodeURIComponent(updateTime)}`
    : '&currentDocument.exists=false';
  const res = await fetch(CARDS_URL + precondition, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { v: { stringValue: JSON.stringify(cards) } } }),
  });
  if (res.ok) return true;
  const text = await res.text();
  // Doc modifié depuis la lecture (ou créé entre-temps) : on relira et recommencera
  if (/FAILED_PRECONDITION|ALREADY_EXISTS/.test(text)) return false;
  throw new Error(`${res.status} ${res.statusText} — écriture Firestore\n${text}`);
}

// Un doublon = même page (id) ou même titre, l'id couvrant les pages renommées
function dedupe(cards) {
  const ids = new Set();
  const titles = new Set();
  return cards.filter((c) => {
    if (ids.has(c.id) || titles.has(titleKey(c.title))) return false;
    ids.add(c.id);
    titles.add(titleKey(c.title));
    return true;
  });
}

if (args.includes('--backfill')) {
  const read = await readList(CARDS_URL);
  const cards = [];
  for (const c of read.list) {
    cards.push(typeof c.views === 'number' ? c : { ...c, views: await views30(c.title) });
  }
  if (!dryRun && !(await writeCards(cards, read.updateTime))) {
    throw new Error('Doc modifié pendant le backfill : relancer.');
  }
  for (const c of cards) console.log(`${String(c.views).padStart(7)}  ${c.title}`);
  process.exit(0);
}

for (let round = 1; round <= 3; round++) {
  const read = await readList(CARDS_URL);
  const cards = dedupe(read.list);
  const removed = read.list.length - cards.length;

  // Garde-fou : un second lancement le même jour (relance, test manuel) n'ajoute rien
  const alreadyToday = cards.filter((c) => c.date === today).length;
  if (alreadyToday >= count && !args.includes('--force')) {
    if (removed > 0 && !dryRun && !(await writeCards(cards, read.updateTime))) continue;
    console.log(
      `Déjà ${alreadyToday} carte(s) pour le ${today} : rien à faire (--force pour forcer).` +
        (removed ? ` ${removed} doublon(s) retiré(s).` : ''),
    );
    process.exit(0);
  }

  const { list: bonus } = await readList(BONUS_URL);
  const taken = [...cards, ...bonus];
  const takenIds = new Set(taken.map((c) => c.id));
  const takenTitles = new Set(taken.map((c) => titleKey(c.title)));
  const drawn = [];
  for (let i = 0; i < count; i++) {
    const card = await drawCard(takenIds, takenTitles);
    takenIds.add(card.id);
    takenTitles.add(titleKey(card.title));
    drawn.push(card);
  }

  const next = [...drawn, ...cards];
  if (!dryRun && !(await writeCards(next, read.updateTime))) {
    console.log('Le doc a changé pendant le tirage (autre lancement ?) : nouvelle lecture.');
    continue;
  }

  console.log(`${dryRun ? '[dry-run] ' : ''}${drawn.length} carte(s) ajoutée(s) le ${today} (total ${next.length}) :`);
  if (removed) console.log(`${removed} doublon(s) retiré(s).`);
  for (const c of drawn) console.log(`- ${c.title} — ${c.url}`);
  process.exit(0);
}

throw new Error('Doc modifié en continu pendant 3 tentatives : abandon.');
