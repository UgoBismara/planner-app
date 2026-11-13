// Tirage d'un article au hasard dans Wikipédia FR, partagé par l'appli (cartes
// bonus) et par scripts/wikimasters-draw.js (tirage quotidien). Sans dépendance :
// fetch natif, utilisable dans le navigateur comme dans Node 18+.

// Wikimedia demande d'identifier les clients : fait côté Node (script). Dans le
// navigateur, aucun en-tête : un en-tête perso déclenche un preflight CORS que
// l'API des vues (wikimedia.org) refuse (405), et le navigateur envoie déjà le sien.
const HEADERS = typeof window === 'undefined' ? { 'User-Agent': 'planner-wikimasters/1.0' } : {};

export const parisToday = () =>
  new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date());

export const titleKey = (t) => t.trim().toLocaleLowerCase('fr');

async function getJson(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json();
}

// Vues humaines (hors robots) des 30 derniers jours complets ; null si indisponible
export async function views30(title) {
  const fmt = (d) => d.toISOString().slice(0, 10).replace(/-/g, '');
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 29);
  try {
    const r = await getJson(
      `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/${encodeURIComponent(title.replace(/ /g, '_'))}/daily/${fmt(start)}/${fmt(end)}`,
    );
    return r ? r.items.reduce((sum, i) => sum + i.views, 0) : 0;
  } catch {
    return null;
  }
}

// Un article au hasard (ni redirection, ni homonymie), absent de takenIds/takenTitles
export async function drawCard(takenIds, takenTitles, extra = {}) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const r = await getJson(
      'https://fr.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnfilterredir=nonredirects&rnlimit=1&format=json&origin=*',
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
      views: await views30(finalTitle),
      url: s.content_urls?.desktop?.page ?? `https://fr.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      date: parisToday(),
      ...extra,
    };
  }
  throw new Error('Impossible de tirer un article après 20 essais');
}
