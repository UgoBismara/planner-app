// Programme natation « crawl → triathlon S (juin 2027) puis M (fin d'été 2027) », pour un
// débutant qui nage 25 m de crawl avec peine. Deux séances par semaine : A technique le
// mardi, B endurance le vendredi (créneau 12h-13h, ~45 min dans l'eau).
// Source unique de l'onglet Natation et des titres de séance du planning.
//
// Pour modifier une séance : un bloc est [répétitions, mètres par répétition, éducatif,
// repos en s, consigne propre au bloc]. mètres = 0 pour un exercice sans distance
// (expirations, test). Le volume se calcule tout seul. Vérifier avec npm run check:swim.

import { parseDateKey, shiftDateKey } from './quests.js';

export const SWIM_QUEST_ID = 'plan_swim';
export const TRI_S_QUEST_ID = 'plan_tri_s';
export const SWIM_EVENT_ID = 'plan_ev_swim';
// Cases cochées pendant la séance : { [sessionId]: [index des blocs faits] }
export const SWIM_BLOCKS_KEY = 'swim_blocks';
// Paliers atteints : { [milestoneId]: 'YYYY-MM-DD' }
export const SWIM_MILESTONES_KEY = 'swim_milestones';

// Lundi de la semaine 1 ; mardi = séance A, vendredi = séance B
export const SWIM_START = '2026-11-09';
const DAY_A = 1;
const DAY_B = 4;
// Dates à confirmer à l'inscription (la semaine 32 est celle de la course S)
export const S_RACE = '2027-06-20';
export const M_RACE = '2027-08-29';

// ── Éducatifs : la fiche technique de chaque exercice ──────────────────────────
export const DRILLS = {
  easy: {
    name: 'Nage au choix, tranquille',
    tip: 'Brasse, dos ou crawl : on chauffe les épaules, sans forcer.',
  },
  cool: {
    name: 'Retour au calme',
    tip: 'Dos ou brasse, très souple. On fait redescendre le cœur avant de sortir.',
  },
  bubbles: {
    name: 'Expirations dans l’eau',
    unit: 'séries de 10',
    tip: 'Debout, une main au bord : inspire par la bouche, puis souffle longtemps dans l’eau par le nez et la bouche (« hmmm »). C’est le secret du crawl : l’air sort sous l’eau, et quand la tête sort il n’y a plus qu’à inspirer.',
  },
  glide: {
    name: 'Glisse en flèche',
    tip: 'Pousse au mur, bras tendus, mains l’une sur l’autre, tête entre les bras, regard vers le fond. Glisse le plus loin possible, puis termine la longueur en battements.',
  },
  kickBoard: {
    name: 'Battements avec planche',
    tip: 'Jambes presque tendues, battements qui partent de la hanche, pointes de pied tendues, petites éclaboussures. Visage dans l’eau, tu souffles, puis tu relèves la tête devant pour inspirer.',
  },
  sideKick: {
    name: 'Battements sur le côté',
    tip: 'Sur le côté, bras du bas tendu devant, l’autre le long du corps, visage dans l’eau. Pour respirer, tourne la tête (sans la lever) jusqu’à sortir la bouche : une joue reste dans l’eau. Change de côté à chaque longueur.',
  },
  kickRoll: {
    name: '6 battements, 1 respiration',
    tip: 'Sur le ventre, bras devant. 6 battements visage dans l’eau en soufflant, puis tout le corps pivote sur le côté pour inspirer, et revient. Alterne les côtés.',
  },
  crawl: {
    name: 'Crawl',
    tip: 'Allure facile : le but est d’arriver au bout sans t’essouffler. Souffle tout l’air sous l’eau, et respire tous les 2 mouvements de bras si tu en as besoin, c’est normal au début. Essoufflé ? Ralentis : trop de vitesse coupe le souffle bien avant les bras. Les pauses font partie du jeu.',
  },
  crawl3: {
    name: 'Crawl, respiration en 3 temps',
    tip: 'Inspire tous les 3 mouvements de bras : une fois à droite, une fois à gauche. La nage s’équilibre, et c’est précieux en eau libre (vagues, visée). Trop dur ? Respire en 2 temps une longueur, puis reviens au 3 temps.',
  },
  catchup: {
    name: 'Rattrapé',
    tip: 'Une main attend devant que l’autre la rejoigne avant de repartir. La nage s’allonge et tu as le temps de respirer.',
  },
  oneArm: {
    name: 'Crawl un bras',
    tip: 'Un bras tendu devant, l’autre nage. Respire du côté du bras qui travaille. Change de bras à chaque longueur.',
  },
  s636: {
    name: '6-3-6',
    tip: '6 battements sur le côté, 3 mouvements de bras, 6 battements de l’autre côté. Apprend la rotation du corps, le vrai moteur du crawl.',
  },
  thumbThigh: {
    name: 'Pouce-cuisse',
    tip: 'À la fin de chaque traction, le pouce frôle la cuisse avant que la main sorte : on pousse l’eau jusqu’au bout, vers l’arrière.',
  },
  fins: {
    name: 'Crawl avec palmes',
    tip: 'Les palmes courtes remontent les jambes : tu sens la bonne position, bien à plat, et tu te concentres sur les bras et la respiration.',
  },
  pull: {
    name: 'Crawl avec pull-buoy',
    tip: 'Le pull-buoy entre les cuisses, jambes immobiles : les bras font tout. Cherche une traction longue et une respiration régulière.',
  },
  countStrokes: {
    name: 'Compter ses mouvements',
    tip: 'Compte tes mouvements de bras sur 25 m, puis essaie d’en faire 1 ou 2 de moins en glissant davantage. Moins de mouvements = une nage plus efficace.',
  },
  steady: {
    name: 'Crawl régulier',
    tip: 'Une allure que tu pourrais tenir longtemps, souffle contrôlé. Regarde l’horloge : chaque répétition doit prendre à peu près le même temps.',
  },
  continuous: {
    name: 'Crawl d’une traite',
    tip: 'Sans t’arrêter, à allure facile. Si tu dois vraiment t’arrêter, 20 s au mur et tu repars : c’est la distance qui compte, pas la vitesse.',
  },
  build: {
    name: 'Crawl progressif',
    tip: 'Pars lentement et accélère un peu à chaque longueur.',
  },
  fast: {
    name: 'Crawl rapide',
    tip: 'Plus vite, sans perdre la technique, comme un départ de course. Récupère bien entre les répétitions.',
  },
  sighting: {
    name: 'Crawl avec visée',
    tip: 'Tous les 6 mouvements, lève juste les yeux au ras de l’eau (« yeux de crocodile ») pour viser un repère au bout du bassin, puis tourne la tête sur le côté pour respirer. En course, c’est ce qui évite de nager 100 m de trop.',
  },
  buoyTurn: {
    name: 'Demi-tour sans mur',
    tip: 'Fais demi-tour 2 m avant le mur sans le toucher, comme autour d’une bouée : en course, il n’y a pas de mur pour souffler.',
  },
  testMax: {
    name: 'Test : distance maximale',
    unit: 'test',
    tip: 'Nage le plus loin possible en crawl sans t’arrêter, à allure facile. Note la distance : c’est ton record du moment.',
  },
  test100: {
    name: 'Test : chrono sur 100 m',
    unit: 'test',
    tip: 'Après 3 min de repos : 100 m de crawl, départ au mur, le plus vite possible en gardant ta technique. Note le temps. Si 100 m d’une traite ne passent pas encore, saute ce test.',
  },
  test750: {
    name: 'Test : 750 m chronométrés',
    unit: 'test',
    tip: 'La distance du triathlon S, d’une traite, à l’allure que tu tiendrais en course. Note le temps : c’est ta référence pour juin.',
  },
};

