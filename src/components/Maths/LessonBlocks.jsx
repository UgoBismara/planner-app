import { BLOCK_TYPES } from '../../data/maths';
import MathText from './MathText';

// Les blocs d'une fiche de cours : un encadré par type ; démonstrations et culture se
// déplient, pour qu'une fiche se lise d'abord en quelques minutes
export default function LessonBlocks({ blocks }) {
  return blocks.map((block, i) => {
    const type = BLOCK_TYPES.find((t) => t.id === block.type);
    const label = [type?.label, block.title].filter(Boolean).join(' · ');
    const className = `maths-block maths-block-${block.type}`;
    if (type?.collapsible) {
      return (
        <details key={i} className={className}>
          <summary className="maths-block-label">{label}</summary>
          <MathText>{block.body}</MathText>
        </details>
      );
    }
    return (
      <div key={i} className={className}>
        {label && <div className="maths-block-label">{label}</div>}
        <MathText>{block.body}</MathText>
      </div>
    );
  });
}
