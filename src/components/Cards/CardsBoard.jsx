import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Brain,
  Check,
  ChevronRight,
  ClipboardCheck,
  Copy,
  Eye,
  ExternalLink,
  Flame,
  FlaskConical,
  Gem,
  Gift,
  Library,
  Lock,
  Medal,
  Package,
  RotateCcw,
  Search,
  Shuffle,
  Skull,
  Sparkle,
  Sparkles,
  Spade,
  Swords,
  Target,
  Trophy,
  Wand2,
  X,
} from 'lucide-react';
import { useLocalStorage, writeStoredValue } from '../../hooks/useLocalStorage';
import { ACHIEVEMENTS, ACHIEVEMENTS_KEY, buildContext } from '../../data/wikiAchievements';
import AchievementsView from './AchievementsView';
import AlbumView from './AlbumView';
import AtoutsView from './AtoutsView';
import ChestReveal from './ChestReveal';
import QuestsView from './QuestsView';
import ResearchView from './ResearchView';
import SeasonPanel from './SeasonPanel';
import BossPanel from './BossPanel';
import QuizPanel from './QuizPanel';
import AventPanel from './AventPanel';
import { QUIZ_KEY, QUIZ_SIZE, quizOf } from '../../data/wikiQuiz';
import { AVENT_KEY } from '../../data/wikiAvent';
import { EMPTY_RESEARCH, RESEARCH_KEY, effectsOf, pointsSpent } from '../../data/wikiResearch';
import { ACH_POINTS, ACH_POINTS_HIDDEN, MISSION_BONUS, cardXp, computeEconomy } from '../../data/wikiEconomy';
import { CHESTS_KEY } from '../../data/wikiChests';
import { COMMUNE_KEY, DEFI_REWARD, modifierOf } from '../../data/wikiDefi';
import { LOADOUT_KEY, atoutById } from '../../data/wikiAtouts';
import { DIVISIONS } from '../../data/wikiSeason';
import { themeOf } from '../../data/wikiThemes';
import { drawCard, titleKey } from '../../data/wikiDraw';
import {
  BONUS_KEY,
  CARDS_KEY,
  CAUGHT_KEY,
  CARDS_PER_DAY,
  GAME_NAME,
  RARITIES,
  isDrawCard,
  isShiny,
  levelOf,
  rarityOf,
  streakOf,
  titleOf,
  xpForLevel,
} from '../../data/wikimasters';
import './CardsBoard.css';

const VIEWS = [
  { id: 'cards', label: 'Cartes' },
  { id: 'quests', label: 'Défis' },
  { id: 'album', label: 'Album' },
  { id: 'atouts', label: 'Atouts' },
  { id: 'research', label: 'Labo' },
  { id: 'achievements', label: 'Succès' },
];

// « +30 Chronomètre », « ×2 Marée basse »
const fmtEffect = (f) => (f.mult ? `×${String(f.mult).replace('.', ',')}` : `+${f.add}`);

const FILTERS = [
  { id: 'todo', label: 'À capturer' },
  { id: 'all', label: 'Toutes' },
  { id: 'caught', label: 'Capturées' },
];

const todayIso = () =>
  new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(new Date());

