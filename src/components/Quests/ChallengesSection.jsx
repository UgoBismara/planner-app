import { useState } from 'react';
import {
  MAX_LONG,
  typeOf,
  kindOf,
  hasSteps,
  domainOf,
  dateKey,
  monthKeyOf,
  monthLabel,
  shiftDateKey,
  parseDateKey,
  challengeStatus,
  daysLeft,
} from '../../data/quests';

const fmt = (n) => Number(n.toFixed(2)).toLocaleString('fr-FR');

const formatDeadline = (key) =>
  parseDateKey(key).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

const countdown = (key) => {
  const n = daysLeft(key);
  if (n === 0) return 'dernier jour';
  return `J-${n}`;
};

// Sections « Challenges » de l'onglet Quêtes : défi du mois mis en avant, long terme
// avec étapes, échéances passées (prolonger une fois ou archiver) et vitrine.
export default function ChallengesSection({ quests, updateQuest, onEdit, onNew }) {
  const [amounts, setAmounts] = useState({}); // saisie « + » des challenges chiffrés
  const [prolonging, setProlonging] = useState(null); // { id, date }

  const now = new Date();
  const todayKey = dateKey(now);
  const currentMonth = monthKeyOf(now);
  const challenges = quests.filter((q) => typeOf(q) === 'target');
  const withStatus = challenges.map((q) => ({ q, status: challengeStatus(q, now) }));

  // Défi du mois en cours, plus ceux d'un mois passé encore actifs parce que prolongés
  const featured = withStatus.filter(
    ({ q, status }) =>
      kindOf(q) === 'monthly' &&
      ((q.month === currentMonth && status !== 'archived' && status !== 'expired') ||
        (q.month < currentMonth && status === 'active')),
  );
  const upcoming = withStatus.filter(({ status }) => status === 'upcoming');
  const long = withStatus.filter(({ q, status }) => kindOf(q) === 'long' && status === 'active');
  const expired = withStatus.filter(({ status }) => status === 'expired');
  const featuredIds = new Set(featured.map(({ q }) => q.id));
  const trophies = withStatus.filter(
    ({ q, status }) => (status === 'done' || status === 'archived') && !featuredIds.has(q.id),
  );
  const hasCurrentMonthly = featured.some(({ q }) => q.month === currentMonth);

  const addProgress = (e, id) => {
    e.preventDefault();
    const amount = Number(String(amounts[id] ?? '').replace(',', '.'));
    if (!amount) return;
    updateQuest(id, (q) => ({
      ...q,
      progress: Math.max(0, q.progress + amount),
      entries: [...(q.entries ?? []), { date: todayKey, amount }],
      completedAt:
        q.progress + amount >= q.target ? (q.completedAt ?? new Date().toISOString()) : null,
    }));
    setAmounts((prev) => ({ ...prev, [id]: '' }));
  };

  const toggleStep = (id, stepId) =>
    updateQuest(id, (q) => {
      const steps = q.steps.map((st) => (st.id === stepId ? { ...st, done: !st.done } : st));
      return {
        ...q,
        steps,
        completedAt: steps.every((st) => st.done) ? new Date().toISOString() : null,
      };
    });

  const startProlong = (q) =>
    setProlonging({
      id: q.id,
      // Un défi du mois gagne une semaine, un long terme un mois, modifiable
      date: shiftDateKey(todayKey > q.deadline ? todayKey : q.deadline, kindOf(q) === 'monthly' ? 7 : 30),
    });

  const confirmProlong = () => {
    updateQuest(prolonging.id, (q) => ({ ...q, deadline: prolonging.date, extended: true }));
    setProlonging(null);
  };

  const archive = (id) =>
    updateQuest(id, (q) => ({ ...q, archivedAt: new Date().toISOString() }));

  const renderEditBtn = (q) => (
    <button className="quests-edit" onClick={() => onEdit(q)} title="Modifier" aria-label="Modifier">
      ✎
    </button>
  );

  const renderAmount = (q) => (
    <>
      <div className="quests-progress">
        <div className="quests-progress-bar">
          <div
            className="quests-progress-fill"
            style={{ width: `${Math.min(100, (q.progress / q.target) * 100)}%` }}
          />
        </div>
        <span className="quests-progress-label">
          {fmt(q.progress)} / {fmt(q.target)} {q.unit}
        </span>
      </div>
      <form className="quests-amount-row" onSubmit={(e) => addProgress(e, q.id)}>
        <input
          className="quests-input quests-amount-input"
          inputMode="decimal"
          placeholder={`+ combien${q.unit ? ` (${q.unit})` : ''} ?`}
          value={amounts[q.id] ?? ''}
          onChange={(e) => setAmounts((prev) => ({ ...prev, [q.id]: e.target.value }))}
        />
        <button
          type="submit"
          className="quests-save-btn"
          disabled={!Number(String(amounts[q.id] ?? '').replace(',', '.'))}
        >
          Ajouter
        </button>
      </form>
    </>
  );

  const renderSteps = (q) => {
    const doneSteps = q.steps.filter((st) => st.done).length;
    return (
      <>
        <div className="quests-progress">
          <div className="quests-progress-bar">
            <div
              className="quests-progress-fill"
              style={{ width: `${(doneSteps / q.steps.length) * 100}%` }}
            />
          </div>
          <span className="quests-progress-label">
            {doneSteps}/{q.steps.length} étapes
          </span>
        </div>
        <ul className="challenge-steps">
          {q.steps.map((st) => (
            <li key={st.id}>
              <label className={`challenge-step${st.done ? ' done' : ''}`}>
                <input type="checkbox" checked={st.done} onChange={() => toggleStep(q.id, st.id)} />
                {st.label}
              </label>
            </li>
          ))}
        </ul>
      </>
    );
  };

  const renderChallenge = (q, status, { featuredCard = false } = {}) => (
    <li key={q.id} className={`quests-item${featuredCard ? ' challenge-featured' : ''}${status === 'done' ? ' done' : ''}`}>
      <div className="quests-item-head">
        <span className="quests-item-domain">{status === 'done' ? '🏆' : domainOf(q.domain).icon}</span>
        <span className="quests-item-label">{q.label}</span>
        {q.deadline && status !== 'done' && (
          <span className="quests-item-sub" title={`Échéance : ${formatDeadline(q.deadline)}`}>
            {kindOf(q) === 'long' ? `${formatDeadline(q.deadline)} · ` : ''}
            {countdown(q.deadline)}
            {q.extended && ' (prolongé)'}
          </span>
        )}
        {renderEditBtn(q)}
      </div>
      {status === 'done' && <div className="quests-item-sub quests-acquired">Réussi ✓</div>}
      {hasSteps(q) ? renderSteps(q) : status !== 'done' ? renderAmount(q) : null}
    </li>
  );

  return (
    <>
      {/* ── Défi du mois ── */}
      <section className="quests-section">
        <div className="quests-header">
          <h2 className="quests-title">⭐ Défi de {monthLabel(currentMonth)}</h2>
          {upcoming.length > 0 && (
            <span className="quests-count">
              À venir : {upcoming.map(({ q }) => `${monthLabel(q.month)}, ${q.label}`).join(' · ')}
            </span>
          )}
        </div>
        {featured.length > 0 ? (
          <ul className="quests-items">
            {featured.map(({ q, status }) => renderChallenge(q, status, { featuredCard: true }))}
          </ul>
        ) : null}
        {!hasCurrentMonthly && (
          <button className="quests-add-btn challenge-pick-btn" onClick={() => onNew('monthly')}>
            + Choisir le défi de {monthLabel(currentMonth)}
          </button>
        )}
      </section>

      {/* ── Échéances passées ── */}
      {expired.length > 0 && (
        <section className="quests-section">
          <div className="quests-header">
            <h2 className="quests-title">⏰ Échéance passée</h2>
          </div>
          <ul className="quests-items">
            {expired.map(({ q }) => (
              <li key={q.id} className="quests-item challenge-expired">
                <div className="quests-item-head">
                  <span className="quests-item-domain">{domainOf(q.domain).icon}</span>
                  <span className="quests-item-label">{q.label}</span>
                  <span className="quests-item-sub">{formatDeadline(q.deadline)}</span>
                </div>
                {prolonging?.id === q.id ? (
                  <div className="challenge-actions">
                    <input
                      type="date"
                      className="quests-input"
                      value={prolonging.date}
                      min={shiftDateKey(todayKey, 1)}
                      onChange={(e) => setProlonging({ ...prolonging, date: e.target.value })}
                    />
                    <button className="quests-save-btn" onClick={confirmProlong} disabled={!prolonging.date}>
                      Prolonger
                    </button>
                    <button className="quests-cancel-btn" onClick={() => setProlonging(null)}>
                      Annuler
                    </button>
                  </div>
                ) : (
                  <div className="challenge-actions">
                    <span className="quests-item-sub">
                      {q.extended ? 'Déjà prolongé une fois.' : 'Pas grave : on prolonge une fois, ou on archive.'}
                    </span>
                    {!q.extended && (
                      <button className="quests-save-btn" onClick={() => startProlong(q)}>
                        Prolonger
                      </button>
                    )}
                    <button className="quests-cancel-btn" onClick={() => archive(q.id)}>
                      Archiver
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Long terme ── */}
      <section className="quests-section">
        <div className="quests-header">
          <h2 className="quests-title">🏔️ Long terme</h2>
        </div>
        {long.length > 0 && (
          <ul className="quests-items">{long.map(({ q, status }) => renderChallenge(q, status))}</ul>
        )}
        {long.length + expired.filter(({ q }) => kindOf(q) === 'long').length < MAX_LONG ? (
          <button className="quests-add-btn challenge-pick-btn" onClick={() => onNew('long')}>
            + Challenge long terme
          </button>
        ) : (
          <p className="quests-cap">
            {MAX_LONG} challenges long terme en cours : termine ou archive-en un avant d’en lancer un autre.
          </p>
        )}
      </section>

      {/* ── Vitrine ── */}
      {trophies.length > 0 && (
        <section className="quests-section">
          <div className="quests-header">
            <h2 className="quests-title">🏆 Vitrine</h2>
            <span className="quests-count">
              {trophies.filter(({ status }) => status === 'done').length} réussi(s)
            </span>
          </div>
          <ul className="challenge-trophies">
            {trophies.map(({ q, status }) => (
              <li key={q.id} className={`challenge-trophy${status === 'done' ? ' done' : ''}`}>
                <span>{status === 'done' ? '🏆' : '🎗️'}</span>
                <span className="challenge-trophy-label">
                  {kindOf(q) === 'monthly' && q.month ? `${monthLabel(q.month)} · ` : ''}
                  {q.label}
                </span>
                <span className="quests-item-sub">{status === 'done' ? 'réussi' : 'tenté'}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