// ── Phases ──────────────────────────────────────────────────────────────────────
// weeks : [première, dernière] semaine du programme (semaine 1 = 9 nov. 2026)
export const PHASES = [
  {
    id: 'p0',
    short: 'P0',
    label: 'Aisance & respiration',
    weeks: [1, 2],
    goal: 'Des 50 m de crawl sans finir essoufflé',
    focus: 'Les 50 m passent déjà : il reste à respirer sans s’essouffler. Souffler tout l’air sous l’eau, respirer sur le côté, nager lentement.',
  },
  {
    id: 'p1',
    short: 'P1',
    label: 'Technique & respiration en 3 temps',
    weeks: [3, 12],
    goal: '100 m, puis 200 m en continu',
    focus: 'Un éducatif nouveau chaque semaine (rattrapé, un bras, 6-3-6, pouce-cuisse) et la respiration des deux côtés. Les séries passent de 25 à 50 puis 100 m.',
  },
  {
    id: 'p2',
    short: 'P2',
    label: 'Endurance de base',
    weeks: [13, 20],
    goal: '400 m en continu',
    focus: 'Séries de 100 à 300 m, pull-buoy, allure régulière. Premiers exercices de visée pour l’eau libre.',
  },
  {
    id: 'p3',
    short: 'P3',
    label: 'Spécifique triathlon S',
    weeks: [21, 27],
    goal: '750 m en continu, à allure régulière',
    focus: 'Nager 750 m d’une traite, demi-tours sans mur, départs rapides puis allure stable, visée à chaque longueur.',
  },
  {
    id: 'p4',
    short: 'P4',
    label: 'Eau libre & affûtage',
    weeks: [28, 32],
    goal: 'Être serein en eau libre le jour du S',
    focus: 'Deux ou trois sorties en eau libre le week-end, en combinaison et jamais seul. La dernière semaine, le volume baisse pour arriver frais.',
  },
  {
    id: 'p5',
    short: 'P5',
    label: 'Vers le triathlon M',
    weeks: [33, 42],
    goal: '1 500 m en continu',
    focus: 'Séries de 300 à 500 m et une sortie longue en eau libre par semaine. Les séances seront écrites une fois la course M choisie.',
    upcoming: true,
  },
];

