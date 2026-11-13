// Tire N articles au hasard dans Wikipédia FR (articles uniquement, sans
// redirections ni pages d'homonymie) et les ajoute aux cartes de l'onglet Cartes,
// directement dans Firestore (doc planner/wikimasters-cards, format { v: JSON }).
//
// Usage : node scripts/wikimasters-draw.js [N=5] [--dry-run] [--force]
// Lancé chaque jour à 8h (Paris) par la routine cloud « Carte WikiMasters du jour ».

const PROJECT = 'planner-app-83b8b';
const API_KEY = 'AIzaSyAXdi1h53I67xY4EZ0oHKtI6wtmoXR6hM8';
const DOC_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/planner/wikimasters-cards?key=${API_KEY}`;
const UA = 'planner-wikimasters/1.0';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const count = Number(args.find((a) => /^\d+$/.test(a)) ?? 5);

// Date du jour à Paris, AAAA-MM-JJ
const today = new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date());

async function getJson(url, init) {
  const res = await fetch(url, { ...init, headers: { 'User-Agent': UA, ...init?.headers } });
  if (!res.ok && res.status !== 404) {
    throw new Error(`${res.status} ${res.statusText} — ${url}\n${await res.text()}`);
  }
  return res.status === 404 ? null : res.json();
}

// Lit les cartes et l'horodatage du doc : l'écriture n'aboutit que si personne
// n'a modifié le doc entre-temps (deux tirages simultanés ne peuvent pas se cumuler)
async function readCards() {
  const doc = await getJson(DOC_URL);
  const raw = doc?.fields?.v?.stringValue;
  return { cards: raw ? JSON.parse(raw) : [], updateTime: doc?.updateTime ?? null };
}

async function writeCards(cards, updateTime) {
  const precondition = updateTime
    ? `&currentDocument.updateTime=${encodeURIComponent(updateTime)}`
    : '&currentDocument.exists=false';
  const res = await fetch(DOC_URL + precondition, {
    method: 'PATCH',
    headers: { 'User-Agent': UA, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { v: { stringValue: JSON.stringify(cards) } } }),
  });
  if (res.ok) return true;
  const text = await res.text();
  // Doc modifié depuis la lecture (ou créé entre-temps) : on relira et recommencera
  if (/FAILED_PRECONDITION|ALREADY_EXISTS/.test(text)) return false;
  throw new Error(`${res.status} ${res.statusText} — écriture Firestore
${text}`);
}

const titleKey = (t) => t.trim().toLocaleLowerCase('fr');

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

async function drawOne(takenIds, takenTitles) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const r = await getJson(
      'https://fr.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnfilterredir=nonredirects&rnlimit=1&format=json',
    );
    const { id, title } = r.query.random[0];
    if (takenIds.has(id)) continue;
    const s = await getJson(
      `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`,
    );
    if (!s || s.type === 'disambiguation') continue;
    const finalTitle = s.title ?? title;
    if (takenTitles.has(titleKey(finalTitle))) continue;
    return {
      id,
      title: finalTitle,
      description: s.description ?? '',
      extract: s.extract ?? '',
      thumb: s.thumbnail?.source ?? '',
      url: s.content_urls?.desktop?.page ?? `https://fr.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      date: today,
    };
  }
  throw new Error('Impossible de tirer un article après 20 essais');
}

for (let round = 1; round <= 3; round++) {
  const read = await readCards();
  const cards = dedupe(read.cards);
  const removed = read.cards.length - cards.length;

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

  const takenIds = new Set(cards.map((c) => c.id));
  const takenTitles = new Set(cards.map((c) => titleKey(c.title)));
  const drawn = [];
  for (let i = 0; i < count; i++) {
    const card = await drawOne(takenIds, takenTitles);
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
