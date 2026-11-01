// Vérifie le contenu de l'onglet Maths avant de le livrer : structure des chapitres,
// formules compilées par KaTeX, générateurs lancés sur 500 graines, et succès tous
// atteignables. Usage : npm run check:maths
import katex from 'katex';
import { MATHS_ACHIEVEMENTS } from '../src/data/maths/achievements.js';
import { ANSWER_TYPES, checkAnswer, expectedInput } from '../src/data/maths/answers.js';
import {
  BLOCK_TYPES,
  CHAPTERS,
  DOMAINS,
  ITEMS,
  KINDS,
  LEVELS,
  computeStats,
  readKey,
} from '../src/data/maths/index.js';
import { KATEX_MACROS } from '../src/data/maths/katex.js';
import { makeRng } from '../src/data/maths/random.js';

const SEEDS = 500;
const MIN_EXERCISES = 12;
const MIN_GENERATORS = 3;

const errors = [];
const fail = (where, message) => errors.push(`${where} : ${message}`);

// $$…$$ ou $…$ ; un $ restant ensuite signale une formule mal fermée
const MATH = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g;

const checkText = (where, text) => {
  if (typeof text !== 'string' || !text.trim()) {
    fail(where, 'texte vide');
    return;
  }
  // Les blocs de code (~~~python) ne sont ni du Markdown ni du LaTeX
  const prose = text.replace(/~~~[\s\S]*?~~~/g, '');
  ['NaN', 'undefined', 'Infinity', '[object'].forEach((bad) => {
    if (prose.includes(bad)) fail(where, `contient « ${bad} »`);
  });
  if (/^ {4,}\S/m.test(prose)) fail(where, 'ligne indentée de 4 espaces ou plus (lue comme du code)');
  let rest = prose;
  for (const [whole, display, inline] of prose.matchAll(MATH)) {
    const tex = display ?? inline;
    try {
      katex.renderToString(tex, {
        macros: { ...KATEX_MACROS },
        displayMode: display !== undefined,
        throwOnError: true,
        strict: 'ignore',
      });
    } catch (error) {
      fail(where, `formule « ${tex.trim().slice(0, 70)} » : ${error.message.split('\n')[0]}`);
    }
    rest = rest.replace(whole, '');
  }
  if (rest.includes('$')) fail(where, 'symbole $ isolé (formule mal fermée ?)');
};

const checkAnswerShape = (where, answer, kind) => {
  if (!ANSWER_TYPES.includes(answer.type)) {
    fail(where, `type de réponse inconnu « ${answer.type} »`);
    return;
  }
  if (answer.type === 'choice') {
    const { options, correct } = answer;
    if (!Array.isArray(options) || options.length < 2) {
      fail(where, 'QCM sans options');
      return;
    }
    if (new Set(options).size !== options.length) fail(where, 'options de QCM en double');
    if (!(correct >= 0 && correct < options.length)) fail(where, 'bonne réponse hors des options');
    options.forEach((o, i) => checkText(`${where}, option ${i + 1}`, o));
  }
  if (kind === 'qcm' && answer.type !== 'choice') fail(where, 'un QCM attend une réponse « choice »');
  if (kind === 'vrai-faux' && answer.type !== 'truefalse') fail(where, 'un vrai-faux attend une réponse « truefalse »');
  const expected = expectedInput(answer);
  const result = checkAnswer(answer, expected);
  if (result.status !== 'correct') fail(where, `la réponse attendue « ${expected} » est refusée (${result.status})`);
};

const kindIds = KINDS.map((k) => k.id);
const blockIds = BLOCK_TYPES.map((b) => b.id);
const seenIds = new Set();
const started = Date.now();

