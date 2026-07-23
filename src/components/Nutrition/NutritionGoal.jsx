import { useState, useMemo, Fragment } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import './NutritionGoal.css';

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sédentaire',             desc: 'Peu ou pas d\'exercice',             factor: 1.2   },
  { id: 'light',     label: 'Légèrement actif',        desc: '1–3 jours de sport / semaine',       factor: 1.375 },
  { id: 'moderate',  label: 'Modérément actif',        desc: '3–5 jours de sport / semaine',       factor: 1.55  },
  { id: 'very',      label: 'Très actif',              desc: '6–7 jours de sport intense',         factor: 1.725 },
  { id: 'extreme',   label: 'Extrêmement actif',       desc: '+2 h de sport intense / jour',       factor: 1.9   },
];

const GOALS = [
  { id: 'lose',     label: 'Perte de poids',   delta: -400, color: '#4fbf8a' },
  { id: 'maintain', label: 'Maintien',          delta: 0,    color: '#4f8ef7' },
  { id: 'gain',     label: 'Prise de masse',    delta: +400, color: '#e09a3a' },
];

const DIETS = [
  { id: 'balanced_lose', label: 'Équilibré – perte de poids', carbs: 0.40, fat: 0.35, protein: 0.25, goals: ['lose'] },
  { id: 'keto',          label: 'Cétogène',                   carbs: 0.10, fat: 0.50, protein: 0.40, goals: ['lose', 'maintain'] },
  { id: 'hyperprotein',  label: 'Hyperprotéiné',              carbs: 0.10, fat: 0.25, protein: 0.65, goals: ['lose', 'gain'] },
  { id: 'balanced',      label: 'Équilibré – maintien',       carbs: 0.50, fat: 0.25, protein: 0.25, goals: ['maintain'] },
  { id: 'muscle',        label: 'Prise de masse',             carbs: 0.50, fat: 0.10, protein: 0.40, goals: ['gain'] },
  { id: 'sport',         label: 'Sportif haut niveau',        carbs: 0.50, fat: 0.20, protein: 0.30, goals: ['maintain', 'gain'] },
];

const MEAL_TYPES = ['breakfast', 'lunch', 'snack', 'dinner'];
const WATER_GOAL = 2000;
const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const METRIC_ROWS = [
  { key: 'kcal',    label: 'Kcal'   },
  { key: 'carbs',   label: 'Gluc'   },
  { key: 'fat',     label: 'Lip'    },
  { key: 'protein', label: 'Prot'   },
  { key: 'water',   label: '💧'     },
];
const FR_MONTHS = ['jan','fév','mar','avr','mai','juin','juil','août','sep','oct','nov','déc'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcBMR(profile) {
  const base = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
  return Math.round(profile.sex === 'homme' ? base + 5 : base - 161);
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getTodayFoodLogKey() {
  const now = new Date();
  const dow = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dow);
  const year = monday.getFullYear();
  const week = getWeekNumber(monday);
  return `planner_food_log_planner_meals_${year}_${String(week).padStart(2, '0')}`;
}

function getWeekWaterKey() {
  return getTodayFoodLogKey().replace('planner_food_log_', 'planner_water_');
}

function todayDayIndex() {
  return (new Date().getDay() + 6) % 7;
}

function checkVal(val, target) {
  if (val === 0) return 'none';
  if (val >= target * 0.8 && val <= target * 1.1) return 'ok';
  return val < target * 0.8 ? 'low' : 'high';
}

function computeDayChecks(foodLog, waterLog, dayIndex, targets) {
  let kcal = 0, protein = 0, fat = 0, carbs = 0;
  MEAL_TYPES.forEach((mt) => {
    (foodLog[`${dayIndex}_${mt}`] || []).forEach((e) => {
      kcal    += Number(e.kcal)      || 0;
      protein += Number(e.proteines) || 0;
      fat     += Number(e.lipides)   || 0;
      carbs   += Number(e.glucides)  || 0;
    });
  });
  const water = waterLog[dayIndex] || 0;
  return {
    hasFood: kcal > 0,
    water,
    checks: {
      kcal:    checkVal(Math.round(kcal),    targets.targetKcal),
      carbs:   checkVal(Math.round(carbs),   targets.carbs),
      fat:     checkVal(Math.round(fat),      targets.fat),
      protein: checkVal(Math.round(protein),  targets.protein),
      water:   checkVal(water, WATER_GOAL),
    },
  };
}

// Lit toutes les semaines ayant des données dans localStorage
function readAllWeekKeys() {
  const pattern = /^planner_food_log_(planner_meals_(\d{4})_(\d{2}))$/;
  const weeks = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    const m = k?.match(pattern);
    if (m) weeks.push({ mealsKey: m[1], year: Number(m[2]), week: Number(m[3]) });
  }
  return weeks.sort((a, b) => b.year - a.year || b.week - a.week);
}

