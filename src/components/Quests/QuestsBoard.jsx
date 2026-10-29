import { useState, useRef } from 'react';
import { CalendarCheck, Flame, Lock, Medal, Pencil, Ticket, TriangleAlert } from 'lucide-react';
import { useLocalStorage, writeStoredValue } from '../../hooks/useLocalStorage';
import { AchievementIcon, ChallengeKindIcon, DomainIcon, QuestTypeIcon } from '../Icons';
import {
  QUESTS_KEY,
  QUEST_LOG_KEY,
  WEEK_LOG_KEY,
  MAX_DAILY,
  MAX_WEEKLY,
  MAX_LONG,
  MAX_INSTALLING,
  INSTALL_DAYS,
  DAYS_PER_JOKER,
  QUEST_TYPES,
  CHALLENGE_KINDS,
  DOMAINS,
  ACHIEVEMENTS,
  typeOf,
  kindOf,
  hasSteps,
  makeQuest,
  dateKey,
  weekKeyOf,
  monthKeyOf,
  nextMonthKey,
  monthLabel,
  challengeStatus,
  weekCount,
  weekTarget,
  isDailyQuest,
  installedDays,
  isAcquired,
  isInstalling,
  computeProgress,
  computeSeason,
  computeWeekProgress,
} from '../../data/quests';
import {
  DAILY_GOALS_KEY,
  RECURRING_KEY,
  RECURRING_OVERRIDES_KEY,
  PLAN_VERSION,
  isPlanImported,
  planMissingLabels,
  planQuestsToAdd,
  mergePlanDailyGoals,
  mergePlanWeekGoals,
  mergePlanRecurring,
  mergePlanOverrides,
} from '../../data/questsPlan';
import ChallengesSection from './ChallengesSection';
import './QuestsBoard.css';

const EMPTY_DRAFT = {
  type: 'daily',
  label: '',
  domain: 'sport',
  minimum: '',
  target: '',
  unit: '',
  perWeek: 2,
  kind: 'monthly',
  month: null,
  stepsText: '',
  deadline: '',
};

const parseSteps = (text) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

