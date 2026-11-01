import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Dices,
  Eye,
  InfinityIcon,
  Info,
  Lightbulb,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  DRILL_TARGET,
  RESULTS,
  REVIEW_DELAYS,
  chapterById,
  resultLabel,
  sectionOf,
  shortDate,
} from '../../data/maths';
import { checkAnswer, formatHelp, placeholderOf } from '../../data/maths/answers';
import { makeRng, randomSeed } from '../../data/maths/random';
import { shiftDateKey } from '../../data/quests';
import ItemMeta, { StatusIcon } from './ItemMeta';
import LessonBlocks from './LessonBlocks';
import MathText from './MathText';

const FEEDBACK = {
  correct: 'Bonne réponse !',
  wrong: 'Pas tout à fait. Réessaie, ou prends un indice.',
};

const FEEDBACK_ICONS = { correct: Check, wrong: X, invalid: Info };

// Un exercice : énoncé, réponse (vérifiée quand elle est courte), indices un par un,
// rappel de cours, corrigé, puis le résultat noté par Ugo. Remonté par le parent
// (key) pour un nouvel exercice ou un nouvel énoncé tiré au hasard.
export default function ExerciseView({
  item,
  status,
  drill,
  todayKey,
  hasNext,
  backLabel,
  onBack,
  onRecord,
  onNext,
  onSurprise,
  onRenew,
}) {
  const [seed] = useState(() => randomSeed());
  const exercise = useMemo(
    () => (item.generated ? { ...item, ...item.generate(makeRng(seed)) } : item),
    [item, seed],
  );
  const { statement, answer, solution } = exercise;
  const hints = exercise.hints ?? [];
  const section = sectionOf(item);
  const chapter = chapterById(item.chapterId);

  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null); // { status, message? }
  const [wrong, setWrong] = useState(0);
  const [solved, setSolved] = useState(false);
  const [failed, setFailed] = useState(false); // vrai-faux raté : la réponse est connue
  const [eliminated, setEliminated] = useState([]); // options de QCM écartées
  const [hintsShown, setHintsShown] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);
  const [recallOpen, setRecallOpen] = useState(false);
  const [recorded, setRecorded] = useState(null);

  const closed = solved || failed;
  const revealed = closed || solutionShown;
  const canGrade = answer ? revealed : solutionShown;
  // Résultat proposé ; c'est toujours Ugo qui tranche
  let suggested = null;
  if (answer) suggested = solved ? (hintsShown === 0 && wrong === 0 ? 'solo' : 'aide') : 'rate';
  else if (hintsShown > 0) suggested = 'aide';

  const submit = (e) => {
    e.preventDefault();
    const result = checkAnswer(answer, input);
    setFeedback(result);
    if (result.status === 'correct') setSolved(true);
    if (result.status === 'wrong') setWrong((n) => n + 1);
  };

  const pick = (index) => {
    const result = checkAnswer(answer, index);
    setFeedback(result);
    if (result.status === 'correct') {
      setSolved(true);
    } else {
      setWrong((n) => n + 1);
      setEliminated((prev) => [...prev, index]);
    }
  };

  const answerTrueFalse = (value) => {
    const result = checkAnswer(answer, value);
    if (result.status === 'correct') {
      setSolved(true);
      setFeedback(result);
    } else {
      setFailed(true);
      setFeedback({ status: 'wrong', message: `C’était « ${answer.value ? 'Vrai' : 'Faux'} ». Le corrigé explique pourquoi.` });
    }
  };

  const record = (result) => {
    setRecorded(result);
    onRecord(result);
  };

  const renderAnswer = () => {
    if (!answer) return null;
    if (answer.type === 'choice') {
      return (
        <div className="maths-choices" role="group" aria-label="Choix de réponse">
          {answer.options.map((option, i) => {
            const isCorrect = revealed && i === answer.correct;
            const isWrong = eliminated.includes(i);
            return (
              <button
                key={i}
                type="button"
                className={`maths-choice${isCorrect ? ' correct' : ''}${isWrong ? ' wrong' : ''}`}
                disabled={revealed || isWrong}
                onClick={() => pick(i)}
              >
                <span className="maths-choice-letter">{'ABCDEF'[i]}</span>
                <MathText inline>{option}</MathText>
              </button>
            );
          })}
        </div>
      );
    }
    if (answer.type === 'truefalse') {
      return (
        <div className="maths-truefalse" role="group" aria-label="Vrai ou faux">
          {[true, false].map((value) => {
            const isCorrect = revealed && value === answer.value;
            return (
              <button
                key={String(value)}
                type="button"
                className={`maths-choice${isCorrect ? ' correct' : ''}`}
                disabled={revealed}
                onClick={() => answerTrueFalse(value)}
              >
                {value ? 'Vrai' : 'Faux'}
              </button>
            );
          })}
        </div>
      );
    }
    if (revealed) return null;
    return (
      <form className="maths-answer" onSubmit={submit}>
        <label className="maths-answer-label" htmlFor="maths-answer-input">
          Ta réponse
        </label>
        <div className="maths-answer-row">
          {/* Champ texte : le pavé numérique d'iOS n'a pas de signe moins */}
          <input
            id="maths-answer-input"
            className="maths-input"
            value={input}
            placeholder={placeholderOf(answer)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            onChange={(e) => {
              setInput(e.target.value);
              if (feedback?.status === 'invalid') setFeedback(null);
            }}
          />
          <button type="submit" className="maths-primary-btn" disabled={!input.trim()}>
            Vérifier
          </button>
        </div>
        <p className="maths-answer-help">{formatHelp(answer)}</p>
      </form>
    );
  };

  const FeedbackIcon = feedback ? FEEDBACK_ICONS[feedback.status] : null;

  const afterText = () => {
    if (item.generated) {
      if (!drill) return null;
      if (drill.validated) return `Entraînement validé, ${drill.solo} réussite${drill.solo > 1 ? 's' : ''} en tout.`;
      return recorded === 'solo'
        ? `Série en cours : ${drill.run}/${DRILL_TARGET} réussites d’affilée pour valider l’entraînement.`
        : `La série repart de zéro : ${DRILL_TARGET} réussites d’affilée valident l’entraînement.`;
    }
    if (recorded === 'solo') return 'Exercice validé.';
    return `Il reviendra le ${shortDate(shiftDateKey(todayKey, REVIEW_DELAYS[recorded]))} pour une revanche.`;
  };

  return (
    <div className="maths-exercise">
      <button type="button" className="maths-back" onClick={onBack}>
        <ArrowLeft size={16} aria-hidden="true" />
        {backLabel}
      </button>

      <header className="maths-ex-head">
        <p className="maths-ex-chapter">
          {chapter.title}
          {section && ` · ${section.title}`}
        </p>
        <h2 className="maths-ex-title">{item.title}</h2>
        <ItemMeta item={item}>
          {item.generated && (
            <span className="maths-meta-drill">
              <InfinityIcon size={13} aria-hidden="true" />
              {drill?.validated ? 'validé' : `${drill?.run ?? 0}/${DRILL_TARGET}`}
            </span>
          )}
          {!item.generated && status !== 'new' && <StatusIcon status={status} size={15} />}
        </ItemMeta>
      </header>

      <section className="maths-card maths-statement">
        <MathText>{statement}</MathText>
      </section>

      {section && (
        <div className="maths-recall">
          <button
            type="button"
            className="maths-link-btn"
            onClick={() => setRecallOpen((open) => !open)}
            aria-expanded={recallOpen}
          >
            <BookOpen size={15} aria-hidden="true" />
            Rappel de cours : {section.title}
          </button>
          {recallOpen && (
            <div className="maths-card maths-recall-body">
              <LessonBlocks blocks={section.blocks} />
            </div>
          )}
        </div>
      )}

      {renderAnswer()}

      {feedback && (
        <p className={`maths-feedback ${feedback.status}`} role="status">
          <FeedbackIcon size={16} aria-hidden="true" />
          <span>
            {feedback.message ?? FEEDBACK[feedback.status]}
            {feedback.status === 'correct' && input && ` (${input.trim()})`}
          </span>
        </p>
      )}

      {hints.length > 0 && (
        <div className="maths-hints">
          {hints.slice(0, hintsShown).map((hint, i) => (
            <div key={i} className="maths-hint-card">
              <span className="maths-hint-label">
                <Lightbulb size={14} aria-hidden="true" />
                Indice {i + 1}
              </span>
              <MathText>{hint}</MathText>
            </div>
          ))}
          {hintsShown < hints.length && !revealed && (
            <button type="button" className="maths-ghost-btn" onClick={() => setHintsShown((n) => n + 1)}>
              <Lightbulb size={15} aria-hidden="true" />
              {hintsShown === 0 ? 'Un indice' : 'Un autre indice'} ({hintsShown + 1}/{hints.length})
            </button>
          )}
        </div>
      )}

      {solutionShown ? (
        <section className="maths-card maths-solution">
          <h3 className="maths-card-title">Corrigé</h3>
          <MathText>{solution}</MathText>
        </section>
      ) : (
        <button type="button" className="maths-ghost-btn maths-solution-btn" onClick={() => setSolutionShown(true)}>
          <Eye size={15} aria-hidden="true" />
          Voir le corrigé
        </button>
      )}

      {canGrade && !recorded && (
        <section className="maths-grade">
          <p className="maths-grade-question">
            {answer ? 'Tu notes ça comment ?' : 'Compare avec le corrigé : comment ça s’est passé ?'}
          </p>
          <div className="maths-grade-buttons">
            {RESULTS.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`maths-grade-btn ${r.id}${suggested === r.id ? ' suggested' : ''}`}
                onClick={() => record(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {recorded && (
        <section className="maths-after">
          <p className="maths-after-text">
            <strong>{resultLabel(recorded)}.</strong> {afterText()}
          </p>
          <div className="maths-after-actions">
            {item.generated && (
              <button type="button" className="maths-primary-btn" onClick={onRenew}>
                <RefreshCw size={15} aria-hidden="true" />
                Nouvel énoncé
              </button>
            )}
            {hasNext && (
              <button
                type="button"
                className={item.generated ? 'maths-ghost-btn' : 'maths-primary-btn'}
                onClick={onNext}
              >
                Exercice suivant
                <ChevronRight size={15} aria-hidden="true" />
              </button>
            )}
            <button type="button" className="maths-ghost-btn" onClick={onSurprise}>
              <Dices size={15} aria-hidden="true" />
              Surprends-moi
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