// ── Séances, semaine par semaine ────────────────────────────────────────────────
// light : semaine allégée (une toutes les 4 semaines, avec un test le vendredi)
// note : rappel affiché avec la séance ; closed : la piscine risque d'être fermée
const WEEKS = [
  // ── P0 · Aisance & respiration ──
  {
    A: {
      title: 'Expirer et glisser',
      blocks: [
        [4, 25, 'easy'],
        [3, 0, 'bubbles'],
        [6, 25, 'glide', 20],
        [6, 25, 'kickBoard', 30],
        [4, 25, 'crawl', 40],
        [2, 25, 'cool'],
      ],
    },
    B: {
      title: 'Souffler pour ne pas s’essouffler',
      blocks: [
        [4, 25, 'easy'],
        [2, 0, 'bubbles'],
        [4, 25, 'sideKick', 20],
        [6, 25, 'crawl', 30, 'Une seule chose en tête : souffler tout l’air sous l’eau'],
        [8, 50, 'crawl', 45, 'Plus lent que mardi : tu dois arriver sans être essoufflé'],
        [2, 25, 'cool'],
      ],
    },
  },
  {
    A: {
      title: 'Respirer sur le côté',
      blocks: [
        [4, 25, 'easy'],
        [6, 25, 'kickRoll', 20],
        [6, 25, 'sideKick', 20],
        [4, 25, 'catchup', 30],
        [6, 50, 'crawl', 45],
        [2, 25, 'cool'],
      ],
    },
    B: {
      title: '50 m en contrôle',
      blocks: [
        [4, 25, 'easy'],
        [4, 25, 'kickBoard', 20],
        [10, 50, 'crawl', 40, 'Allure lente : après 40 s de repos, tu dois pouvoir repartir'],
        [2, 25, 'build', 30],
        [2, 25, 'cool'],
      ],
    },
  },

  // ── P1 · Technique & respiration en 3 temps ──
  {
    A: {
      title: 'Palmes et respiration',
      blocks: [
        [4, 25, 'easy'],
        [4, 25, 'fins', 20],
        [4, 25, 'kickRoll', 20],
        [4, 25, 'catchup', 20],
        [4, 25, 'crawl3', 30],
        [6, 50, 'crawl', 40],
        [2, 25, 'cool'],
      ],
    },
    B: {
      title: 'Séries de 75 m',
      blocks: [
        [4, 25, 'easy'],
        [4, 25, 'sideKick', 20],
        [6, 75, 'crawl', 45],
        [2, 50, 'crawl3', 40],
        [2, 25, 'build', 30],
        [2, 25, 'cool'],
      ],
    },
  },
  {
    light: true,
    A: {
      title: 'Technique en douceur',
      blocks: [
        [4, 25, 'easy'],
        [4, 25, 'kickRoll', 20],
        [4, 25, 'catchup', 30],
        [4, 50, 'crawl', 40],
        [2, 25, 'cool'],
      ],
    },
    B: {
      title: 'Test n°1',
      test: true,
      blocks: [
        [4, 25, 'easy'],
        [2, 25, 'kickBoard'],
        [2, 25, 'crawl', 30],
        [1, 0, 'testMax'],
        [2, 25, 'countStrokes', 60],
        [2, 25, 'cool'],
      ],
    },
  },
  {
    A: {
      title: 'Rattrapé et palmes',
      blocks: [
        [4, 25, 'easy'],
        [4, 25, 'fins', 20],
        [6, 25, 'catchup', 20],
        [8, 25, 'crawl', 30],
        [4, 25, 'crawl3', 30],
        [2, 50, 'crawl', 45],
        [2, 25, 'cool'],
      ],
    },
    B: {
      title: 'Séries de 50 m en 3 temps',
      blocks: [
        [4, 25, 'easy'],
        [4, 25, 'sideKick', 20],
        [8, 50, 'crawl3', 45],
        [4, 25, 'crawl3', 30],
        [4, 25, 'build', 30],
        [2, 25, 'cool'],
      ],
    },
  },
  {
    A: {
      title: 'Crawl un bras',
      blocks: [
        [4, 25, 'easy'],
        [4, 25, 'fins', 20],
        [4, 25, 'kickRoll', 20],
        [6, 25, 'oneArm', 30],
        [4, 25, 'catchup', 20],
        [8, 25, 'crawl3', 30],
        [2, 25, 'cool'],
      ],
    },
    B: {
      title: 'Allonger : vers 100 m',
      blocks: [
        [4, 25, 'easy'],
        [4, 25, 'fins', 20],
        [4, 50, 'crawl', 40],
        [1, 100, 'crawl', 60, 'Ton premier 100 m d’une traite ? Sinon 50 + 50 avec 20 s au mur'],
        [4, 50, 'crawl3', 45],
        [2, 25, 'countStrokes', 30],
        [2, 25, 'cool'],
      ],
    },
  },
  {
    A: {
      title: 'Rotation 6-3-6',
      blocks: [
        [4, 25, 'easy'],
        [6, 25, 's636', 20],
        [4, 25, 'catchup', 20],
        [6, 50, 'crawl3', 40],
        [2, 25, 'cool'],
      ],
    },
    B: {
      title: 'Séance libre de Noël',
      closed: 'Le 25 décembre, la piscine est sûrement fermée : décale au samedi si elle ouvre, sinon profite.',
      blocks: [
        [4, 25, 'easy'],
        [4, 25, 'fins', 20],
        [4, 50, 'crawl', 40],
        [2, 25, 'cool'],
      ],
    },
  },
  {
    light: true,
    A: {
      title: 'Test n°2',
      test: true,
      note: 'Semaine des fêtes : le test passe au mardi.',
      blocks: [
        [4, 25, 'easy'],
        [4, 25, 'catchup', 20],
        [2, 25, 'crawl', 30],
        [1, 0, 'testMax'],
        [1, 0, 'test100'],
        [2, 25, 'countStrokes', 60],
        [2, 25, 'cool'],
      ],
    },
    B: {
      title: 'Nage du Nouvel An',
      closed: 'Le 1er janvier, la piscine est sûrement fermée : séance facultative, à décaler au samedi.',
      blocks: [
        [4, 25, 'easy'],
        [6, 50, 'crawl3', 40],
        [2, 25, 'cool'],
      ],
    },
  },
  {
    A: {
      title: 'Pouce-cuisse',
      blocks: [
        [4, 25, 'easy'],
        [4, 25, 'kickBoard', 20],
        [6, 25, 'thumbThigh', 20],
        [4, 25, 'oneArm', 20],
        [6, 50, 'crawl3', 30],
        [4, 25, 'countStrokes', 30],
        [2, 25, 'cool'],
      ],
    },
    B: {
      title: 'Séries de 100 m',
      blocks: [
        [2, 50, 'easy'],
        [4, 25, 'fins', 20],
        [4, 100, 'crawl', 60],
        [4, 25, 'crawl3', 30],
        [2, 25, 'build', 30],
        [2, 25, 'cool'],
      ],
    },
  },
  {
    A: {
      title: 'Glisse et rotation',
      blocks: [
        [2, 50, 'easy'],
        [2, 25, 'fins', 20],
        [6, 25, 's636', 20],
        [6, 25, 'catchup', 20],
        [4, 75, 'crawl3', 40],
        [4, 25, 'countStrokes', 30],
        [2, 25, 'cool'],
      ],
    },
    B: {
      title: '100 m réguliers',
      blocks: [
        [2, 50, 'easy'],
        [4, 25, 'fins', 20],
        [4, 25, 'sideKick', 20],
        [6, 100, 'crawl', 45],
        [4, 25, 'build', 30],
        [2, 25, 'cool'],
      ],
    },
  },
  {
    A: {
      title: 'Synthèse technique',
      blocks: [
        [2, 50, 'easy'],
        [4, 25, 'fins', 20],
        [4, 25, 'catchup', 20],
        [4, 25, 'oneArm', 20],
        [4, 25, 'thumbThigh', 20],
        [4, 100, 'crawl3', 40],
        [2, 25, 'countStrokes', 30],
        [2, 25, 'cool'],
      ],
    },
    B: {
      title: 'Vers 200 m',
      blocks: [
        [2, 50, 'easy'],
        [4, 25, 'kickBoard', 20],
        [3, 150, 'crawl', 60],
        [1, 200, 'continuous'],
        [2, 50, 'crawl3', 30],
        [2, 25, 'cool'],
      ],
    },
  },
  {
    light: true,
    A: {
      title: 'Technique légère',
      blocks: [
        [4, 25, 'easy'],
        [4, 25, 'fins', 20],
        [4, 25, 'catchup', 20],
        [6, 50, 'crawl3', 30],
        [2, 25, 'cool'],
      ],
    },
    B: {
      title: 'Test n°3',
      test: true,
      blocks: [
        [4, 25, 'easy'],
        [2, 25, 'kickBoard'],
        [4, 25, 'crawl', 20],
        [1, 0, 'testMax'],
        [1, 0, 'test100'],
        [2, 25, 'countStrokes', 60],
        [2, 25, 'cool'],
      ],
    },
  },

  // ── P2 · Endurance de base ──
  {
    A: {
      title: 'Pull-buoy',
      blocks: [
        [2, 50, 'easy'],
        [4, 25, 'fins', 20],
        [6, 50, 'pull', 30],
        [4, 25, 'catchup', 20],
        [4, 100, 'crawl3', 30],
        [4, 25, 'countStrokes', 30],
        [2, 50, 'cool'],
      ],
    },
    B: {
      title: 'Séries de 200 m',
      blocks: [
        [2, 100, 'easy'],
        [3, 200, 'steady', 60],
        [4, 50, 'steady', 20],
        [2, 50, 'cool'],
      ],
    },
  },
  {
    A: {
      title: 'Premières visées',
      blocks: [
        [2, 100, 'easy'],
        [4, 25, 'kickBoard', 20],
        [4, 25, 'thumbThigh', 20],
        [6, 25, 'sighting', 20],
        [4, 25, 'oneArm', 20],
        [5, 100, 'crawl3', 30],
        [2, 50, 'cool'],
      ],
    },
    B: {
      title: 'Séries de 300 m',
      blocks: [
        [2, 100, 'easy'],
        [4, 25, 'fins', 20],
        [2, 300, 'steady', 90],
        [4, 50, 'steady', 20],
        [2, 50, 'cool'],
      ],
    },
  },
  {
    A: {
      title: 'Rythme régulier',
      blocks: [
        [2, 100, 'easy'],
        [4, 25, 's636', 20],
        [4, 100, 'pull', 30],
        [4, 25, 'sighting', 20],
        [4, 100, 'crawl3', 20],
        [2, 50, 'cool'],
      ],
    },
    B: {
      title: 'Pyramide',
      blocks: [
        [2, 100, 'easy'],
        [4, 25, 'fins', 20],
        [1, 100, 'steady', 45],
        [1, 200, 'steady', 60],
        [1, 300, 'steady', 60],
        [1, 200, 'steady', 45],
        [1, 100, 'steady'],
        [2, 50, 'cool'],
      ],
    },
  },
  {
    light: true,
    A: {
      title: 'Technique légère',
      blocks: [
        [2, 100, 'easy'],
        [4, 25, 'catchup', 20],
        [4, 50, 'pull', 20],
        [3, 100, 'crawl3', 30],
        [2, 50, 'cool'],
      ],
    },
    B: {
      title: 'Test n°4',
      test: true,
      blocks: [
        [2, 100, 'easy'],
        [4, 25, 'build', 20],
        [1, 0, 'testMax'],
        [1, 0, 'test100'],
        [2, 25, 'countStrokes', 60],
        [2, 50, 'cool'],
      ],
    },
  },
  {
    A: {
      title: 'Traction longue',
      blocks: [
        [2, 100, 'easy'],
        [4, 25, 'fins', 20],
        [4, 25, 'thumbThigh', 20],
        [4, 25, 'countStrokes', 20],
        [4, 100, 'pull', 30],
        [4, 100, 'crawl3', 20],
        [2, 50, 'cool'],
      ],
    },
    B: {
      title: '400 m d’une traite',
      blocks: [
        [2, 100, 'easy'],
        [1, 400, 'continuous', 120],
        [4, 100, 'steady', 30],
        [4, 50, 'steady', 20],
        [2, 50, 'cool'],
      ],
    },
  },
  {
    A: {
      title: 'Visée et virages',
      blocks: [
        [2, 100, 'easy'],
        [6, 50, 'sighting', 20],
        [4, 50, 'buoyTurn', 20],
        [4, 100, 'crawl3', 20],
        [2, 100, 'pull', 30],
        [2, 50, 'cool'],
      ],
    },
    B: {
      title: 'Longues séries',
      blocks: [
        [2, 100, 'easy'],
        [4, 25, 'fins', 20],
        [3, 300, 'steady', 60],
        [4, 25, 'fast', 40],
        [2, 50, 'cool'],
      ],
    },
  },
  {
    A: {
      title: 'Allure et pull',
      blocks: [
        [2, 100, 'easy'],
        [4, 25, 'catchup', 20],
        [3, 200, 'pull', 30],
        [4, 50, 'sighting', 20],
        [4, 50, 'build', 20],
        [2, 50, 'cool'],
      ],
    },
    B: {
      title: '500 m d’une traite',
      blocks: [
        [2, 100, 'easy'],
        [1, 500, 'continuous', 120],
        [4, 100, 'steady', 20],
        [2, 50, 'sighting', 20],
        [4, 25, 'fast', 40],
        [2, 50, 'cool'],
      ],
    },
  },
  {
    light: true,
    A: {
      title: 'Technique légère',
      blocks: [
        [2, 100, 'easy'],
        [4, 25, 's636', 20],
        [4, 100, 'pull', 30],
        [2, 50, 'cool'],
      ],
    },
    B: {
      title: 'Test n°5',
      test: true,
      blocks: [
        [2, 100, 'easy'],
        [4, 25, 'build', 20],
        [1, 0, 'testMax'],
        [1, 0, 'test100'],
        [2, 25, 'countStrokes', 60],
        [2, 50, 'cool'],
      ],
    },
  },

  // ── P3 · Spécifique triathlon S ──
  {
    A: {
      title: 'Bouée et visée',
      blocks: [
        [2, 100, 'easy'],
        [4, 25, 'fins', 20],
        [6, 50, 'sighting', 15],
        [4, 100, 'buoyTurn', 20],
        [3, 200, 'pull', 30],
        [2, 50, 'cool'],
      ],
    },
    B: {
      title: '600 m d’une traite',
      blocks: [
        [2, 100, 'easy'],
        [1, 600, 'continuous', 120],
        [4, 100, 'steady', 20],
        [6, 25, 'fast', 30],
        [2, 50, 'cool'],
      ],
    },
  },
  {
    A: {
      title: 'Départs rapides',
      blocks: [
        [2, 100, 'easy'],
        [4, 25, 'catchup', 20],
        [6, 50, 'fast', 30, '25 m vite, comme un départ de course, puis 25 m à ton allure'],
        [4, 150, 'crawl3', 20],
        [4, 50, 'sighting', 20],
        [2, 50, 'cool'],
      ],
    },
    B: {
      title: 'Endurance 3 × 300',
      blocks: [
        [2, 100, 'easy'],
        [3, 300, 'steady', 30],
        [4, 100, 'pull', 20],
        [2, 50, 'cool'],
      ],
    },
  },
  {
    A: {
      title: 'Allure de course',
      blocks: [
        [2, 100, 'easy'],
        [4, 25, 'thumbThigh', 20],
        [5, 150, 'steady', 20, 'À l’allure que tu tiendrais en course'],
        [4, 50, 'sighting', 20],
        [2, 100, 'buoyTurn', 20],
        [2, 100, 'pull', 20],
        [2, 50, 'cool'],
      ],
    },
    B: {
      title: '700 m d’une traite',
      blocks: [
        [2, 100, 'easy'],
        [1, 700, 'continuous', 120],
        [4, 100, 'pull', 20],
        [6, 50, 'build', 30],
        [2, 50, 'cool'],
      ],
    },
  },
  {
    light: true,
    A: {
      title: 'Allure légère',
      blocks: [
        [2, 100, 'easy'],
        [4, 25, 'catchup', 20],
        [4, 150, 'steady', 20],
        [2, 50, 'cool'],
      ],
    },
    B: {
      title: 'Test n°6',
      test: true,
      blocks: [
        [2, 100, 'easy'],
        [4, 50, 'build', 20],
        [1, 0, 'testMax'],
        [1, 0, 'test100'],
        [2, 25, 'countStrokes', 60],
        [2, 50, 'cool'],
      ],
    },
  },
  {
    A: {
      title: 'Spécial bouées',
      blocks: [
        [2, 100, 'easy'],
        [4, 50, 'sighting', 15],
        [3, 200, 'buoyTurn', 20, 'Demi-tour sans mur à chaque bout'],
        [6, 25, 'fast', 30],
        [4, 100, 'pull', 20],
        [2, 50, 'cool'],
      ],
    },
    B: {
      title: '750 m : la distance du S',
      blocks: [
        [2, 100, 'easy'],
        [1, 750, 'continuous', 120, 'La distance du triathlon S, d’une traite'],
        [4, 100, 'pull', 20],
        [4, 25, 'fast', 30],
        [2, 50, 'cool'],
      ],
    },
  },
  {
    A: {
      title: 'Changements d’allure',
      blocks: [
        [2, 100, 'easy'],
        [4, 25, 'fins', 20],
        [4, 200, 'steady', 20, '50 m vite, puis 150 m à ton allure : apprendre à récupérer en nageant'],
        [6, 50, 'sighting', 15],
        [2, 100, 'pull', 20],
        [2, 50, 'cool'],
      ],
    },
    B: {
      title: 'Simulation du S',
      blocks: [
        [2, 100, 'easy'],
        [1, 750, 'continuous', 120, 'Comme en course : départ rapide sur 50 m, visée tous les 6-8 mouvements, demi-tours sans mur, puis allure régulière. Chronomètre-toi.'],
        [6, 100, 'steady', 15],
        [2, 50, 'cool'],
      ],
    },
  },
  {
    light: true,
    A: {
      title: 'Allure légère',
      blocks: [
        [2, 100, 'easy'],
        [4, 25, 'catchup', 20],
        [4, 150, 'steady', 20],
        [2, 50, 'cool'],
      ],
    },
    B: {
      title: 'Test n°7 : 750 m',
      test: true,
      blocks: [
        [2, 100, 'easy'],
        [4, 50, 'build', 20],
        [1, 0, 'test750'],
        [2, 25, 'countStrokes', 60],
        [2, 50, 'cool'],
      ],
    },
  },

  // ── P4 · Eau libre & affûtage ──
  {
    A: {
      title: 'Visée intensive',
      blocks: [
        [2, 100, 'easy'],
        [8, 50, 'sighting', 15],
        [4, 100, 'buoyTurn', 20],
        [3, 200, 'pull', 30],
        [2, 50, 'cool'],
      ],
    },
    B: {
      title: '800 m d’une traite',
      note: 'Ce week-end : 1re sortie en eau libre si l’eau dépasse 16 °C, en combinaison, jamais seul, avec une bouée de sécurité.',
      blocks: [
        [2, 100, 'easy'],
        [1, 800, 'continuous', 120],
        [6, 50, 'fast', 30],
        [2, 50, 'cool'],
      ],
    },
  },
  {
    A: {
      title: 'Allure de course',
      blocks: [
        [2, 100, 'easy'],
        [4, 200, 'steady', 20, 'À l’allure de course'],
        [4, 50, 'sighting', 15],
        [6, 25, 'fast', 30],
        [2, 50, 'cool'],
      ],
    },
    B: {
      title: 'Départs et 600 m',
      note: 'Ce week-end : 2e sortie en eau libre, si possible à plusieurs pour nager au contact.',
      blocks: [
        [2, 100, 'easy'],
        [6, 50, 'fast', 30, '25 m vite, puis 25 m à ton allure'],
        [1, 600, 'continuous', 60],
        [4, 100, 'pull', 20],
        [2, 50, 'cool'],
      ],
    },
  },
  {
    A: {
      title: 'Rappel technique',
      blocks: [
        [2, 100, 'easy'],
        [4, 25, 'catchup', 20],
        [4, 25, 'thumbThigh', 20],
        [6, 50, 'sighting', 15],
        [6, 100, 'steady', 15],
        [2, 50, 'cool'],
      ],
    },
    B: {
      title: '900 m : de la marge',
      note: 'Ce week-end : 3e sortie en eau libre, avec la combinaison de la course.',
      blocks: [
        [2, 100, 'easy'],
        [1, 900, 'continuous', 120, 'Un peu plus long que la course : tu sauras que tu as de la marge'],
        [4, 50, 'fast', 30],
        [2, 50, 'cool'],
      ],
    },
  },
  {
    A: {
      title: 'Allure et visée',
      blocks: [
        [2, 100, 'easy'],
        [3, 200, 'steady', 20],
        [4, 50, 'sighting', 15],
        [6, 25, 'fast', 30],
        [2, 50, 'cool'],
      ],
    },
    B: {
      title: 'Dernier 750 m',
      blocks: [
        [2, 100, 'easy'],
        [1, 750, 'continuous', 90, 'À l’allure de course'],
        [4, 100, 'steady', 20],
        [2, 50, 'cool'],
      ],
    },
  },
  {
    light: true,
    A: {
      title: 'Affûtage',
      note: 'Semaine de la course : moins de volume, un peu de vitesse, et beaucoup de sommeil.',
      blocks: [
        [2, 100, 'easy'],
        [4, 50, 'sighting', 20],
        [4, 50, 'fast', 45],
        [2, 50, 'cool'],
      ],
    },
    B: {
      title: 'Réveil avant la course',
      note: 'Course dimanche : prépare ton sac la veille et va repérer le parcours natation.',
      blocks: [
        [2, 100, 'easy'],
        [4, 50, 'steady', 20],
        [4, 25, 'fast', 45],
        [2, 50, 'cool'],
      ],
    },
  },
];