export default function QuestsBoard() {
  const [quests, setQuests] = useLocalStorage(QUESTS_KEY, []);
  // Lecture seule : les quêtes quotidiennes se cochent dans la Semaine
  const [log] = useLocalStorage(QUEST_LOG_KEY, {});
  // Les compteurs hebdo se cochent dans la Semaine ; ici on ne fait que suivre la cible
  const [weekLog, setWeekLog] = useLocalStorage(WEEK_LOG_KEY, {});
  const [draft, setDraft] = useState(null); // null = formulaire fermé
  const [editingId, setEditingId] = useState(null);
  const formRef = useRef(null);
  const [importResult, setImportResult] = useState(null); // { added, skipped }
  // Événements récurrents du planning : le plan y ajoute ses séances
  const [recurring, setRecurring] = useLocalStorage(RECURRING_KEY, []);
  const [planVersion, setPlanVersion] = useLocalStorage('planner_plan_version', null);
  const planUpToDate = isPlanImported(quests, recurring) && planVersion === PLAN_VERSION;

  const todayKey = dateKey(new Date());
  const today = log[todayKey] ?? { energy: null, done: {} };
  const currentWeekKey = weekKeyOf(new Date());
  const currentWeek = weekLog[currentWeekKey];
  const progress = { ...computeProgress(quests, log), ...computeWeekProgress(quests, weekLog) };
  const season = computeSeason(quests, log);
  const unlocked = ACHIEVEMENTS.filter((a) => a.check(progress));

  const daily = quests.filter(isDailyQuest);
  const weekly = quests.filter((q) => typeOf(q) === 'weekly');
  const thisMonth = monthKeyOf(new Date());
  const followingMonth = nextMonthKey(new Date());
  // Un seul défi par mois : un mois est pris tant que son défi n'est pas archivé
  const monthTaken = (month) =>
    quests.some(
      (q) =>
        typeOf(q) === 'target' &&
        kindOf(q) === 'monthly' &&
        q.month === month &&
        challengeStatus(q) !== 'archived',
    );
  const activeLongCount = quests.filter(
    (q) =>
      typeOf(q) === 'target' &&
      kindOf(q) === 'long' &&
      ['active', 'expired'].includes(challengeStatus(q)),
  ).length;
  const waiting = quests.filter((q) => typeOf(q) === 'habit' && !q.activatedAt);
  const installingCount = quests.filter((q) => isInstalling(q, log)).length;
  const doneCount = daily.filter((q) => today.done[q.id]).length;

  const updateQuest = (id, fn) =>
    setQuests((prev) => prev.map((q) => (q.id === id ? fn(q) : q)));

  // kind : ouvre directement le formulaire d'un challenge (boutons des sections)
  const openForm = (quest, kind) => {
    setEditingId(quest?.id ?? null);
    setDraft(
      quest
        ? {
            ...EMPTY_DRAFT,
            type: typeOf(quest),
            label: quest.label,
            domain: quest.domain,
            minimum: quest.minimum ?? '',
            target: quest.target ?? '',
            unit: quest.unit ?? '',
            perWeek: quest.perWeek ?? 2,
            kind: quest.kind ?? null,
            month: quest.month ?? null,
            stepsText: (quest.steps ?? []).map((st) => st.label).join('\n'),
            deadline: quest.deadline ?? '',
          }
        : {
            ...EMPTY_DRAFT,
            type: kind ? 'target' : 'daily',
            kind: kind ?? 'monthly',
            month: monthTaken(thisMonth) ? followingMonth : thisMonth,
          },
    );
    // Le formulaire est en bas de l'onglet : on l'amène à l'écran
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    );
  };

  const draftTarget = Number(String(draft?.target ?? '').replace(',', '.'));
  const editingQuest = quests.find((q) => q.id === editingId);
  // Les anciens buts chiffrés (sans kind) restent chiffrés ; un long terme a des étapes
  const draftUsesSteps =
    draft?.type === 'target' && draft.kind === 'long' && !(editingQuest && !hasSteps(editingQuest));
  const draftValid =
    draft &&
    draft.label.trim() &&
    (draft.type !== 'target' ||
      (draftUsesSteps ? parseSteps(draft.stepsText).length > 0 : draftTarget > 0));

  const saveDraft = (e) => {
    e.preventDefault();
    if (!draftValid) return;
    const clean = {
      type: draft.type,
      label: draft.label.trim(),
      domain: draft.domain,
      minimum: draft.minimum.trim(),
      target: draftTarget,
      unit: draft.unit.trim(),
      perWeek: draft.perWeek,
      kind: draft.kind,
      month: draft.month,
      deadline: draft.deadline || null,
      steps: parseSteps(draft.stepsText).map((label, i) => ({
        id: `step_${Date.now()}_${i}`,
        label,
        done: false,
      })),
    };
    if (editingId) {
      const quest = quests.find((q) => q.id === editingId);
      const type = typeOf(quest);
      if (type === 'weekly' && clean.perWeek !== quest.perWeek) {
        // Nouveau réglage : vaut dès cette semaine, et l'historique d'ajustement repart de là
        setWeekLog((prev) => {
          const week = prev[currentWeekKey];
          if (!week) return prev;
          return {
            ...prev,
            [currentWeekKey]: { ...week, targets: { ...week.targets, [editingId]: clean.perWeek } },
          };
        });
      }
      updateQuest(editingId, (q) => {
        const common = { ...q, label: clean.label, domain: clean.domain };
        if (type === 'target' && hasSteps(q)) {
          // Les étapes gardent leur coche quand leur texte ne change pas
          const steps = clean.steps.map(
            (st) => q.steps.find((old) => old.label === st.label) ?? st,
          );
          return { ...common, steps, deadline: clean.deadline };
        }
        if (type === 'target') return { ...common, target: clean.target, unit: clean.unit };
        if (type === 'weekly') {
          return clean.perWeek === q.perWeek
            ? common
            : { ...common, perWeek: clean.perWeek, perWeekSince: currentWeekKey };
        }
        return { ...common, minimum: clean.minimum };
      });
    } else {
      setQuests((prev) => [...prev, makeQuest(clean)]);
    }
    setDraft(null);
  };

  const removeQuest = (id) => {
    if (!window.confirm('Supprimer cette quête ? Son historique ne comptera plus.')) return;
    setQuests((prev) => prev.filter((q) => q.id !== id));
    setDraft(null);
  };

  const activate = (id) =>
    updateQuest(id, (q) => ({ ...q, activatedAt: new Date().toISOString() }));

  const pause = (id) => {
    if (!window.confirm('Remettre en attente ? L’installation repartira de zéro.')) return;
    updateQuest(id, (q) => ({ ...q, activatedAt: null }));
    setDraft(null);
  };

  // Plan Triathlon & Maths : ajoute quêtes, challenges et objectifs (jour + semaine)
  // jusqu'au 22 novembre, sans rien modifier de l'existant
  const importPlan = () => {
    const { added, skipped, removed } = planQuestsToAdd(quests);
    const message =
      `Importer le plan Triathlon & Maths ?\n\n${added.length} quête(s) à créer, ` +
      'les séances dans le planning (natation mar. + ven. 12h, vélo sam. 10h, course dim. 10h, ' +
      'maths + culture chaque soir, batch cooking dim. 17h ; la case « Appart » dans les objectifs de chaque jour) ' +
      'et les objectifs de la semaine jusqu’au 22 novembre. ' +
      (removed.length > 0
        ? 'L’ancienne quête « Vélo ou course » est remplacée par « Vélo » et « Course ». '
        : '') +
      'Rien d’autre de ce que tu as déjà ne sera modifié.';
    if (!window.confirm(message)) return;
    setQuests((prev) => [...prev.filter((q) => !removed.includes(q.id)), ...added]);
    setWeekLog(mergePlanWeekGoals);
    setRecurring(mergePlanRecurring);
    // Ces clés vivent dans la Semaine, qui n'est pas montée ici
    writeStoredValue(RECURRING_OVERRIDES_KEY, mergePlanOverrides);
    writeStoredValue(DAILY_GOALS_KEY, mergePlanDailyGoals);
    setPlanVersion(PLAN_VERSION);
    setImportResult({ added: added.length, skipped });
  };

  const dailyFull = daily.length >= MAX_DAILY;
  const typeFull = (type, kind) =>
    (type === 'daily' && dailyFull) ||
    (type === 'weekly' && weekly.length >= MAX_WEEKLY) ||
    (type === 'target' && kind === 'long' && activeLongCount >= MAX_LONG);
  const canActivate = !dailyFull && installingCount < MAX_INSTALLING;

  const renderEditBtn = (q) => (
    <button className="quests-edit" onClick={() => openForm(q)} title="Modifier" aria-label="Modifier">
      <Pencil size={14} />
    </button>
  );

  return (
    <div className="quests-board">
      <h2 className="quests-page-title">Mes quêtes</h2>

      {/* ── Série, jokers, saison ── */}
      <div className="quests-stats">
        <div className="quests-stat">
          <span className="quests-stat-value">
            <Flame size={18} className="quests-stat-icon" style={{ color: 'var(--warning)' }} aria-hidden="true" />
            {progress.streak}
          </span>
          <span className="quests-stat-label">série (record {progress.maxStreak})</span>
        </div>
        <div className="quests-stat">
          <span className="quests-stat-value">
            <CalendarCheck size={18} className="quests-stat-icon" style={{ color: 'var(--accent)' }} aria-hidden="true" />
            {progress.weekStreak}
          </span>
          <span className="quests-stat-label">semaines réussies d’affilée</span>
        </div>
        <div className="quests-stat">
          <span className="quests-stat-value">
            <Ticket size={18} className="quests-stat-icon" style={{ color: '#BF5AF2' }} aria-hidden="true" />
            {progress.jokers}
          </span>
          <span className="quests-stat-label">1 joker / {DAYS_PER_JOKER} jours</span>
        </div>
        <div className="quests-stat">
          <span className="quests-stat-value">{season.percent} %</span>
          <span className="quests-stat-label">saison {season.label}</span>
        </div>
      </div>
      <div className="quests-season-bar">
        <div className="quests-season-fill" style={{ width: `${season.percent}%` }} />
      </div>

      {progress.missRun === 1 && !progress.todayValidated && (
        <p className="quests-warning">
          <TriangleAlert size={15} className="quests-inline-icon" aria-hidden="true" />
          Hier est raté : jamais deux fois de suite. Coche au moins les minimums aujourd’hui
          {progress.jokers > 0 ? ' (sinon un joker sera utilisé).' : '.'}
        </p>
      )}

      {importResult ? (
        <p className="quests-import-done">
          Plan importé : {importResult.added} quête(s) créée(s). Tes séances sont dans l’onglet Semaine :
          coche un événement et la quête correspondante est comptée toute seule.
          {importResult.skipped.length > 0 &&
            ` Non ajoutées (plafond atteint) : ${importResult.skipped.join(', ')}.`}
        </p>
      ) : (
        !planUpToDate && (
          <div className="quests-import">
            <div>
              <div className="quests-import-title">Plan Triathlon & Maths</div>
              <div className="quests-item-sub">
                {quests.some((q) => q.id.startsWith('plan_'))
                  ? `Mise à jour du plan : ${planMissingLabels(quests).join(', ') || 'titres plus clairs pour l’étude du soir (🧮 Maths · 🎷 Jazz…)'}. Rien de ce que tu as déjà n’est modifié.`
                  : 'Crée d’un clic tes quêtes, le défi de novembre, le challenge Triathlon S et tes séances dans le planning jusqu’au 22 novembre. Détails dans ta page Notion.'}
              </div>
            </div>
            <button className="quests-save-btn" onClick={importPlan}>
              Importer
            </button>
          </div>
        )
      )}

      {quests.length === 0 && !draft && (
        <p className="quests-empty">
          Quatre sortes de quêtes : une case à cocher chaque jour, un objectif à faire plusieurs
          fois par semaine, un challenge (défi du mois ou long terme) et une habitude à mettre
          en place quand tu te sens prêt.
        </p>
      )}

      {/* ── Chaque jour ── */}
      {daily.length > 0 && (
        <section className="quests-section">
          <div className="quests-header">
            <h2 className="quests-title">
              <QuestTypeIcon id="daily" size={18} />
              Chaque jour
            </h2>
            <span className="quests-count">
              {progress.todayValidated ? '✓ Journée validée' : `${doneCount}/${daily.length} aujourd’hui`}
            </span>
          </div>
          <p className="quests-hint">Se cochent en haut de l’onglet Semaine, une case par jour (deuxième touche : minimum). Un minimum suffit à valider la journée.</p>
          <ul className="quests-items">
            {daily.map((q) => {
              const installed = installedDays(q, log);
              return (
                <li key={q.id} className={`quests-item${today.done[q.id] ? ' done' : ''}`}>
                  <div className="quests-item-head">
                    <DomainIcon id={q.domain} size={16} className="quests-item-domain" />
                    <span className="quests-item-label">{q.label}</span>
                    {today.done[q.id] && <span className="quests-item-status">✓</span>}
                    {renderEditBtn(q)}
                  </div>
                  {q.minimum && <div className="quests-item-sub">Minimum : {q.minimum}</div>}
                  {typeOf(q) === 'habit' &&
                    (isAcquired(q, log) ? (
                      <div className="quests-item-sub quests-acquired">
                        <Medal size={14} className="quests-inline-icon" aria-hidden="true" />
                        Habitude acquise
                      </div>
                    ) : (
                      <div className="quests-progress">
                        <div className="quests-progress-bar">
                          <div
                            className="quests-progress-fill install"
                            style={{ width: `${(installed / INSTALL_DAYS) * 100}%` }}
                          />
                        </div>
                        <span className="quests-progress-label">
                          {installed}/{INSTALL_DAYS} jours
                        </span>
                      </div>
                    ))}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ── Chaque semaine ── */}
      {weekly.length > 0 && (
        <section className="quests-section">
          <div className="quests-header">
            <h2 className="quests-title">
              <QuestTypeIcon id="weekly" size={18} />
              Chaque semaine
            </h2>
            <span className="quests-count">
              {progress.currentWeekSucceeded ? '✓ Semaine réussie' : 'Cette semaine'}
            </span>
          </div>
          <p className="quests-hint">
            Se cochent en haut de l’onglet Semaine, avec jusqu’à 2 objectifs précis propres à la semaine.
          </p>
          <ul className="quests-items">
            {weekly.map((q) => {
              const count = weekCount(q, currentWeek);
              const target = weekTarget(q, currentWeek);
              return (
                <li key={q.id} className={`quests-item${count >= target ? ' done' : ''}`}>
                  <div className="quests-item-head">
                    <DomainIcon id={q.domain} size={16} className="quests-item-domain" />
                    <span className="quests-item-label">{q.label}</span>
                    <span className="quests-item-sub">
                      {count}/{target} cette semaine
                    </span>
                    {renderEditBtn(q)}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <ChallengesSection
        quests={quests}
        updateQuest={updateQuest}
        onEdit={(q) => openForm(q)}
        onNew={(kind) => openForm(null, kind)}
      />

      {/* ── Liste d'attente ── */}
      {waiting.length > 0 && (
        <section className="quests-section">
          <div className="quests-header">
            <h2 className="quests-title">
              <QuestTypeIcon id="habit" size={18} />
              À mettre en place
            </h2>
            <span className="quests-count">{waiting.length} en attente</span>
          </div>
          <p className="quests-hint">
            Active-en une quand tu te sens prêt : {MAX_INSTALLING} en installation à la fois maximum.
          </p>
          <ul className="quests-items">
            {waiting.map((q) => (
              <li key={q.id} className="quests-item">
                <div className="quests-item-head">
                  <DomainIcon id={q.domain} size={16} className="quests-item-domain" />
                  <span className="quests-item-label">{q.label}</span>
                  {renderEditBtn(q)}
                  <button
                    className="quests-activate-btn"
                    onClick={() => activate(q.id)}
                    disabled={!canActivate}
                    title={
                      dailyFull
                        ? `Déjà ${MAX_DAILY} quêtes quotidiennes`
                        : installingCount >= MAX_INSTALLING
                          ? `Déjà ${MAX_INSTALLING} habitudes en installation`
                          : 'Commencer à partir d’aujourd’hui'
                    }
                  >
                    Activer
                  </button>
                </div>
                {q.minimum && <div className="quests-item-sub">Minimum : {q.minimum}</div>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Formulaire ── */}
      {draft ? (
        <form className="quests-form" onSubmit={saveDraft} ref={formRef}>
          {!editingId && (
            <>
              <div className="quests-type-picker">
                {QUEST_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`quests-type-btn${draft.type === t.id ? ' active' : ''}`}
                    onClick={() => setDraft({ ...draft, type: t.id })}
                  >
                    <QuestTypeIcon id={t.id} size={15} />
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="quests-hint">{QUEST_TYPES.find((t) => t.id === draft.type).hint}</p>
              {draft.type === 'target' && (
                <>
                  <div className="quests-type-picker">
                    {CHALLENGE_KINDS.map((k) => (
                      <button
                        key={k.id}
                        type="button"
                        className={`quests-domain-btn${draft.kind === k.id ? ' active' : ''}`}
                        onClick={() => setDraft({ ...draft, kind: k.id })}
                      >
                        <ChallengeKindIcon id={k.id} size={15} />
                        {k.label}
                      </button>
                    ))}
                  </div>
                  <p className="quests-hint">{CHALLENGE_KINDS.find((k) => k.id === draft.kind).hint}</p>
                </>
              )}
              {draft.type === 'target' && draft.kind === 'monthly' && (
                <div className="quests-type-picker">
                  {[thisMonth, followingMonth].map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`quests-domain-btn${draft.month === m ? ' active' : ''}`}
                      onClick={() => setDraft({ ...draft, month: m })}
                      disabled={monthTaken(m)}
                      title={monthTaken(m) ? 'Ce mois a déjà son défi' : undefined}
                    >
                      {m === thisMonth ? 'Ce mois-ci' : 'Le mois prochain'} ({monthLabel(m)})
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          <div className="quests-domain-picker">
            {DOMAINS.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`quests-domain-btn${draft.domain === d.id ? ' active' : ''}`}
                onClick={() => setDraft({ ...draft, domain: d.id })}
                title={d.label}
              >
                <DomainIcon id={d.id} size={15} />
                {d.label}
              </button>
            ))}
          </div>
          <input
            className="quests-input"
            placeholder={
              draft.type === 'target'
                ? draft.kind === 'long'
                  ? 'Challenge (ex. Triathlon S)'
                  : 'Défi (ex. Nager)'
                : draft.type === 'weekly'
                  ? 'Objectif (ex. Séance de natation)'
                  : draft.type === 'habit'
                  ? 'Habitude (ex. Me coucher avant 23h)'
                  : 'Quête (ex. 20 pompes)'
            }
            value={draft.label}
            maxLength={40}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          />
          {draft.type === 'weekly' ? (
            <div className="quests-perweek">
              <span>Combien de fois par semaine ?</span>
              <div className="quests-perweek-picker">
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`quests-domain-btn${draft.perWeek === n ? ' active' : ''}`}
                    onClick={() => setDraft({ ...draft, perWeek: n })}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ) : draftUsesSteps ? (
            <>
              <textarea
                className="quests-input quests-steps-input"
                placeholder={'Les étapes, une par ligne :\nTrouver un club\nNager 400 m sans m’arrêter\nM’inscrire'}
                value={draft.stepsText}
                rows={5}
                onChange={(e) => setDraft({ ...draft, stepsText: e.target.value })}
              />
              <label className="quests-deadline">
                Date finale
                <input
                  type="date"
                  className="quests-input"
                  value={draft.deadline}
                  onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
                />
              </label>
            </>
          ) : draft.type === 'target' ? (
            <div className="quests-target-row">
              <input
                className="quests-input"
                inputMode="decimal"
                placeholder="Cible (ex. 10)"
                value={draft.target}
                onChange={(e) => setDraft({ ...draft, target: e.target.value })}
              />
              <input
                className="quests-input"
                placeholder="Unité (ex. km)"
                value={draft.unit}
                maxLength={15}
                onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
              />
            </div>
          ) : (
            <input
              className="quests-input"
              placeholder="Minimum jour sans, facultatif (ex. 5 pompes)"
              value={draft.minimum}
              maxLength={80}
              onChange={(e) => setDraft({ ...draft, minimum: e.target.value })}
            />
          )}
          {!editingId && typeFull(draft.type, draft.kind) && (
            <p className="quests-cap">
              {draft.type === 'daily'
                ? `Déjà ${MAX_DAILY} quêtes quotidiennes : mets plutôt celle-ci dans « À mettre en place ».`
                : draft.type === 'weekly'
                  ? `Déjà ${MAX_WEEKLY} quêtes hebdomadaires : garde de la place pour tenir celles-là.`
                  : `Déjà ${MAX_LONG} challenges long terme en cours : termine ou archive-en un d’abord.`}
            </p>
          )}
          <div className="quests-form-actions">
            {editingId && (
              <button type="button" className="quests-delete-btn" onClick={() => removeQuest(editingId)}>
                Supprimer
              </button>
            )}
            {editingQuest && typeOf(editingQuest) === 'habit' && editingQuest.activatedAt && (
              <button type="button" className="quests-cancel-btn" onClick={() => pause(editingId)}>
                Remettre en attente
              </button>
            )}
            <button type="button" className="quests-cancel-btn" onClick={() => setDraft(null)}>
              Annuler
            </button>
            <button
              type="submit"
              className="quests-save-btn"
              disabled={
                !draftValid ||
                (!editingId && typeFull(draft.type, draft.kind)) ||
                (!editingId && draft.type === 'target' && draft.kind === 'monthly' && monthTaken(draft.month))
              }
            >
              {editingId ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      ) : (
        <button className="quests-add-btn" onClick={() => openForm(null)}>
          + Nouvelle quête
        </button>
      )}

      {/* ── Succès ── */}
      <div className="quests-header quests-achievements-header">
        <h2 className="quests-title">Succès</h2>
        <span className="quests-count">
          {unlocked.length}/{ACHIEVEMENTS.length} ·{' '}
          {Math.round((unlocked.length / ACHIEVEMENTS.length) * 100)} %
        </span>
      </div>
      <ul className="quests-achievements">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlocked.includes(a);
          return (
            <li key={a.id} className={`quests-achievement${isUnlocked ? ' unlocked' : ''}`}>
              <span className="quests-achievement-icon">
                {isUnlocked ? <AchievementIcon id={a.id} size={20} /> : <Lock size={18} aria-hidden="true" />}
              </span>
              <div>
                <div className="quests-achievement-title">{a.title}</div>
                <div className="quests-achievement-desc">{a.description}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