CHAPTERS.forEach((chapter) => {
  if (!DOMAINS.some((d) => d.id === chapter.domain && d.chapters.includes(chapter))) {
    fail(chapter.id, `domaine « ${chapter.domain} » incohérent avec DOMAINS`);
  }
  ['title', 'levels', 'summary'].forEach((field) => {
    if (!chapter[field]) fail(chapter.id, `champ « ${field} » manquant`);
  });

  const sections = new Set();
  chapter.lesson.forEach((section) => {
    const where = `${chapter.id}/${section.id}`;
    if (sections.has(section.id)) fail(where, 'section en double');
    sections.add(section.id);
    if (!section.title) fail(where, 'titre manquant');
    if (!LEVELS.includes(section.level)) fail(where, `niveau « ${section.level} » inconnu`);
    if (!section.blocks?.length) fail(where, 'section sans bloc');
    section.blocks.forEach((block, i) => {
      if (!blockIds.includes(block.type)) fail(`${where}, bloc ${i + 1}`, `type « ${block.type} » inconnu`);
      checkText(`${where}, bloc ${i + 1}`, block.body);
    });
  });

  const checkCommon = (item) => {
    if (seenIds.has(item.id)) fail(item.id, 'id déjà utilisé');
    seenIds.add(item.id);
    if (!sections.has(item.section)) fail(item.id, `section « ${item.section} » inconnue`);
    if (!item.title) fail(item.id, 'titre manquant');
    if (![1, 2, 3, 4].includes(item.difficulty)) fail(item.id, 'difficulté hors de 1 à 4');
    if (!LEVELS.includes(item.level)) fail(item.id, `niveau « ${item.level} » inconnu`);
    if (!kindIds.includes(item.kind)) fail(item.id, `type « ${item.kind} » inconnu`);
    (item.hints ?? []).forEach((hint, i) => checkText(`${item.id}, indice ${i + 1}`, hint));
  };

  chapter.exercises.forEach((ex) => {
    checkCommon(ex);
    checkText(`${ex.id}, énoncé`, ex.statement);
    checkText(`${ex.id}, corrigé`, ex.solution);
    if (ex.answer) checkAnswerShape(ex.id, ex.answer, ex.kind);
    else if (['qcm', 'vrai-faux', 'code'].includes(ex.kind)) fail(ex.id, `un exercice « ${ex.kind} » attend une réponse`);
  });

  chapter.generators.forEach((gen) => {
    checkCommon(gen);
    if (typeof gen.generate !== 'function') {
      fail(gen.id, 'generate manquant');
      return;
    }
    for (let seed = 1; seed <= SEEDS; seed += 1) {
      const where = `${gen.id} (graine ${seed})`;
      const before = errors.length;
      try {
        const out = gen.generate(makeRng(seed));
        checkText(`${where}, énoncé`, out.statement);
        checkText(`${where}, corrigé`, out.solution);
        if (out.answer) checkAnswerShape(where, out.answer, gen.kind);
        else fail(where, 'pas de réponse');
      } catch (error) {
        fail(where, `plante : ${error.message}`);
      }
      // Une graine fautive suffit à signaler le générateur
      if (errors.length > before) break;
    }
  });

  const count = (list, key) => new Set(list.map((it) => it[key])).size;
  if (chapter.exercises.length < MIN_EXERCISES) {
    fail(chapter.id, `${chapter.exercises.length} exercices rédigés, ${MIN_EXERCISES} au minimum`);
  }
  if (count(chapter.exercises, 'difficulty') < 4) fail(chapter.id, 'les 4 difficultés ne sont pas toutes couvertes');
  if (count(chapter.exercises, 'kind') < 4) fail(chapter.id, 'moins de 4 types d’exercices');
  if (chapter.generators.length < MIN_GENERATORS) fail(chapter.id, `moins de ${MIN_GENERATORS} générateurs`);
});

// Succès : tous doivent se débloquer avec un historique complet sur le contenu livré
const attempts = {};
const drills = {};
const read = {};
ITEMS.forEach((it) => {
  if (it.generated) drills[it.id] = { solo: 25, aide: 0, rate: 0, run: 3, validated: true };
  else attempts[it.id] = ['rate', 'aide', 'solo'].map((result) => ({ date: '2026-01-01', at: '', result }));
});
CHAPTERS.forEach((c) => c.lesson.forEach((s) => (read[readKey(c.id, s.id)] = '2026-01-01')));
const stats = computeStats({ attempts, drills, read, days: ['2026-01-01', '2026-02-01'] });
MATHS_ACHIEVEMENTS.filter((a) => !a.check(stats)).forEach((a) => {
  fail(`succès ${a.id}`, `inatteignable avec le contenu actuel (${a.description})`);
});

// ── Bilan ──
CHAPTERS.forEach((chapter) => {
  const byDifficulty = [1, 2, 3, 4].map((d) => chapter.exercises.filter((e) => e.difficulty === d).length);
  const kinds = KINDS.map((k) => `${k.label} ${chapter.exercises.filter((e) => e.kind === k.id).length}`);
  console.log(
    `${chapter.title} : ${chapter.lesson.length} sections, ${chapter.exercises.length} exercices ` +
      `(étoiles 1 à 4 : ${byDifficulty.join(' / ')} ; ${kinds.join(', ')}), ${chapter.generators.length} générateurs`,
  );
});

if (errors.length > 0) {
  console.error(`\n${errors.length} problème(s) :`);
  errors.slice(0, 100).forEach((e) => console.error(`- ${e}`));
  process.exit(1);
}
console.log(`\nContenu Maths vérifié en ${((Date.now() - started) / 1000).toFixed(1)} s : aucune erreur.`);