// ── Paliers ─────────────────────────────────────────────────────────────────────
// step : étape de la quête « Triathlon S » qui se coche avec le palier (même texte)
export const MILESTONES = [
  { id: 'm50', label: '50 m de crawl sans m’arrêter', phase: 'p0' },
  { id: 'm100', label: '100 m de crawl sans m’arrêter', phase: 'p1', step: 'Nager 100 m de crawl sans m’arrêter' },
  { id: 'm200', label: '200 m de crawl sans m’arrêter', phase: 'p1', step: 'Nager 200 m de crawl sans m’arrêter' },
  { id: 'm400', label: '400 m de crawl sans m’arrêter', phase: 'p2', step: 'Nager 400 m de crawl sans m’arrêter' },
  { id: 'register', label: 'Choisir le triathlon S et m’inscrire', phase: 'p2', step: 'Choisir la course et m’inscrire' },
  { id: 'm750', label: '750 m sans m’arrêter', phase: 'p3', step: 'Nager 750 m sans m’arrêter' },
  { id: 'openWater', label: '1re sortie en eau libre', phase: 'p4', step: '1re sortie en eau libre' },
  { id: 'raceS', label: 'Triathlon S 🏁', phase: 'p4', step: 'Faire la course 🏁' },
  { id: 'm1500', label: '1 500 m sans m’arrêter', phase: 'p5' },
  { id: 'raceM', label: 'Triathlon M 🏁', phase: 'p5' },
];