function getWeekMonday(year, week) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dow = jan4.getUTCDay() || 7;
  const d = new Date(jan4);
  d.setUTCDate(jan4.getUTCDate() - dow + 1 + (week - 1) * 7);
  return d;
}

function formatWeekRange(monday) {
  const sun = new Date(monday);
  sun.setUTCDate(monday.getUTCDate() + 6);
  const d1 = monday.getUTCDate(), m1 = FR_MONTHS[monday.getUTCMonth()];
  const d2 = sun.getUTCDate(),    m2 = FR_MONTHS[sun.getUTCMonth()];
  const y = sun.getUTCFullYear();
  return m1 === m2 ? `${d1}–${d2} ${m1} ${y}` : `${d1} ${m1} – ${d2} ${m2} ${y}`;
}

// ── Composants ────────────────────────────────────────────────────────────────

function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(value / max * 100, 100) : 0;
  const over = max > 0 && value > max;
  return (
    <div className="ng-bar-track">
      <div className="ng-bar-fill" style={{ width: `${pct}%`, background: over ? 'var(--danger)' : color }} />
    </div>
  );
}

function WeekGrid({ days, highlightToday }) {
  return (
    <div className="ng-weekly-grid">
      <div className="ng-weekly-col-header" />
      {DAY_LABELS.map((d, i) => (
        <div key={i} className={`ng-weekly-col-header${highlightToday && i === todayDayIndex() ? ' ng-today-col' : ''}`}>{d}</div>
      ))}
      {METRIC_ROWS.map(({ key, label }) => (
        <Fragment key={key}>
          <div className="ng-weekly-row-label">{label}</div>
          {days.map((day, i) => {
            const status = day.checks[key];
            return (
              <div
                key={i}
                className={`ng-weekly-cell ng-check-${status}${highlightToday && i === todayDayIndex() ? ' ng-today-col' : ''}`}
                title={status === 'ok' ? 'Atteint ✓' : status === 'low' ? 'Insuffisant' : status === 'high' ? 'Dépassé' : '—'}
              >
                {status === 'ok'   && '✓'}
                {status === 'low'  && '↓'}
                {status === 'high' && '↑'}
                {status === 'none' && '·'}
              </div>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}

// ── Formulaire profil ─────────────────────────────────────────────────────────

function ProfileForm({ initial, onSave }) {
  const [sex, setSex] = useState(initial?.sex ?? 'homme');
  const [age, setAge] = useState(initial?.age ?? '');
  const [height, setHeight] = useState(initial?.height ?? '');
  const [weight, setWeight] = useState(initial?.weight ?? '');
  const [activity, setActivity] = useState(initial?.activity ?? 'moderate');
  const [goal, setGoal] = useState(initial?.goal ?? 'lose');
  const [diet, setDiet] = useState(() => {
    const g = initial?.goal ?? 'lose';
    return initial?.diet ?? DIETS.find((d) => d.goals.includes(g))?.id ?? DIETS[0].id;
  });

  const availableDiets = DIETS.filter((d) => d.goals.includes(goal));

  const handleGoalChange = (g) => {
    setGoal(g);
    const compatible = DIETS.filter((d) => d.goals.includes(g));
    if (!compatible.find((d) => d.id === diet)) setDiet(compatible[0]?.id ?? DIETS[0].id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!age || !height || !weight) return;
    onSave({ sex, age: Number(age), height: Number(height), weight: Number(weight), activity, goal, diet });
  };

  return (
    <form className="ng-form" onSubmit={handleSubmit}>
      <h2 className="ng-form-title">Mon profil nutritionnel</h2>

      <div className="ng-field">
        <label>Sexe</label>
        <div className="ng-toggle-row">
          {['homme', 'femme'].map((s) => (
            <button key={s} type="button" className={`ng-toggle-btn${sex === s ? ' active' : ''}`} onClick={() => setSex(s)}>
              {s === 'homme' ? 'Homme' : 'Femme'}
            </button>
          ))}
        </div>
      </div>

      <div className="ng-fields-row">
        <div className="ng-field">
          <label>Âge (ans)</label>
          <input type="number" min={10} max={100} placeholder="30" value={age} onChange={(e) => setAge(e.target.value)} required />
        </div>
        <div className="ng-field">
          <label>Taille (cm)</label>
          <input type="number" min={100} max={250} placeholder="170" value={height} onChange={(e) => setHeight(e.target.value)} required />
        </div>
        <div className="ng-field">
          <label>Poids (kg)</label>
          <input type="number" min={30} max={300} step={0.1} placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} required />
        </div>
      </div>

      <div className="ng-field">
        <label>Niveau d'activité</label>
        <div className="ng-activity-list">
          {ACTIVITY_LEVELS.map((a) => (
            <button key={a.id} type="button" className={`ng-activity-btn${activity === a.id ? ' active' : ''}`} onClick={() => setActivity(a.id)}>
              <span className="ng-activity-label">{a.label}</span>
              <span className="ng-activity-desc">{a.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="ng-field">
        <label>Objectif</label>
        <div className="ng-toggle-row">
          {GOALS.map((g) => (
            <button
              key={g.id} type="button"
              className={`ng-toggle-btn${goal === g.id ? ' active' : ''}`}
              style={goal === g.id ? { borderColor: g.color, color: g.color, background: `${g.color}18` } : {}}
              onClick={() => handleGoalChange(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ng-field">
        <label>Type de régime</label>
        <div className="ng-diet-list">
          {availableDiets.map((d) => (
            <button key={d.id} type="button" className={`ng-diet-btn${diet === d.id ? ' active' : ''}`} onClick={() => setDiet(d.id)}>
              <span className="ng-diet-name">{d.label}</span>
              <span className="ng-diet-macros">G {Math.round(d.carbs * 100)}% · L {Math.round(d.fat * 100)}% · P {Math.round(d.protein * 100)}%</span>
            </button>
          ))}
        </div>
      </div>

      <button type="submit" className="ng-save-btn">Calculer mes objectifs</button>
    </form>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function NutritionGoal() {
  const [profile, setProfile] = useLocalStorage('planner_nutrition_profile', null);
  const [editing, setEditing] = useState(false);
  const [todayFoodLog] = useLocalStorage(getTodayFoodLogKey(), {});
  const [weekWaterLog, setWeekWaterLog] = useLocalStorage(getWeekWaterKey(), {});
  const [expandedWeek, setExpandedWeek] = useState(null);

  const addWater = (ml) => {
    const di = todayDayIndex();
    setWeekWaterLog((prev) => ({ ...prev, [di]: Math.max(0, (prev[di] || 0) + ml) }));
  };
  const todayWater = weekWaterLog[todayDayIndex()] || 0;

  const targets = useMemo(() => {
    if (!profile) return null;
    const bmr = calcBMR(profile);
    const actFactor = ACTIVITY_LEVELS.find((a) => a.id === profile.activity)?.factor ?? 1.55;
    const tdee = Math.round(bmr * actFactor);
    const goalDelta = GOALS.find((g) => g.id === profile.goal)?.delta ?? 0;
    const targetKcal = tdee + goalDelta;
    const dietRatios = DIETS.find((d) => d.id === profile.diet) ?? DIETS[0];
    return {
      bmr, tdee, targetKcal,
      carbs:   Math.round(targetKcal * dietRatios.carbs / 4),
      fat:     Math.round(targetKcal * dietRatios.fat   / 9),
      protein: Math.round(targetKcal * dietRatios.protein / 4),
    };
  }, [profile]);

  // Récap semaine courante
  const weeklyStats = useMemo(() => {
    if (!targets) return null;
    return Array.from({ length: 7 }, (_, i) => computeDayChecks(todayFoodLog, weekWaterLog, i, targets));
  }, [todayFoodLog, weekWaterLog, targets]);

  // Historique toutes les semaines passées
  const historyData = useMemo(() => {
    if (!targets) return [];
    const currentMealsKey = getTodayFoodLogKey().replace('planner_food_log_', '');
    return readAllWeekKeys()
      .filter(({ mealsKey }) => mealsKey !== currentMealsKey)
      .map(({ mealsKey, year, week }) => {
        let foodLog = {}, waterLog = {};
        try { foodLog  = JSON.parse(localStorage.getItem(`planner_food_log_${mealsKey}`) || '{}'); } catch {}
        try { waterLog = JSON.parse(localStorage.getItem(`planner_water_${mealsKey}`)    || '{}'); } catch {}

        const days = Array.from({ length: 7 }, (_, i) => computeDayChecks(foodLog, waterLog, i, targets));
        const daysWithData = days.filter((d) => d.hasFood || d.water > 0).length;
        if (daysWithData === 0) return null;

        const scores = Object.fromEntries(
          METRIC_ROWS.map(({ key }) => [key, days.filter((d) => d.checks[key] === 'ok').length])
        );
        const monday = getWeekMonday(year, week);
        return { id: `${year}_${week}`, week, monday, days, scores, daysWithData };
      })
      .filter(Boolean);
  }, [targets]);

  // Intake du jour
  const todayIntake = useMemo(() => {
    const di = todayDayIndex();
    let kcal = 0, protein = 0, fat = 0, carbs = 0;
    MEAL_TYPES.forEach((mt) => {
      (todayFoodLog[`${di}_${mt}`] || []).forEach((e) => {
        kcal    += Number(e.kcal)      || 0;
        protein += Number(e.proteines) || 0;
        fat     += Number(e.lipides)   || 0;
        carbs   += Number(e.glucides)  || 0;
      });
    });
    return { kcal: Math.round(kcal), protein: Math.round(protein * 10) / 10, fat: Math.round(fat * 10) / 10, carbs: Math.round(carbs * 10) / 10 };
  }, [todayFoodLog]);

  const goalInfo = GOALS.find((g) => g.id === profile?.goal);
  const dietInfo = DIETS.find((d) => d.id === profile?.diet);

  if (!profile || editing) {
    return (
      <div className="nutrition-goal">
        <ProfileForm initial={profile} onSave={(p) => { setProfile(p); setEditing(false); }} />
      </div>
    );
  }

  const remainKcal = targets.targetKcal - todayIntake.kcal;

  return (
    <div className="nutrition-goal">
      <div className="ng-dashboard-header">
        <div>
          <h2 className="ng-goal-title">Objectif : {goalInfo?.label}</h2>
          <p className="ng-goal-sub">Régime {dietInfo?.label} · {targets.targetKcal} kcal / jour</p>
        </div>
        <button className="ng-edit-btn" onClick={() => setEditing(true)}>Modifier</button>
      </div>

      {/* Métriques BMR / TDEE / Objectif */}
      <div className="ng-metrics-row">
        <div className="ng-metric">
          <span className="ng-metric-value">{targets.bmr}</span>
          <span className="ng-metric-label">kcal de base (BMR)</span>
        </div>
        <div className="ng-metric">
          <span className="ng-metric-value">{targets.tdee}</span>
          <span className="ng-metric-label">kcal dépensées (TDEE)</span>
        </div>
        <div className="ng-metric" style={{ '--mc': goalInfo?.color }}>
          <span className="ng-metric-value ng-metric-target">{targets.targetKcal}</span>
          <span className="ng-metric-label">kcal objectif / jour</span>
        </div>
      </div>

      {/* Macros cibles */}
      <div className="ng-macro-targets">
        <h3 className="ng-section-title">Objectifs journaliers</h3>
        <div className="ng-macro-chips">
          <span className="ng-chip ng-chip-carbs">Glucides : {targets.carbs} g</span>
          <span className="ng-chip ng-chip-fat">Lipides : {targets.fat} g</span>
          <span className="ng-chip ng-chip-protein">Protéines : {targets.protein} g</span>
        </div>
      </div>

      {/* Suivi du jour */}
      <div className="ng-today-section">
        <h3 className="ng-section-title">Aujourd'hui</h3>

        <div className="ng-progress-block">
          <div className="ng-progress-header">
            <span className="ng-progress-label">Calories</span>
            <span className="ng-progress-values">
              <strong>{todayIntake.kcal}</strong> / {targets.targetKcal} kcal
              {remainKcal > 0
                ? <span className="ng-remain"> · {remainKcal} restantes</span>
                : <span className="ng-over"> · {Math.abs(remainKcal)} de trop</span>}
            </span>
          </div>
          <ProgressBar value={todayIntake.kcal} max={targets.targetKcal} color={goalInfo?.color ?? '#4f8ef7'} />
        </div>

        <div className="ng-macros-today">
          <div className="ng-progress-block">
            <div className="ng-progress-header">
              <span className="ng-progress-label">Glucides</span>
              <span className="ng-progress-values">{todayIntake.carbs} / {targets.carbs} g</span>
            </div>
            <ProgressBar value={todayIntake.carbs} max={targets.carbs} color="#e09a3a" />
          </div>
          <div className="ng-progress-block">
            <div className="ng-progress-header">
              <span className="ng-progress-label">Lipides</span>
              <span className="ng-progress-values">{todayIntake.fat} / {targets.fat} g</span>
            </div>
            <ProgressBar value={todayIntake.fat} max={targets.fat} color="#e05a7a" />
          </div>
          <div className="ng-progress-block">
            <div className="ng-progress-header">
              <span className="ng-progress-label">Protéines</span>
              <span className="ng-progress-values">{todayIntake.protein} / {targets.protein} g</span>
            </div>
            <ProgressBar value={todayIntake.protein} max={targets.protein} color="#4fbf8a" />
          </div>
        </div>

        {/* Eau */}
        <div className="ng-progress-block">
          <div className="ng-progress-header">
            <span className="ng-progress-label">💧 Eau</span>
            <span className="ng-progress-values">
              <strong>{todayWater >= 1000 ? `${(todayWater / 1000).toFixed(todayWater % 1000 === 0 ? 0 : 1)} L` : `${todayWater} mL`}</strong>
              {' '}/ 2 L
              {todayWater >= WATER_GOAL
                ? <span className="ng-remain"> · Objectif atteint ✓</span>
                : <span className="ng-over-water"> · {((WATER_GOAL - todayWater) / 1000).toFixed(1)} L restants</span>}
            </span>
          </div>
          <ProgressBar value={todayWater} max={WATER_GOAL} color="#4abde8" />
          <div className="ng-water-btns">
            {[150, 250, 500, 1000].map((ml) => (
              <button key={ml} className="ng-water-btn" onClick={() => addWater(ml)}>
                +{ml < 1000 ? `${ml}mL` : '1L'}
              </button>
            ))}
            <button className="ng-water-btn ng-water-sub" onClick={() => addWater(-250)} disabled={todayWater === 0}>−250mL</button>
          </div>
        </div>
      </div>

      {/* Récap semaine courante */}
      {weeklyStats && (
        <div className="ng-weekly-recap">
          <h3 className="ng-section-title">Récap de la semaine</h3>
          <WeekGrid days={weeklyStats} highlightToday />
          <p className="ng-weekly-legend">
            <span className="ng-check-ok">✓</span> atteint (80–110%) ·
            <span className="ng-check-low"> ↓</span> insuffisant ·
            <span className="ng-check-high"> ↑</span> dépassé ·
            <span> · non renseigné</span>
          </p>
        </div>
      )}

      {/* Historique des semaines passées */}
      {historyData.length > 0 && (
        <div className="ng-history">
          <h3 className="ng-section-title">Historique des semaines</h3>
          {historyData.map(({ id, week, monday, days, scores }) => {
            const isOpen = expandedWeek === id;
            return (
              <div key={id} className="ng-history-week">
                <button
                  className="ng-history-header"
                  onClick={() => setExpandedWeek(isOpen ? null : id)}
                >
                  <span className="ng-history-range">Sem {week} · {formatWeekRange(monday)}</span>
                  <span className="ng-history-scores">
                    {METRIC_ROWS.map(({ key, label }) => (
                      <span
                        key={key}
                        className={`ng-history-score ng-hscore-${scores[key] >= 5 ? 'good' : scores[key] >= 3 ? 'mid' : 'low'}`}
                      >
                        {label} {scores[key]}/7
                      </span>
                    ))}
                  </span>
                  <span className="ng-history-chevron">{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <div className="ng-history-body">
                    <WeekGrid days={days} highlightToday={false} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Infos profil */}
      <div className="ng-profile-summary">
        <span>{profile.sex === 'homme' ? 'Homme' : 'Femme'}</span>
        <span>{profile.age} ans</span>
        <span>{profile.height} cm</span>
        <span>{profile.weight} kg</span>
        <span>{ACTIVITY_LEVELS.find((a) => a.id === profile.activity)?.label}</span>
      </div>
    </div>
  );
}
