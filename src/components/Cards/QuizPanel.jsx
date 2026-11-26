import { Brain, Check, ExternalLink, X } from 'lucide-react';
import { QUIZ_MIN_CARDS, QUIZ_PERFECT, QUIZ_REWARD, QUIZ_SIZE } from '../../data/wikiQuiz';

// questions : quizOf(today) ; answers : réponses du jour [{ id, ok }] ; onAnswer(index, card)
export default function QuizPanel({ questions, answers, board, xpMult, onAnswer }) {
  if (questions.length === 0) {
    return (
      <section className="quiz">
        <h3 className="quiz-title">
          <Brain size={16} aria-hidden="true" /> Quiz du jour
        </h3>
        <p className="quiz-empty">Le quiz commence dès {QUIZ_MIN_CARDS} cartes capturées avant aujourd’hui.</p>
      </section>
    );
  }
  const okCount = answers.filter((a) => a?.ok).length;
  const done = answers.filter(Boolean).length;

  return (
    <section className="quiz">
      <div className="quiz-head">
        <h3 className="quiz-title">
          <Brain size={16} aria-hidden="true" /> Quiz du jour
        </h3>
        <span className="quiz-score">
          {done < QUIZ_SIZE
            ? `${done}/${QUIZ_SIZE} · +${Math.round(QUIZ_REWARD.xp * xpMult)} XP par bonne réponse`
            : `${okCount}/${QUIZ_SIZE}${okCount === QUIZ_SIZE ? ` · parfait ! +${Math.round(QUIZ_PERFECT.xp * xpMult)} XP` : ''}`}
        </span>
      </div>
      <p className="quiz-hint">Retrouve l’article de ta collection d’après sa description (titre masqué).</p>
      <ol className="quiz-list">
        {questions.map((q) => {
          const a = answers[q.index];
          return (
            <li key={q.card.id} className={`quiz-q${a ? (a.ok ? ' ok' : ' ko') : ''}`}>
              <p className="quiz-clue">
                {q.clue.description && <strong>{q.clue.description}</strong>}
                {q.clue.description && q.clue.extract && ' — '}
                {q.clue.extract}
              </p>
              <div className="quiz-choices">
                {q.choices.map((c) => {
                  const right = c.id === q.card.id;
                  const picked = a?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      className={`quiz-choice${a && right ? ' right' : ''}${picked && !right ? ' wrong' : ''}`}
                      onClick={() => onAnswer(q.index, c, right)}
                      disabled={Boolean(a)}
                    >
                      {a && right && <Check size={13} aria-hidden="true" />}
                      {picked && !right && <X size={13} aria-hidden="true" />}
                      {c.title}
                    </button>
                  );
                })}
              </div>
              {a && (
                <a className="quiz-link" href={q.card.url} target="_blank" rel="noreferrer">
                  <ExternalLink size={12} aria-hidden="true" /> Relire « {q.card.title} »
                </a>
              )}
            </li>
          );
        })}
      </ol>
      <p className="quiz-total">
        {board.correct} bonne{board.correct > 1 ? 's' : ''} réponse{board.correct > 1 ? 's' : ''} · {board.perfect} quiz parfait
        {board.perfect > 1 ? 's' : ''}
      </p>
    </section>
  );
}