// Étapes de la quête « Triathlon S » du plan
export const TRI_S_STEPS = [
  'Trouver un club ou un créneau natation encadré',
  'Nager 100 m de crawl sans m’arrêter',
  'Nager 200 m de crawl sans m’arrêter',
  'Nager 400 m de crawl sans m’arrêter',
  'Choisir la course et m’inscrire',
  'Nager 750 m sans m’arrêter',
  '1re sortie en eau libre',
  'Premier enchaînement vélo → course',
  'Faire la course 🏁',
];

// Étapes des versions précédentes de la quête, remplacées sans perdre ce qui est coché
const OLD_TRI_S_STEPS = ['Nager 400 m de crawl sans m’arrêter', 'Nager 750 m sans m’arrêter'];

export const SWIM_TIPS = [
  {
    title: 'Le matériel',
    text: 'Lunettes, bonnet, planche, pull-buoy et palmes courtes : environ 50 €. Les palmes servent dès la phase 1.',
  },
  {
    title: 'Un regard extérieur chaque mois',
    text: 'Un cours ou une séance de club par mois pour corriger la technique. Fais-toi filmer : on ne sent pas ce qu’on fait dans l’eau.',
  },
  {
    title: 'Séance ratée, séance trop dure',
    text: 'Une séance ratée ne se rattrape pas : reprends simplement la suivante. Si une séance est trop dure, refais celle de la semaine d’avant. Le repos entre les répétitions : autant qu’il faut au début.',
  },
  {
    title: 'La combinaison',
    text: 'Obligatoire ou presque en eau libre au début de l’été. À louer ou acheter avant mai, pour nager avec au moins deux fois avant la course.',
  },
  {
    title: 'L’eau libre en sécurité',
    text: 'Jamais seul, avec une bouée de sécurité bien visible, le long de la rive. Les premières minutes dans l’eau froide coupent le souffle : entre doucement et laisse passer 2-3 min.',
  },
];