function dayLabel(iso, today) {
  if (iso === 'bonus') return 'Cartes bonus';
  if (iso === today) return "Aujourd'hui";
  const d = new Date(`${iso}T12:00:00`);
  const y = new Date(`${today}T12:00:00`);
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

// Une carte par page et par titre (le script l'assure déjà, l'affichage aussi)
function uniqueCards(raw) {
  const seen = new Set();
  return raw.filter((c) => {
    const k = c.title.trim().toLocaleLowerCase('fr');
    if (seen.has(c.id) || seen.has(k)) return false;
    seen.add(c.id);
    seen.add(k);
    return true;
  });
}

// Recherche plein texte : sans casse ni accents
const norm = (t) => (t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function CardsBoard() {
  // Les cartes du jour sont tirées par l'appli à la première ouverture de la journée
  // (le cloud des routines n'a pas accès à Wikipédia) ; écrites via writeStoredValue
  const [rawCards] = useLocalStorage(CARDS_KEY, []);
  // Cartes bonus : tirées par l'appli quand il ne reste rien à capturer
  const [rawBonus, setBonus] = useLocalStorage(BONUS_KEY, []);
  const [caught, setCaught] = useLocalStorage(CAUGHT_KEY, {});
  // Date de premier déblocage de chaque succès (jamais retirée)
  const [unlocked] = useLocalStorage(ACHIEVEMENTS_KEY, {});
  // Recherches débloquées et relances utilisées (points gagnés : recalculés)
  const [researchRaw] = useLocalStorage(RESEARCH_KEY, EMPTY_RESEARCH);
  // unlockedNow : recherches achetées sur cet appareil, affichées sans attendre
  // que Firestore renvoie l'écriture
  const [unlockedNow, setUnlockedNow] = useState({});
  const research = { ...EMPTY_RESEARCH, ...(researchRaw ?? {}) };
  research.unlocked = { ...research.unlocked, ...unlockedNow };
  const researchQueue = useRef(Promise.resolve()); // écritures des achats, une à la fois
  // Coffres ouverts : { [date de la journée]: date d'ouverture }. openedNow couvre
  // le temps que Firestore renvoie l'écriture
  const [openedRaw] = useLocalStorage(CHESTS_KEY, {});
  const [openedNow, setOpenedNow] = useState({});
  const opened = { ...(openedRaw ?? {}), ...openedNow };
  const [opening, setOpening] = useState(null); // { chest, phase: 'shake' | 'open' }
  // Carte commune du défi, une par jour : { [date]: carte }
  const [communeRaw] = useLocalStorage(COMMUNE_KEY, {});
  // Atouts équipés, par date de prise d'effet ; loadoutNow : affiché sans attendre Firestore
  const [loadoutsRaw] = useLocalStorage(LOADOUT_KEY, {});
  const [loadoutNow, setLoadoutNow] = useState({});
  const loadouts = { ...(loadoutsRaw ?? {}), ...loadoutNow };
  // Réponses au quiz ({ [date]: [{ id, ok }] }) et cases de l'Avent ouvertes ;
  // les *Now couvrent le temps que Firestore renvoie l'écriture
  const [quizRaw] = useLocalStorage(QUIZ_KEY, {});
  const [quizNow, setQuizNow] = useState({});
  const quiz = { ...(quizRaw ?? {}), ...quizNow };
  const [aventRaw] = useLocalStorage(AVENT_KEY, {});
  const [aventNow, setAventNow] = useState({});
  const avent = { ...(aventRaw ?? {}), ...aventNow };
  const [busy, setBusy] = useState(false); // recherche ou relance en cours
  const [query, setQuery] = useState('');
  const [bonusState, setBonusState] = useState('idle'); // idle | drawing | error
  const [dailyState, setDailyState] = useState('idle'); // idle | drawing | error
  const [view, setView] = useState('cards'); // cards | research | achievements
  const [filter, setFilter] = useState('todo');
  const [copiedId, setCopiedId] = useState(null);
  const [toast, setToast] = useState(null);
  const copiedTimer = useRef(null);
  const toastTimer = useRef(null);
  const today = todayIso();
  const communeCards = Object.values(communeRaw ?? {}).map((c) => ({ ...c, commune: true }));
  const cards = uniqueCards([...communeCards, ...rawCards, ...rawBonus]);
  const daily = cards.filter(isDrawCard);
  const modifier = modifierOf(today);
  const communeToday = communeCards.find((c) => c.date === today);

  const fx = effectsOf(research.unlocked);
  const target = CARDS_PER_DAY + fx.extraCards; // cartes du jour à tirer
  const rerollsLeft = Math.max(0, fx.rerollsPerDay - (research.rerolls[today] ?? 0));

  const econ = computeEconomy({ cards, caught, opened, fx, today, loadouts, quiz, avent });
  const questions = quizOf(today, cards, caught);
  const quizToday = quiz[today] ?? [];
  const quizLeft = questions.length ? QUIZ_SIZE - quizToday.filter(Boolean).length : 0;
  const bossNow = econ.boss.current;
  const xp = econ.xp;
  const level = levelOf(xp);
  const levelStart = xpForLevel(level);
  const levelEnd = xpForLevel(level + 1);
  const streak = streakOf(daily, caught, today, fx.freeze);

  const achContext = buildContext({ cards, caught, level, today, fx, econ, research: research.unlocked });
  const achResults = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a.check(achContext)]));
  const achDoneList = ACHIEVEMENTS.filter((a) => unlocked[a.id] || achResults[a.id].done);
  const achDone = achDoneList.length;
  const newlyDone = ACHIEVEMENTS.filter((a) => achResults[a.id].done && !unlocked[a.id])
    .map((a) => a.id)
    .join(',');

  // Points de recherche : captures, journées, quêtes, coffres et succès
  const earned = econ.points + achDoneList.reduce((s, a) => s + (a.hidden ? ACH_POINTS_HIDDEN : ACH_POINTS), 0);
  const points = Math.max(0, earned - pointsSpent(research.unlocked));

  const chestsToOpen = econ.chests.filter((c) => !c.opened);
  const nextChest = chestsToOpen[chestsToOpen.length - 1]; // le plus ancien d'abord
  const questsDone = econ.quests.today.filter((q) => q.done).length;

  const todayCards = daily.filter((c) => c.date === today);
  const todayCaught = todayCards.filter((c) => caught[c.id]).length;
  const perfectToday = todayCards.length > 0 && todayCaught === todayCards.length;
  // Mission du jour : une capture, n'importe laquelle (c'est elle qui tient la série)
  const capturesToday = econ.sameDay.get(today) ?? 0;
  const missionDone = capturesToday > 0;
  const defiDone = Boolean(communeToday && caught[communeToday.id] === today);
  // Équipement figé dès la première capture du jour
  const atoutsLocked = capturesToday > 0;
  const division = DIVISIONS[econ.season.division];

  // Plus rien à capturer : une carte bonus est tirée. Petit délai pour laisser
  // Firestore livrer d'éventuelles nouvelles cartes avant de conclure.
  const todoCount = cards.filter((c) => !caught[c.id]).length;
  const drawingRef = useRef(false);
  const latest = useRef({ cards, caught });
  useEffect(() => {
    latest.current = { cards, caught };
  });
  // Tirage du jour : s'il manque des cartes aujourd'hui, l'appli les tire elle-même.
  // Petit délai pour laisser Firestore livrer un tirage fait sur un autre appareil ;
  // Firestore est relu juste avant d'écrire, donc deux appareils ne doublent pas le tirage.
  const dailyTried = useRef('');
  const drawDaily = async () => {
    if (drawingRef.current) return;
    drawingRef.current = true;
    dailyTried.current = `${today}:${target}`;
    setDailyState('drawing');
    try {
      const all = latest.current.cards;
      const ids = new Set(all.map((c) => c.id));
      const titles = new Set(all.map((c) => titleKey(c.title)));
      const need = target - all.filter((c) => !c.bonus && c.date === today).length;
      const take = (card) => {
        ids.add(card.id);
        titles.add(titleKey(card.title));
        return card;
      };
      const drawn = [];
      for (let i = 0; i < need; i++) {
        // Flair : la plus lue de 3 candidates
        if (i < fx.flairCards) {
          const cands = [];
          for (let k = 0; k < 3; k++) cands.push(take(await drawCard(ids, titles)));
          drawn.push(cands.reduce((a, b) => ((b.views ?? -1) > (a.views ?? -1) ? b : a)));
        } else {
          drawn.push(take(await drawCard(ids, titles)));
        }
      }
      let added = 0;
      if (drawn.length > 0) {
        await writeStoredValue(CARDS_KEY, (base) => {
          const list = Array.isArray(base) ? base : [];
          const have = list.filter((c) => c.date === today).length;
          if (have >= target) return null;
          const takenIds = new Set([...list, ...latest.current.cards].map((c) => c.id));
          const takenTitles = new Set([...list, ...latest.current.cards].map((c) => titleKey(c.title)));
          const fresh = drawn
            .filter((c) => !takenIds.has(c.id) && !takenTitles.has(titleKey(c.title)))
            .slice(0, target - have);
          added = fresh.length;
          return added > 0 ? [...fresh, ...list] : null;
        });
      }
      // Carte commune du défi : une par jour, Firestore relu avant d'écrire (un
      // seul tirage même si deux appareils ouvrent l'onglet en même temps)
      if (!latest.current.cards.some((c) => c.commune && c.date === today)) {
        const commune = await drawCard(ids, titles);
        await writeStoredValue(COMMUNE_KEY, (base) => {
          const b = base ?? {};
          if (b[today]) return null;
          return { ...b, [today]: { ...commune, date: today } };
        });
      }
      if (added > 0) showToast({ kind: 'bonus', text: `${added} nouvelles cartes à capturer !` });
      setDailyState('idle');
    } catch {
      dailyTried.current = '';
      setDailyState('error');
    } finally {
      drawingRef.current = false;
    }
  };
  const hasCommune = Boolean(communeToday);
  useEffect(() => {
    if ((todayCards.length >= target && hasCommune) || dailyState !== 'idle' || dailyTried.current === `${today}:${target}`) return;
    const t = setTimeout(drawDaily, 1500);
    return () => clearTimeout(t);
    // drawDaily lit l'état courant via latest
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayCards.length, hasCommune, dailyState, today, target]);

  const drawBonus = async () => {
    if (drawingRef.current) return;
    drawingRef.current = true;
    setBonusState('drawing');
    try {
      const all = latest.current.cards;
      const card = await drawCard(
        new Set(all.map((c) => c.id)),
        new Set(all.map((c) => titleKey(c.title))),
        { bonus: true },
      );
      // Une nouvelle carte à capturer est arrivée pendant le tirage : pas de bonus
      const { cards: now, caught: nowCaught } = latest.current;
      if (now.some((c) => !nowCaught[c.id])) return;
      setBonus((prev) => [card, ...(prev ?? [])]);
      showToast({ kind: 'bonus', text: 'Nouvelle carte bonus !' });
    } catch {
      setBonusState('error');
    } finally {
      drawingRef.current = false;
      setBonusState((st) => (st === 'drawing' ? 'idle' : st));
    }
  };
  useEffect(() => {
    // Pas de bonus tant que le tirage du jour n'est pas complet
    if (cards.length === 0 || todoCount > 0 || bonusState !== 'idle' || todayCards.length < target) return;
    const t = setTimeout(drawBonus, 1200);
    return () => clearTimeout(t);
    // drawBonus lit l'état courant via latest : seuls ces compteurs déclenchent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length, todoCount, bonusState, todayCards.length, target]);

  const showToast = (t, ms = 2200) => {
    setToast(t);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  };

  // Nouveau succès rempli : date enregistrée une fois pour toutes. Firestore est relu
  // juste avant d'écrire (writeStoredValue) : sur un appareil qui vient d'ouvrir
  // l'appli, les dates déjà enregistrées ailleurs ne sont ni écrasées ni refêtées.
  useEffect(() => {
    if (!newlyDone) return;
    const t = setTimeout(async () => {
      let added = [];
      await writeStoredValue(ACHIEVEMENTS_KEY, (base) => {
        const b = base ?? {};
        added = newlyDone.split(',').filter((id) => !b[id]);
        if (added.length === 0) return null;
        return { ...b, ...Object.fromEntries(added.map((id) => [id, todayIso()])) };
      });
      if (added.length === 0) return;
      const list = added.map((id) => ACHIEVEMENTS.find((a) => a.id === id)).filter(Boolean);
      const pts = list.reduce((s, a) => s + (a.hidden ? ACH_POINTS_HIDDEN : ACH_POINTS), 0);
      const more = list.length > 1 ? ` (+${list.length - 1})` : '';
      showToast({ kind: 'achievement', text: `Succès : ${list[0].name}${more} · +${pts} pts` }, 3500);
    }, 1500);
    return () => clearTimeout(t);
  }, [newlyDone]);

  // Débloque une recherche. Firestore est relu avant d'écrire : les points sont
  // revérifiés sur les recherches réellement enregistrées (autre appareil compris).
  // L'achat s'affiche tout de suite ; l'écriture suit, en file pour que des achats
  // enchaînés ne s'écrasent pas. Refusée (points insuffisants d'après Firestore,
  // autre appareil compris) : l'achat est retiré.
  const doResearch = (r) => {
    if (research.unlocked[r.id] || points < r.cost) return;
    setUnlockedNow((prev) => ({ ...prev, [r.id]: today }));
    showToast({ kind: 'research', text: `Recherche terminée : ${r.name}` }, 3000);
    researchQueue.current = researchQueue.current.then(async () => {
      let refused = false;
      await writeStoredValue(RESEARCH_KEY, (base) => {
        const b = { ...EMPTY_RESEARCH, ...(base ?? {}) };
        if (b.unlocked[r.id]) return null;
        if (earned - pointsSpent(b.unlocked) < r.cost) {
          refused = true;
          return null;
        }
        return { ...b, unlocked: { ...b.unlocked, [r.id]: today } };
      });
      if (!refused) return;
      setUnlockedNow((prev) => {
        const next = { ...prev };
        delete next[r.id];
        return next;
      });
      showToast({ kind: 'research', text: `Recherche annulée : pas assez de points` }, 3000);
    });
  };

  // Équipe des atouts pour aujourd'hui (refusé après la première capture du jour,
  // ou si un atout n'est pas débloqué). Affiché tout de suite, écrit ensuite.
  const saveLoadout = (ids) => {
    if (atoutsLocked) return;
    const clean = ids.filter((id) => econ.atouts.unlocked.includes(id)).slice(0, econ.atouts.slots);
    setLoadoutNow((prev) => ({ ...prev, [today]: clean }));
    writeStoredValue(LOADOUT_KEY, (base) => ({ ...(base ?? {}), [today]: clean }));
    showToast({ kind: 'research', text: clean.length ? `Atouts équipés : ${clean.map((id) => atoutById(id).name).join(', ')}` : 'Aucun atout équipé' }, 3000);
  };

  // Quiz : une réponse par question, définitive
  const answerQuiz = (index, card, ok) => {
    if (quizToday[index]) return;
    const list = [...quizToday];
    list[index] = { id: card.id, ok };
    setQuizNow((prev) => ({ ...prev, [today]: list }));
    writeStoredValue(QUIZ_KEY, (base) => {
      const b = base ?? {};
      const cur = [...(b[today] ?? [])];
      if (cur[index]) return null;
      cur[index] = { id: card.id, ok };
      return { ...b, [today]: cur };
    });
    const perfect = list.filter((a) => a?.ok).length === QUIZ_SIZE;
    showToast({ kind: ok ? 'quest' : 'research', text: perfect ? 'Quiz parfait !' : ok ? 'Bonne réponse !' : 'Raté…' });
  };

  // Calendrier de l'Avent : ouverture d'une case gagnée
  const openAvent = (c) => {
    setAventNow((prev) => ({ ...prev, [c.date]: today }));
    writeStoredValue(AVENT_KEY, (base) => {
      const b = base ?? {};
      if (b[c.date]) return null;
      return { ...b, [c.date]: today };
    });
    const gain = c.loot.xp ? `+${Math.round(c.loot.xp * fx.xpMult)} XP` : `+${c.loot.points} pts`;
    showToast({ kind: c.loot.jackpot ? 'level' : 'bonus', text: `${c.loot.label} ! ${gain}` }, 3000);
  };

  // Relance : une carte du jour non capturée est remplacée par un nouveau tirage
  const reroll = async (card) => {
    if (busy || rerollsLeft <= 0) return;
    setBusy(true);
    try {
      const all = latest.current.cards;
      const fresh = await drawCard(new Set(all.map((c) => c.id)), new Set(all.map((c) => titleKey(c.title))));
      let used = false;
      await writeStoredValue(RESEARCH_KEY, (base) => {
        const b = { ...EMPTY_RESEARCH, ...(base ?? {}) };
        const n = b.rerolls[today] ?? 0;
        if (n >= fx.rerollsPerDay) return null;
        used = true;
        // Seul le compteur du jour est gardé
        return { ...b, rerolls: { [today]: n + 1 } };
      });
      if (!used) return;
      await writeStoredValue(CARDS_KEY, (base) => {
        const list = Array.isArray(base) ? base : [];
        if (!list.some((c) => c.id === card.id)) return null;
        return list.map((c) => (c.id === card.id ? { ...fresh, date: card.date } : c));
      });
      showToast({ kind: 'research', text: `Relance : ${fresh.title}` });
    } catch {
      showToast({ kind: 'research', text: 'La relance a échoué' });
    } finally {
      setBusy(false);
    }
  };

  // Clic sur le titre : copié pour le coller dans la recherche du jeu
  const copyTitle = async (card) => {
    try {
      await navigator.clipboard.writeText(card.title);
    } catch {
      // Repli pour les navigateurs sans API presse-papiers (http, vieux Safari)
      const ta = document.createElement('textarea');
      ta.value = card.title;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopiedId(card.id);
    clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopiedId(null), 1500);
  };

  const toggle = (card) => {
    const next = { ...caught };
    if (next[card.id]) {
      delete next[card.id];
      setCaught(next);
      return;
    }
    next[card.id] = today;
    setCaught(next);

    const r = rarityOf(card);
    const after = computeEconomy({ cards, caught: next, opened, fx, today, loadouts });
    const gain = after.xp - xp;
    const newLevel = levelOf(after.xp);
    const dayCards = daily.filter((c) => c.date === card.date);
    const dayDone = isDrawCard(card) && dayCards.every((c) => next[c.id]);
    const firstToday = capturesToday === 0;
    const defiWon = card.commune && card.date === today;
    const fired = after.perCard[card.id]?.fired ?? [];
    const combo = fired.length >= 2 ? ` · ${fired.map((f) => f.name).join(' + ')}` : '';
    const newDiv = after.season.division > econ.season.division ? DIVISIONS[after.season.division] : null;
    const bossKilled = Boolean(after.boss.current.killedOn) && !econ.boss.current.killedOn;
    const newQuest = after.quests.today.find((q) => q.done && !econ.quests.today.find((o) => o.id === q.id)?.done);
    const weeklyDone = after.quests.weekly.done && !econ.quests.weekly.done;
    const newChest = after.chests.some((c) => !econ.chests.some((o) => o.id === c.id));
    if (newLevel > level) {
      const why = bossKilled ? 'Boss vaincu · ' : defiWon ? 'Défi réussi · ' : newDiv ? `Division ${newDiv.name} · ` : '';
      showToast({ kind: 'level', text: `${why}Niveau ${newLevel} — ${titleOf(newLevel)} !` }, 3500);
    } else if (bossKilled) {
      showToast({ kind: 'level', text: `${after.boss.current.boss.name} est vaincu ! +${gain} XP` }, 3500);
    } else if (newDiv) {
      showToast({ kind: 'level', text: `Promotion : division ${newDiv.name} ! +${gain} XP` }, 3500);
    } else if (defiWon) {
      showToast({ kind: 'mission', text: `Défi du jour réussi ! +${gain} XP${combo}` }, 3500);
    } else if (dayDone) {
      const chest = newChest ? ' Un coffre t’attend' : '';
      showToast({ kind: 'mission', text: `Journée parfaite ! +${gain} XP.${chest}` }, 3000);
    } else if (firstToday) {
      const s = streakOf(cards, next, today, fx.freeze);
      showToast({ kind: 'mission', text: `Mission du jour accomplie · série ${s} 🔥 · +${gain} XP${combo}` }, 3500);
    } else if (newChest) {
      showToast({ kind: 'bonus', text: `Coffre débloqué ! +${gain} XP` }, 3000);
    } else if (weeklyDone) {
      showToast({ kind: 'quest', text: `Quête de la semaine terminée ! +${gain} XP` }, 3000);
    } else if (newQuest) {
      showToast({ kind: 'quest', text: `Quête terminée : ${newQuest.text} · +${gain} XP` }, 3000);
    } else if (isShiny(card, fx.shinyRate)) {
      showToast({ kind: 'shiny', color: r.color, text: `Brillante ${r.label.toLowerCase()} ! +${gain} XP` }, 3000);
    } else {
      showToast({ kind: r.id, color: r.color, text: `${r.label} capturée ! +${gain} XP${combo}` }, combo ? 3000 : 2200);
    }
  };

  // Ouverture d'un coffre : il tremble, puis le butin s'affiche et compte
  const openChest = (chest) => {
    if (opening) return;
    setOpening({ chest, phase: 'shake' });
    setTimeout(() => {
      setOpening((o) => o && { ...o, phase: 'open' });
      setOpenedNow((prev) => ({ ...prev, [chest.id]: today }));
      writeStoredValue(CHESTS_KEY, (base) => {
        const b = base ?? {};
        if (b[chest.id]) return null;
        return { ...b, [chest.id]: today };
      });
    }, 1100);
  };
  const closeChest = useCallback(() => {
    setOpening(null);
  }, []);
  // Passage de niveau grâce au coffre : annoncé une fois le butin refermé
  const levelBeforeChest = useRef(null);
  useEffect(() => {
    if (opening?.phase === 'shake') levelBeforeChest.current = level;
    if (!opening && levelBeforeChest.current !== null) {
      if (level > levelBeforeChest.current) showToast({ kind: 'level', text: `Niveau ${level} — ${titleOf(level)} !` }, 3000);
      levelBeforeChest.current = null;
    }
  }, [opening, level]);

  // Une recherche porte sur toute la collection, quel que soit le filtre
  const q = norm(query.trim());
  const visible = cards.filter((c) => {
    if (q) return norm(c.title).includes(q) || norm(c.description).includes(q);
    if (filter === 'todo') return !caught[c.id];
    if (filter === 'caught') return caught[c.id];
    return true;
  });

  // Regroupe par jour de tirage, le plus récent en haut
  const days = [];
  for (const c of visible) {
    const key = c.bonus ? 'bonus' : c.date;
    const group = days.find((d) => d.date === key);
    if (group) group.cards.push(c);
    else days.push({ date: key, cards: [c] });
  }
  // Bonus en tête, puis du jour le plus récent au plus ancien
  days.sort((a, b) => (a.date === 'bonus' ? -1 : b.date === 'bonus' ? 1 : b.date.localeCompare(a.date)));

  const collection = RARITIES.map((r) => ({
    ...r,
    count: cards.filter((c) => caught[c.id] && rarityOf(c).id === r.id).length,
  }));

  return (
    <div className="hunt">
      {/* ── Profil du chasseur ── */}
      <section className="hunt-hero">
        <div className="hunt-hero-top">
          <div>
            <h2 className="hunt-name">{GAME_NAME}</h2>
            <p className="hunt-tagline">Capture les articles du jour dans WikiMasters</p>
          </div>
          <div className="hunt-chips">
            <button
              className="hunt-lab-chip"
              onClick={() => setView(view === 'research' ? 'cards' : 'research')}
              title="Points de recherche disponibles"
            >
              <FlaskConical size={15} aria-hidden="true" />
              {points}
            </button>
            <button
              className="hunt-trophies"
              onClick={() => setView(view === 'achievements' ? 'cards' : 'achievements')}
              title="Succès débloqués"
            >
              <Trophy size={15} aria-hidden="true" />
              {achDone}/{ACHIEVEMENTS.length}
            </button>
            <button
              className="hunt-division"
              style={{ '--div': division.color }}
              onClick={() => setView(view === 'quests' ? 'cards' : 'quests')}
              title={`Division ${division.name} · ${econ.season.points} pts sur 28 jours`}
            >
              <Medal size={15} aria-hidden="true" />
              {division.name}
            </button>
            <div className={`hunt-streak${streak > 0 ? ' on' : ''}`} title="Jours d'affilée avec au moins une capture">
              <Flame size={16} aria-hidden="true" />
              {streak}
            </div>
          </div>
        </div>
        <div className="hunt-level">
          <div className="hunt-level-badge" aria-label={`Niveau ${level}`}>{level}</div>
          <div className="hunt-level-info">
            <div className="hunt-level-row">
              <span className="hunt-level-title">{titleOf(level)}</span>
              <span className="hunt-level-xp">
                {xp - levelStart}/{levelEnd - levelStart} XP
              </span>
            </div>
            <div className="hunt-bar">
              <div
                className="hunt-bar-fill"
                style={{ width: `${((xp - levelStart) / (levelEnd - levelStart)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="hunt-views" role="tablist">
        {VIEWS.map((v) => {
          const badge = v.id === 'quests' ? chestsToOpen.length + econ.advent.toOpen + quizLeft : 0;
          return (
            <button
              key={v.id}
              role="tab"
              aria-selected={view === v.id}
              className={`hunt-view${view === v.id ? ' active' : ''}`}
              onClick={() => setView(v.id)}
            >
              {v.label}
              {badge > 0 && (
                <span className="hunt-view-badge" aria-label={`${badge} chose${badge > 1 ? 's' : ''} à faire (coffres, quiz, Avent)`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {view === 'achievements' ? (
        <AchievementsView results={achResults} unlocked={unlocked} />
      ) : view === 'quests' ? (
        <>
          <BossPanel boss={econ.boss} xpMult={fx.xpMult} />
          <QuizPanel questions={questions} answers={quizToday} board={econ.quizzes} xpMult={fx.xpMult} onAnswer={answerQuiz} />
          <AventPanel advent={econ.advent} onOpen={openAvent} xpMult={fx.xpMult} />
          <SeasonPanel season={econ.season} defis={econ.defis} />
          <QuestsView quests={econ.quests} chests={econ.chests} progress={econ.chestProgress} fx={fx} today={today} onOpen={openChest} opening={opening} />
        </>
      ) : view === 'album' ? (
        <AlbumView ctx={achContext} fx={fx} streak={streak} albums={econ.albums} />
      ) : view === 'atouts' ? (
        <AtoutsView key={today} atouts={econ.atouts} modifier={modifier} locked={atoutsLocked} onSave={saveLoadout} />
      ) : view === 'research' ? (
        <ResearchView points={points} earned={earned} unlocked={research.unlocked} onResearch={doResearch} busy={busy} />
      ) : (
      <>
      {/* ── Mission du jour : une capture suffit à garder la série ── */}
      <section className={`hunt-mission${missionDone ? ' done' : ''}`}>
        <div className="hunt-mission-head">
          <span className="hunt-mission-title">
            {missionDone ? <Sparkles size={16} aria-hidden="true" /> : <Target size={16} aria-hidden="true" />}
            {missionDone ? 'Mission accomplie !' : 'Mission du jour : 1 capture'}
          </span>
          <span className="hunt-mission-count">
            {missionDone ? (
              <>
                <Flame size={13} aria-hidden="true" /> série {streak}
              </>
            ) : (
              <small>+{Math.round(MISSION_BONUS * fx.missionMult * fx.xpMult)} XP · garde ta série</small>
            )}
          </span>
        </div>
        <p className="hunt-mission-sub">
          {perfectToday ? 'Journée parfaite : tout le tirage est capturé !' : `Journée parfaite (bonus) : ${todayCaught}/${Math.max(todayCards.length, target)} cartes du tirage`}
        </p>
        <div className="hunt-pips">
          {(todayCards.length ? todayCards : Array.from({ length: target })).map((c, i) => (
            <span
              key={c?.id ?? i}
              className={`hunt-pip${c && caught[c.id] ? ' filled' : ''}`}
              style={c ? { '--rarity': rarityOf(c).color } : undefined}
              title={c ? `${c.title} · ${rarityOf(c).label}` : 'Tirage à l’ouverture de l’onglet'}
            />
          ))}
        </div>
      </section>

      {/* ── Défi du jour : carte commune + modificateur ── */}
      <section className={`hunt-defi${defiDone ? ' done' : ''}`}>
        <div className="hunt-defi-head">
          <span className="hunt-defi-title">
            <Swords size={16} aria-hidden="true" />
            {defiDone ? 'Défi réussi !' : 'Défi du jour'}
          </span>
          <span className="hunt-defi-reward">
            +{Math.round(DEFI_REWARD.xp * fx.xpMult)} XP · carte ×{modifier.communeMult}
          </span>
        </div>
        <p className="hunt-defi-card">
          {communeToday ? (
            <>
              Capture <strong>{communeToday.title}</strong> aujourd’hui
              <span className="hunt-defi-rarity" style={{ '--rarity': rarityOf(communeToday).color }}>
                {rarityOf(communeToday).label}
              </span>
            </>
          ) : (
            'Tirage de la carte commune…'
          )}
        </p>
        <button className="hunt-defi-mod" onClick={() => setView('atouts')}>
          <Wand2 size={14} aria-hidden="true" />
          <span>
            <strong>{modifier.name}</strong> · {modifier.desc}
          </span>
          <span className="hunt-defi-atouts">
            <Spade size={13} aria-hidden="true" />
            {econ.atouts.today.length ? econ.atouts.today.map((id) => atoutById(id)?.name).filter(Boolean).join(' · ') : 'Aucun atout'}
            {atoutsLocked ? <Lock size={12} aria-label="figés jusqu’à demain" /> : <ChevronRight size={14} aria-hidden="true" />}
          </span>
        </button>
      </section>

      {/* ── Boss de la semaine et quiz du jour (résumés) ── */}
      <div className="hunt-mini">
        <button className={`hunt-mini-boss${bossNow.killedOn ? ' dead' : ''}`} onClick={() => setView('quests')}>
          <Skull size={15} aria-hidden="true" />
          <span className="hunt-mini-label">{bossNow.killedOn ? 'Boss vaincu !' : bossNow.boss.name}</span>
          <span className="hunt-mini-hp" aria-hidden="true">
            <span style={{ width: `${Math.max(0, 100 - (bossNow.dealt / bossNow.boss.hp) * 100)}%` }} />
          </span>
        </button>
        <button className={`hunt-mini-quiz${quizLeft === 0 ? ' done' : ''}`} onClick={() => setView('quests')}>
          <Brain size={15} aria-hidden="true" />
          <span className="hunt-mini-label">
            {questions.length === 0 ? 'Quiz bientôt' : quizLeft > 0 ? `Quiz ${QUIZ_SIZE - quizLeft}/${QUIZ_SIZE}` : 'Quiz fait'}
          </span>
        </button>
      </div>

      {/* ── Coffres : un toutes les CHEST_EVERY captures ── */}
      {nextChest ? (
        <button className="hunt-chest-cta" onClick={() => openChest(nextChest)} disabled={Boolean(opening)}>
          <Package size={18} aria-hidden="true" />
          Ouvrir un coffre{chestsToOpen.length > 1 ? ` (${chestsToOpen.length})` : ''}
        </button>
      ) : (
        <div className="hunt-chest-bar" title="Un coffre toutes les 5 cartes capturées">
          <Package size={16} aria-hidden="true" />
          <span>Prochain coffre</span>
          <span className="hunt-chest-pips" aria-hidden="true">
            {Array.from({ length: econ.chestProgress.every }, (_, i) => (
              <span key={i} className={i < econ.chestProgress.have ? 'on' : ''} />
            ))}
          </span>
          <strong>
            {econ.chestProgress.have}/{econ.chestProgress.every}
          </strong>
        </div>
      )}

      {/* ── Quêtes du jour (résumé) ── */}
      <button className="hunt-quests-strip" onClick={() => setView('quests')}>
        <ClipboardCheck size={16} aria-hidden="true" />
        <span className="hunt-quests-label">
          Quêtes <strong>{questsDone}/{econ.quests.today.length}</strong>
        </span>
        <span className="hunt-quests-pips" aria-hidden="true">
          {econ.quests.today.map((q) => (
            <span key={q.id} className={q.done ? 'on' : ''} style={{ '--p': q.cur / q.target }} />
          ))}
        </span>
        <span className="hunt-quests-week">
          Semaine {Math.round((econ.quests.weekly.cur / econ.quests.weekly.target) * 100)} %
        </span>
        <ChevronRight size={16} aria-hidden="true" />
      </button>

      {/* ── Collection par rareté ── */}
      <div className="hunt-collection">
        <span className="hunt-chip total" title="Cartes capturées au total">
          <Library size={12} aria-hidden="true" />
          {achContext.total.toLocaleString('fr-FR')}
          <span className="hunt-chip-label">Capturées</span>
        </span>
        {collection.map((r) => (
          <span key={r.id} className="hunt-chip" style={{ '--rarity': r.color }}>
            <Gem size={12} aria-hidden="true" />
            {r.count}
            <span className="hunt-chip-label">{r.label}</span>
          </span>
        ))}
        <span className="hunt-chip shiny" title="Cartes brillantes capturées">
          <Sparkle size={12} aria-hidden="true" />
          {achContext.shiny}
          <span className="hunt-chip-label">Brillantes</span>
        </span>
      </div>

      <div className="hunt-search">
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une carte"
          aria-label="Rechercher une carte par titre ou description"
        />
        {query && (
          <button className="hunt-search-clear" onClick={() => setQuery('')} aria-label="Effacer la recherche">
            <X size={15} aria-hidden="true" />
          </button>
        )}
      </div>

      {q ? (
        <p className="hunt-search-count">
          {visible.length} carte{visible.length > 1 ? 's' : ''} trouvée{visible.length > 1 ? 's' : ''}
        </p>
      ) : (
      <div className="hunt-filters" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            className={`hunt-filter${filter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
      )}

      {todayCards.length < target && dailyState !== 'idle' && (
        <div className={`hunt-bonus-draw${dailyState === 'error' ? ' error' : ''}`} role="status">
          <Sparkles size={18} aria-hidden="true" />
          {dailyState === 'error' ? (
            <>
              <span>Le tirage des cartes du jour a échoué.</span>
              <button className="hunt-retry" onClick={() => setDailyState('idle')}>
                <RotateCcw size={14} aria-hidden="true" /> Réessayer
              </button>
            </>
          ) : (
            <span>Tirage des cartes du jour…</span>
          )}
        </div>
      )}
      {cards.length === 0 && dailyState === 'idle' && (
        <p className="hunt-empty">Aucune carte pour l'instant.</p>
      )}
      {cards.length > 0 && visible.length === 0 && filter === 'caught' && !q && (
        <p className="hunt-empty">Aucune carte capturée pour l’instant.</p>
      )}
      {cards.length > 0 && todoCount === 0 && filter !== 'caught' && !q && (
        <div className={`hunt-bonus-draw${bonusState === 'error' ? ' error' : ''}`} role="status">
          <Gift size={18} aria-hidden="true" />
          {bonusState === 'error' ? (
            <>
              <span>Le tirage de la carte bonus a échoué.</span>
              <button className="hunt-retry" onClick={() => setBonusState('idle')}>
                <RotateCcw size={14} aria-hidden="true" /> Réessayer
              </button>
            </>
          ) : (
            <span>Tout est capturé, bravo ! Tirage d’une carte bonus…</span>
          )}
        </div>
      )}

      {days.map((day) => (
        <section key={day.date} className="hunt-day">
          <h3 className="hunt-day-title">{dayLabel(day.date, today)}</h3>
          <ul className="hunt-cards">
            {[...day.cards].sort((a, b) => Number(Boolean(b.commune)) - Number(Boolean(a.commune))).map((c) => {
              const isCaught = Boolean(caught[c.id]);
              const r = rarityOf(c);
              const shiny = isShiny(c, fx.shinyRate);
              const theme = themeOf(c);
              const value = cardXp(c, econ, fx, today);
              return (
                <li
                  key={c.id}
                  className={`tcg rarity-${r.id}${isCaught ? ' caught' : ''}${shiny ? ' shiny' : ''}${c.commune ? ' commune' : ''}`}
                  style={{ '--rarity': r.color, '--theme': theme.color }}
                >
                  <div className="tcg-top">
                    <span className="tcg-rarity">
                      <Gem size={12} aria-hidden="true" />
                      {r.label}
                      {shiny && (
                        <span className="tcg-shiny">
                          <Sparkle size={10} aria-hidden="true" /> Brillante
                        </span>
                      )}
                      {c.bonus && <span className="tcg-bonus">Bonus</span>}
                      {c.commune && (
                        <span className="tcg-defi">
                          <Swords size={10} aria-hidden="true" /> Défi
                        </span>
                      )}
                    </span>
                    <span className="tcg-meta">
                      {typeof c.views === 'number' && (
                        <>
                          <Eye size={12} aria-hidden="true" />
                          {c.views.toLocaleString('fr-FR')} vues/30 j ·{' '}
                        </>
                      )}
                      {value.xp} XP
                    </span>
                  </div>
                  {(value.fired.length > 0 || (value.boss > 0 && !bossNow.killedOn)) && (
                    <ul className="tcg-fired" aria-label={isCaught ? 'Bonus obtenus' : 'Bonus si capturée aujourd’hui'}>
                      {value.fired.map((f) => (
                        <li key={f.id} className={f.id === 'modifier' ? 'mod' : ''}>
                          {fmtEffect(f)} {f.name}
                        </li>
                      ))}
                      {value.boss > 0 && !bossNow.killedOn && (!isCaught || caught[c.id] >= bossNow.week) && (
                        <li className="boss-chip">
                          <Skull size={10} aria-hidden="true" /> Blesse le boss{value.boss > 1 ? ` ×${value.boss}` : ''}
                        </li>
                      )}
                    </ul>
                  )}

                  <div className="tcg-main">
                    {c.thumb && <img className="tcg-thumb" src={c.thumb} alt="" loading="lazy" />}
                    <div className="tcg-body">
                      <div className="tcg-title-row">
                        <button className="tcg-title" onClick={() => copyTitle(c)} title="Copier le titre">
                          {c.title}
                        </button>
                        {copiedId === c.id && (
                          <span className="tcg-copied" role="status">
                            <Copy size={12} aria-hidden="true" /> Copié
                          </span>
                        )}
                      </div>
                      <span className="tcg-desc">
                        <span className="tcg-theme">{theme.short}</span>
                        {c.description}
                      </span>
                      {c.extract && <p className="tcg-extract">{c.extract}</p>}
                    </div>
                  </div>

                  <div className="tcg-actions">
                    <a
                      className="tcg-link"
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Voir la page ${c.title} sur Wikipédia`}
                    >
                      <ExternalLink size={13} aria-hidden="true" />
                      Voir la page
                    </a>
                    {!isCaught && isDrawCard(c) && c.date === today && rerollsLeft > 0 && (
                      <button
                        className="tcg-reroll"
                        onClick={() => reroll(c)}
                        disabled={busy}
                        title={`Relancer cette carte (${rerollsLeft} restante${rerollsLeft > 1 ? 's' : ''} aujourd’hui)`}
                        aria-label={`Relancer ${c.title}`}
                      >
                        <Shuffle size={14} aria-hidden="true" />
                      </button>
                    )}
                    <button
                      className="tcg-catch"
                      onClick={() => toggle(c)}
                      aria-pressed={isCaught}
                      aria-label={isCaught ? `Annuler la capture de ${c.title}` : `Capturer ${c.title}`}
                    >
                      <Check size={15} aria-hidden="true" />
                      {isCaught ? 'Capturée' : 'Capturer'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      </>
      )}

      {opening && (
        <ChestReveal chest={opening.chest} phase={opening.phase} xpMult={fx.xpMult} onClose={closeChest} />
      )}

      {toast && (
        <div
          key={toast.text}
          className={`hunt-toast ${toast.kind}`}
          style={toast.color ? { '--rarity': toast.color } : undefined}
          role="status"
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
