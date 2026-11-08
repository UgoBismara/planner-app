// Vérifie le programme natation avant de le livrer : une séance chaque mardi et vendredi,
// des éducatifs qui existent, des volumes qui progressent d'une phase à l'autre.
// Usage : npm run check:swim (ajouter -- --list pour afficher toutes les séances)
import { parseDateKey } from '../src/data/quests.js';
import {
  DRILLS,
  MILESTONES,
  PHASES,
  SESSIONS,
  SWIM_START,
  phaseVolumeRange,
  sessionEventTitle,
} from '../src/data/swimPlan.js';

const errors = [];
const fail = (where, message) => errors.push(`${where} : ${message}`);

const ids = new Set();
SESSIONS.forEach((s, i) => {
  if (ids.has(s.id)) fail(s.id, 'identifiant en double');
  ids.add(s.id);
  const weekday = parseDateKey(s.date).getDay();
  if (weekday !== (s.slot === 'A' ? 2 : 5)) fail(s.id, `${s.date} n’est pas un ${s.slot === 'A' ? 'mardi' : 'vendredi'}`);
  if (i > 0 && s.date <= SESSIONS[i - 1].date) fail(s.id, 'date pas dans l’ordre');
  if (!s.title?.trim()) fail(s.id, 'titre vide');
  if (!s.phase) fail(s.id, 'hors de toute phase');
  if (s.blocks.length < 3) fail(s.id, 'moins de 3 blocs');
  s.blocks.forEach((b, j) => {
    const where = `${s.id} bloc ${j + 1}`;
    if (!DRILLS[b.drill]) fail(where, `éducatif inconnu « ${b.drill} »`);
    if (!Number.isInteger(b.n) || b.n < 1) fail(where, 'nombre de répétitions invalide');
    if (b.d !== 0 && b.d % 25 !== 0) fail(where, `${b.d} m n’est pas un multiple de 25 m`);
    if (b.d === 0 && !DRILLS[b.drill]?.unit) fail(where, 'exercice sans distance ni unité');
  });
  if (s.blocks[0].drill !== 'easy') fail(s.id, 'ne commence pas par un échauffement');
  if (s.blocks[s.blocks.length - 1].drill !== 'cool') fail(s.id, 'ne finit pas par un retour au calme');
  if (s.test !== s.blocks.some((b) => b.drill.startsWith('test'))) fail(s.id, 'drapeau test incohérent');
  if (sessionEventTitle(s).length > 60) fail(s.id, 'titre trop long pour le planning');
  // ~45 min dans l'eau
  if (s.volume > 2000) fail(s.id, `${s.volume} m, trop pour 45 min`);
});

// Toutes les semaines prévues ont leurs deux séances
const lastWeek = Math.max(...SESSIONS.map((s) => s.week));
for (let w = 1; w <= lastWeek; w += 1) {
  ['A', 'B'].forEach((slot) => {
    if (!SESSIONS.some((s) => s.week === w && s.slot === slot)) fail(`semaine ${w}`, `séance ${slot} manquante`);
  });
}
if (parseDateKey(SWIM_START).getDay() !== 1) fail('SWIM_START', 'n’est pas un lundi');

// Les phases s'enchaînent sans trou, et le volume monte de phase en phase
PHASES.forEach((p, i) => {
  if (i > 0 && p.weeks[0] !== PHASES[i - 1].weeks[1] + 1) fail(p.id, 'ne suit pas la phase précédente');
  if (p.upcoming) return;
  const range = phaseVolumeRange(p.id);
  if (!range) fail(p.id, 'aucune séance');
  const prev = i > 0 ? phaseVolumeRange(PHASES[i - 1].id) : null;
  // L'affûtage (dernière phase écrite) a le droit de redescendre
  const isTaper = !PHASES[i + 1] || PHASES[i + 1].upcoming;
  if (prev && range && !isTaper && range[1] <= prev[1]) fail(p.id, `volume max ${range[1]} m pas au-dessus de la phase précédente (${prev[1]} m)`);
});

MILESTONES.forEach((m) => {
  if (!PHASES.some((p) => p.id === m.phase)) fail(m.id, `phase inconnue « ${m.phase} »`);
});

if (process.argv.includes('--list')) {
  SESSIONS.forEach((s) => console.log(`${s.id}  ${s.date}  ${String(s.volume).padStart(4)} m  ${s.light ? 'allégée' : '       '}  ${sessionEventTitle(s)}`));
}
PHASES.forEach((p) => {
  const range = phaseVolumeRange(p.id);
  console.log(`${p.short} ${p.label} : ${range ? `${range[0]}-${range[1]} m par séance` : 'à venir'}`);
});

if (errors.length) {
  console.error(`\n${errors.length} problème(s) :\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`\nOK : ${SESSIONS.length} séances, de ${SESSIONS[0].date} à ${SESSIONS[SESSIONS.length - 1].date}.`);