// ── Calcul des séances ──────────────────────────────────────────────────────────
export const blockDistance = ([n, d]) => n * d;

export const phaseOfWeek = (week) => PHASES.find((p) => week >= p.weeks[0] && week <= p.weeks[1]);

const buildSession = (week, slot, def) => {
  const phase = phaseOfWeek(week);
  const date = shiftDateKey(SWIM_START, (week - 1) * 7 + (slot === 'A' ? DAY_A : DAY_B));
  const blocks = def.blocks.map(([n, d, drill, rest = null, note = null]) => ({ n, d, drill, rest, note }));
  return {
    id: `W${String(week).padStart(2, '0')}-${slot}`,
    week,
    slot,
    date,
    phase: phase.id,
    light: Boolean(WEEKS[week - 1].light),
    test: Boolean(def.test),
    title: def.title,
    note: def.note ?? null,
    closed: def.closed ?? null,
    blocks,
    volume: blocks.reduce((sum, b) => sum + b.n * b.d, 0),
  };
};

export const SESSIONS = WEEKS.flatMap((w, i) => [buildSession(i + 1, 'A', w.A), buildSession(i + 1, 'B', w.B)]);

export const LAST_SESSION_DATE = SESSIONS[SESSIONS.length - 1].date;

export const sessionOn = (key) => SESSIONS.find((s) => s.date === key) ?? null;

