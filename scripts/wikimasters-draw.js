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

async function readCards() {
  const doc = await getJson(DOC_URL);
  const raw = doc?.fields?.v?.stringValue;
  return raw ? JSON.parse(raw) : [];
}

async function drawOne(taken) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const r = await getJson(
      'https://fr.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnfilterredir=nonredirects&rnlimit=1&format=json',
    );
    const { id, title } = r.query.random[0];
    if (taken.has(id)) continue;
    const s = await getJson(
      `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`,
    );
    if (!s || s.type === 'disambiguation') continue;
    return {
      id,
      title: s.title ?? title,
      description: s.description ?? '',
      extract: s.extract ?? '',
      thumb: s.thumbnail?.source ?? '',
      url: s.content_urls?.desktop?.page ?? `https://fr.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      date: today,
    };
  }
  throw new Error('Impossible de tirer un article après 20 essais');
}

const cards = await readCards();

// Garde-fou : un second lancement le même jour (relance, test manuel) n'ajoute rien
const alreadyToday = cards.filter((c) => c.date === today).length;
if (alreadyToday >= count && !args.includes('--force')) {
  console.log(`Déjà ${alreadyToday} carte(s) pour le ${today} : rien à faire (--force pour forcer).`);
  process.exit(0);
}

const taken = new Set(cards.map((c) => c.id));
const drawn = [];
for (let i = 0; i < count; i++) {
  const card = await drawOne(taken);
  taken.add(card.id);
  drawn.push(card);
}

const next = [...drawn, ...cards];
if (!dryRun) {
  await getJson(DOC_URL, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { v: { stringValue: JSON.stringify(next) } } }),
  });
}

console.log(`${dryRun ? '[dry-run] ' : ''}${drawn.length} carte(s) ajoutée(s) le ${today} (total ${next.length}) :`);
for (const c of drawn) console.log(`- ${c.title} — ${c.url}`);
