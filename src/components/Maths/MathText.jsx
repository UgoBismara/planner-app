import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { katexOptions } from '../../data/maths/katex';

// Markdown avec du LaTeX : $…$ dans la ligne, $$ seul sur sa ligne pour une formule
// centrée. Une formule mal écrite s'affiche en rouge au lieu de tout casser.
const REMARK_PLUGINS = [remarkMath, remarkGfm];
const REHYPE_PLUGINS = [[rehypeKatex, katexOptions()]];

// En ligne (options de QCM dans un bouton) : pas de paragraphe
const INLINE_COMPONENTS = { p: ({ children }) => <span>{children}</span> };

export default function MathText({ children, inline = false }) {
  const Tag = inline ? 'span' : 'div';
  return (
    <Tag className={inline ? 'maths-text maths-text-inline' : 'maths-text'}>
      <Markdown
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={REHYPE_PLUGINS}
        components={inline ? INLINE_COMPONENTS : undefined}
      >
        {children}
      </Markdown>
    </Tag>
  );
}