// La séance du jour, sinon la prochaine ; null après la dernière
export const currentSession = (todayKey) => SESSIONS.find((s) => s.date >= todayKey) ?? null;

// Première séance pas encore faite parmi celles déjà passées (pour proposer de la rattraper)
export const lastMissedSession = (todayKey, isDone) =>
  [...SESSIONS].reverse().find((s) => s.date < todayKey && !isDone(s)) ?? null;

export const phaseVolumeRange = (phaseId) => {
  const volumes = SESSIONS.filter((s) => s.phase === phaseId && !s.test && !s.closed).map((s) => s.volume);
  return volumes.length ? [Math.min(...volumes), Math.max(...volumes)] : null;
};

export const phaseDates = (phase) => [
  shiftDateKey(SWIM_START, (phase.weeks[0] - 1) * 7),
  shiftDateKey(SWIM_START, phase.weeks[1] * 7 - 1),
];

export const currentPhase = (todayKey) =>
  PHASES.find((p) => todayKey <= phaseDates(p)[1]) ?? PHASES[PHASES.length - 1];

// Progression en jours vers une date (0 à 1)
export const timeProgress = (todayKey, endKey) => {
  const start = parseDateKey(SWIM_START).getTime();
  const end = parseDateKey(endKey).getTime();
  const now = parseDateKey(todayKey).getTime();
  return Math.min(1, Math.max(0, (now - start) / (end - start)));
};

// Titre de l'occurrence dans le planning : « 🏊 P1 · Rattrapé et palmes (800 m) »
export const sessionEventTitle = (s) => {
  const phase = PHASES.find((p) => p.id === s.phase);
  const volume = s.test ? 'test' : `${s.volume} m`;
  return `🏊 ${phase.short} · ${s.title} (${volume})`;
};

export const blockLabel = (b) => {
  const drill = DRILLS[b.drill];
  if (b.d === 0) return b.n > 1 ? `${b.n} ${drill.unit ?? 'fois'}` : null;
  return b.n > 1 ? `${b.n} × ${b.d} m` : `${b.d} m`;
};

export const shortDayLabel = (key) =>
  parseDateKey(key).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

// Étapes de la quête « Triathlon S » mises à jour : ce qui était coché le reste, les
// étapes ajoutées à la main sont gardées à la fin. null si rien ne change.
export const upgradeTriSteps = (quest) => {
  const steps = quest?.steps ?? [];
  const labels = steps.map((s) => s.label);
  if (TRI_S_STEPS.every((l) => labels.includes(l))) return null;
  const doneOf = (label) => steps.find((s) => s.label === label)?.done ?? false;
  const known = new Set([...TRI_S_STEPS, ...OLD_TRI_S_STEPS]);
  const next = TRI_S_STEPS.map((label, i) => ({
    id: steps.find((s) => s.label === label)?.id ?? `${TRI_S_QUEST_ID}_swim_step_${i}`,
    label,
    done: doneOf(label),
  }));
  steps.filter((s) => !known.has(s.label)).forEach((s) => next.push(s));
  return next;
};
