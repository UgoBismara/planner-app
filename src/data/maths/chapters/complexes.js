// Chapitre « Nombres complexes » : de la forme algébrique (Tle maths expertes) aux
// racines de l'unité et à la géométrie (L1). Réponses recalculées par script.
import { md, paren, texAngle, texComplex, texComplexParen } from '../helpers.js';

const raw = String.raw;

const lesson = [
  {
    id: 'algebrique',
    title: 'Forme algébrique et conjugué',
    level: 'Tle',
    blocks: [
      {
        type: 'texte',
        body: md`Au XVIe siècle, des mathématiciens italiens résolvent les équations du troisième
          degré et tombent sur des racines carrées de nombres négatifs… qui disparaissent à la fin
          du calcul pour donner des solutions bien réelles. Les nombres complexes sont nés de ces
          « quantités impossibles ».`,
      },
      {
        type: 'definition',
        body: md`Il existe un ensemble $\C$ contenant $\R$, muni d’une addition et d’une
          multiplication qui prolongent celles de $\R$, et un nombre $i$ tel que $i^2 = -1$. Tout
          $z \in \C$ s’écrit de manière unique $z = a + ib$ avec $a, b \in \R$ : c’est sa **forme
          algébrique**, $a = \Re(z)$ est sa partie réelle et $b = \Im(z)$ sa partie imaginaire.`,
      },
      {
        type: 'definition',
        title: 'Conjugué',
        body: md`Le conjugué de $z = a + ib$ est $\overline{z} = a - ib$. Le point d’affixe
          $\overline{z}$ est le symétrique de celui d’affixe $z$ par rapport à l’axe des réels.`,
      },
      {
        type: 'propriete',
        body: md`$\overline{z + z'} = \overline{z} + \overline{z'}$, $\overline{zz'} = \overline{z}\,\overline{z'}$,
          $\overline{\left(z / z'\right)} = \overline{z} / \overline{z'}$, et

          $$
          \begin{gathered}
          z\overline{z} = a^2 + b^2 \in \R_+, \\
          \Re(z) = \frac{z + \overline{z}}{2}, \quad \Im(z) = \frac{z - \overline{z}}{2i}.
          \end{gathered}
          $$

          $z$ est réel si et seulement si $\overline{z} = z$, imaginaire pur si et seulement si
          $\overline{z} = -z$.`,
      },
      {
        type: 'methode',
        title: 'Calculer un quotient',
        body: md`On multiplie le numérateur et le dénominateur par le conjugué du dénominateur, qui
          devient réel :

          $$
          \begin{aligned}
          \frac{3 + i}{1 - 2i} &= \frac{(3 + i)(1 + 2i)}{(1 - 2i)(1 + 2i)} \\
          &= \frac{3 + 6i + i + 2i^2}{1 + 4} = \frac{1 + 7i}{5}.
          \end{aligned}
          $$`,
      },
      {
        type: 'piege',
        title: 'Pas de racine carrée de −1',
        body: md`Écrire $\sqrt{-1}$ mène à des absurdités :
          $-1 = i \times i = \sqrt{-1} \times \sqrt{-1} = \sqrt{(-1)(-1)} = \sqrt{1} = 1$. La règle
          $\sqrt{a}\sqrt{b} = \sqrt{ab}$ ne vaut que pour $a, b \ge 0$, et le symbole $\sqrt{\ }$ est
          réservé aux réels positifs. De même, il n’y a pas d’ordre sur $\C$ compatible avec les
          opérations : « $z < z'$ » n’a pas de sens.`,
      },
      {
        type: 'histoire',
        body: md`En 1572, Bombelli résout $x^3 = 15x + 4$ par la formule de Cardan et obtient
          $x = \sqrt[3]{2 + \sqrt{-121}} + \sqrt[3]{2 - \sqrt{-121}}$. En calculant avec ces nombres
          « impossibles », il trouve $(2 \pm \sqrt{-1})^3 = 2 \pm \sqrt{-121}$, donc
          $x = (2 + \sqrt{-1}) + (2 - \sqrt{-1}) = 4$, qui est bien solution. La notation $i$ est due
          à Euler (1777), et l’interprétation géométrique à Wessel, Argand et Gauss, vers 1800.`,
      },
    ],
  },
  {
    id: 'module-argument',
    title: 'Module, argument, forme exponentielle',
    level: 'Tle',
    blocks: [
      {
        type: 'definition',
        body: md`Le **module** de $z = a + ib$ est $|z| = \sqrt{a^2 + b^2} = \sqrt{z\overline{z}}$ :
          c’est la distance de l’origine au point $M$ d’affixe $z$. Si $z \ne 0$, un **argument** de
          $z$ est une mesure $\theta$ de l’angle $(\vec{u}, \overrightarrow{OM})$. Il est défini à
          $2\pi$ près, ce qu’on note $\arg z \equiv \theta \ [2\pi]$.`,
      },
      {
        type: 'definition',
        title: 'Forme exponentielle',
        body: md`Pour $\theta \in \R$, on pose $e^{i\theta} = \cos\theta + i\sin\theta$. Tout
          complexe non nul s’écrit $z = re^{i\theta}$, avec $r = |z| > 0$ et $\theta$ un argument
          de $z$.`,
      },
      {
        type: 'propriete',
        body: md`$e^{i\theta} e^{i\theta'} = e^{i(\theta + \theta')}$ : ce sont les formules
          d’addition du cosinus et du sinus. Par conséquent,

          $$
          \begin{gathered}
          |zz'| = |z|\,|z'|, \\
          \arg(zz') \equiv \arg z + \arg z' \ [2\pi], \\
          \arg \overline{z} \equiv -\arg z \ [2\pi].
          \end{gathered}
          $$

          Enfin, l’**inégalité triangulaire** : $|z + z'| \le |z| + |z'|$.`,
      },
      {
        type: 'methode',
        title: 'Trouver le module et un argument',
        body: md`On calcule $r = |z|$, puis on cherche $\theta$ tel que $\cos\theta = \frac{a}{r}$ et
          $\sin\theta = \frac{b}{r}$. Pour $z = 1 - i\sqrt{3}$ : $r = \sqrt{1 + 3} = 2$,
          $\cos\theta = \frac{1}{2}$ et $\sin\theta = -\frac{\sqrt{3}}{2}$, donc
          $\theta \equiv -\frac{\pi}{3} \ [2\pi]$ et $z = 2e^{-i\pi/3}$.`,
      },
      {
        type: 'piege',
        title: 'L’arctangente ne suffit pas',
        body: md`On a bien $\tan\theta = \frac{b}{a}$, mais $\theta = \arctan\frac{b}{a}$ seulement si
          $a > 0$. Pour $z = -1 - i$ : $\arctan(1) = \frac{\pi}{4}$, alors que
          $\arg z \equiv -\frac{3\pi}{4} \ [2\pi]$ (le point est en bas à gauche).`,
      },
      {
        type: 'histoire',
        body: md`L’écriture $e^{i\theta}$ vient d’Euler (1748), le mot « module » d’Argand et la
          notation $|z|$ de Weierstrass. Le plan complexe, souvent attribué à Gauss, avait été décrit
          dès 1797 par l’arpenteur norvégien Caspar Wessel, dans un mémoire resté inaperçu pendant un
          siècle.`,
      },
    ],
  },
  {
    id: 'euler-moivre',
    title: 'Formules d’Euler et de Moivre',
    level: 'Tle',
    blocks: [
      {
        type: 'theoreme',
        title: 'Formule de Moivre',
        body: md`Pour tout $\theta \in \R$ et tout $n \in \Z$ :

          $$
          \begin{gathered}
          \left(e^{i\theta}\right)^n = e^{in\theta}, \quad \text{c’est-à-dire} \\
          (\cos\theta + i\sin\theta)^n = \cos n\theta + i\sin n\theta.
          \end{gathered}
          $$`,
      },
      {
        type: 'theoreme',
        title: 'Formules d’Euler',
        body: md`$$
          \cos\theta = \frac{e^{i\theta} + e^{-i\theta}}{2}, \qquad \sin\theta = \frac{e^{i\theta} - e^{-i\theta}}{2i}.
          $$`,
      },
      {
        type: 'methode',
        title: 'Développer avec Moivre',
        body: md`Pour exprimer $\cos(3\theta)$ en fonction de $\cos\theta$, on développe
          $(\cos\theta + i\sin\theta)^3$ et on garde la partie réelle :

          $$
          \begin{aligned}
          \cos(3\theta) &= \cos^3\theta - 3\cos\theta\sin^2\theta \\
          &= 4\cos^3\theta - 3\cos\theta.
          \end{aligned}
          $$`,
      },
      {
        type: 'methode',
        title: 'Linéariser avec Euler',
        body: md`Pour écrire une puissance de $\cos$ ou de $\sin$ comme une somme de $\cos(k\theta)$
          et $\sin(k\theta)$, bien plus facile à intégrer, on remplace par les formules d’Euler, on
          développe avec le binôme, puis on regroupe les termes conjugués :

          $$
          \begin{aligned}
          \sin^2\theta &= \left(\frac{e^{i\theta} - e^{-i\theta}}{2i}\right)^2 \\
          &= \frac{e^{2i\theta} - 2 + e^{-2i\theta}}{-4} = \frac{1 - \cos(2\theta)}{2}.
          \end{aligned}
          $$`,
      },
      {
        type: 'methode',
        title: 'L’angle moitié',
        body: md`Pour une somme de deux exponentielles, on factorise par l’angle moyen :

          $$
          \begin{aligned}
          e^{ia} + e^{ib} &= e^{i\frac{a + b}{2}}\left(e^{i\frac{a - b}{2}} + e^{-i\frac{a - b}{2}}\right) \\
          &= 2\cos\left(\frac{a - b}{2}\right) e^{i\frac{a + b}{2}}.
          \end{aligned}
          $$

          Par exemple $1 + e^{i\theta} = 2\cos\left(\frac{\theta}{2}\right) e^{i\theta/2}$ : on lit
          directement le module et un argument, au signe du cosinus près.`,
      },
      {
        type: 'histoire',
        body: md`Avec $\theta = \pi$, la forme exponentielle donne $e^{i\pi} + 1 = 0$, qui relie cinq
          constantes fondamentales. Abraham de Moivre, huguenot réfugié à Londres et ami de Newton,
          gagnait sa vie comme précepteur et en conseillant joueurs et assureurs dans les cafés ; on
          lui doit aussi la première version du théorème central limite (1733).`,
      },
    ],
  },
  {
    id: 'equations',
    title: 'Équations et racines carrées',
    level: 'Tle',
    blocks: [
      {
        type: 'theoreme',
        title: 'Second degré à coefficients réels',
        body: md`Soit $az^2 + bz + c = 0$ avec $a, b, c$ réels, $a \ne 0$, et $\Delta = b^2 - 4ac$. Si
          $\Delta < 0$, l’équation a deux solutions complexes conjuguées :

          $$
          z = \frac{-b \pm i\sqrt{-\Delta}}{2a}.
          $$`,
      },
      {
        type: 'propriete',
        title: 'Coefficients complexes (L1)',
        body: md`Si $a, b, c \in \C$, la même formule marche avec $\delta$ à la place de
          $\sqrt{\Delta}$, où $\delta$ est **une** racine carrée de $\Delta$ ($\delta^2 = \Delta$) :
          $z = \frac{-b \pm \delta}{2a}$. On a toujours $z_1 + z_2 = -\frac{b}{a}$ et
          $z_1 z_2 = \frac{c}{a}$.`,
      },
      {
        type: 'methode',
        title: 'Racines carrées de a + ib',
        body: md`On cherche $\delta = x + iy$ avec $\delta^2 = a + ib$. En identifiant, et en ajoutant
          l’égalité des modules $|\delta|^2 = |a + ib|$ :

          $$
          \begin{cases} x^2 - y^2 = a \\ x^2 + y^2 = \sqrt{a^2 + b^2} \\ 2xy = b \end{cases}
          $$

          Les deux premières donnent $x^2$ et $y^2$, la troisième le signe de $xy$. Pour
          $5 - 12i$ : $x^2 - y^2 = 5$ et $x^2 + y^2 = 13$, donc $x^2 = 9$ et $y^2 = 4$, avec $xy < 0$ :
          $\delta = \pm(3 - 2i)$.`,
      },
      {
        type: 'theoreme',
        title: 'd’Alembert-Gauss (L1)',
        body: md`Tout polynôme non constant à coefficients complexes a au moins une racine dans $\C$.
          Par conséquent, un polynôme de degré $n$ se factorise sur $\C$ en $n$ facteurs de degré $1$.`,
      },
      {
        type: 'propriete',
        title: 'Coefficients réels',
        body: md`Si $P$ est à coefficients réels et $P(z_0) = 0$, alors
          $P(\overline{z_0}) = \overline{P(z_0)} = 0$ : les racines non réelles vont par paires
          conjuguées.`,
      },
      {
        type: 'methode',
        title: 'Racine évidente',
        body: md`Si $z_0$ est racine de $P$, on factorise $P(z) = (z - z_0)Q(z)$ avec
          $\deg Q = \deg P - 1$, par identification des coefficients ou division euclidienne. On teste
          d’abord $0, \pm 1, \pm 2, \pm i, \ldots$`,
      },
      {
        type: 'piege',
        title: 'Le symbole √Δ',
        body: md`Quand $\Delta$ n’est pas un réel positif, $\sqrt{\Delta}$ n’a pas de sens : $\Delta$ a
          deux racines carrées opposées, on en choisit une, $\delta$. Le choix ne change pas la paire
          de solutions.`,
      },
      {
        type: 'histoire',
        body: md`Le théorème de d’Alembert-Gauss est aussi appelé « théorème fondamental de
          l’algèbre ». D’Alembert en publie une preuve incomplète en 1746, Gauss une autre dans sa
          thèse en 1799 (avec une lacune comblée bien plus tard), Argand une preuve presque complète
          en 1806. Ironie de l’histoire : toutes les preuves connues utilisent un peu d’analyse.`,
      },
    ],
  },
  {
    id: 'racines-unite',
    title: 'Racines n-ièmes de l’unité',
    level: 'Tle',
    blocks: [
      {
        type: 'definition',
        body: md`Pour $n \ge 1$, les racines $n$-ièmes de l’unité sont les solutions de $z^n = 1$. Il
          y en a exactement $n$ ; avec $\omega = e^{2i\pi/n}$,

          $$
          \begin{aligned}
          \U_n &= \left\{ e^{2ik\pi/n} : k \in \llbracket 0, n - 1 \rrbracket \right\} \\
          &= \{1, \omega, \omega^2, \ldots, \omega^{n-1}\}.
          \end{aligned}
          $$

          Leurs images sont les sommets d’un polygone régulier à $n$ côtés inscrit dans le cercle
          unité.`,
      },
      {
        type: 'demo',
        body: md`Si $z^n = 1$, alors $|z|^n = 1$ donc $|z| = 1$, et $z = e^{i\theta}$ avec
          $e^{in\theta} = 1$, c’est-à-dire $n\theta \in 2\pi\Z$ : $\theta = \frac{2k\pi}{n}$,
          $k \in \Z$. Deux valeurs de $k$ donnent le même nombre si et seulement si elles sont
          congrues modulo $n$, d’où les $n$ racines distinctes obtenues pour $k = 0, \ldots, n - 1$.`,
      },
      {
        type: 'propriete',
        title: 'Somme nulle',
        body: md`Pour $n \ge 2$ : $1 + \omega + \omega^2 + \cdots + \omega^{n-1} = 0$.`,
      },
      {
        type: 'demo',
        body: md`C’est une somme géométrique de raison $\omega \ne 1$ : elle vaut
          $\frac{1 - \omega^n}{1 - \omega} = 0$, puisque $\omega^n = 1$.`,
      },
      {
        type: 'methode',
        title: 'Racines n-ièmes d’un complexe',
        body: md`Les solutions de $z^n = a$, avec $a = \rho e^{i\alpha} \ne 0$, sont les $n$ nombres

          $$
          z_k = \rho^{1/n} e^{i\frac{\alpha + 2k\pi}{n}}, \qquad k \in \llbracket 0, n - 1 \rrbracket,
          $$

          autrement dit une solution particulière multipliée par les racines $n$-ièmes de l’unité.`,
      },
      {
        type: 'exemple',
        title: 'Le nombre j',
        body: md`Pour $n = 3$, on note $j = e^{2i\pi/3} = -\frac{1}{2} + i\frac{\sqrt{3}}{2}$. Alors
          $\U_3 = \{1, j, j^2\}$, $j^3 = 1$, $1 + j + j^2 = 0$ et $\overline{j} = j^2$.`,
      },
      {
        type: 'histoire',
        body: md`En 1796, à 19 ans, Gauss montre que $\cos\frac{2\pi}{17}$ s’écrit avec des racines
          carrées imbriquées : le polygone régulier à $17$ côtés est donc constructible à la règle et
          au compas, une question restée ouverte depuis les Grecs. Il en était si fier qu’il aurait
          voulu un heptadécagone gravé sur sa tombe.`,
      },
    ],
  },
  {
    id: 'geometrie',
    title: 'Complexes et géométrie',
    level: 'Tle',
    blocks: [
      {
        type: 'propriete',
        title: 'Distances et angles',
        body: md`Si $A$, $B$, $C$ ont pour affixes $a$, $b$, $c$, avec $A \ne B$ et $A \ne C$ :

          $$
          \begin{gathered}
          AB = |b - a|, \\
          (\overrightarrow{AB}, \overrightarrow{AC}) \equiv \arg\left(\frac{c - a}{b - a}\right) \ [2\pi].
          \end{gathered}
          $$`,
      },
      {
        type: 'propriete',
        title: 'Alignement et orthogonalité',
        body: md`$A$, $B$, $C$ sont alignés si et seulement si $\frac{c - a}{b - a}$ est réel ;
          $(AB) \perp (AC)$ si et seulement si ce quotient est imaginaire pur.`,
      },
      {
        type: 'definition',
        title: 'Transformations',
        body: md`- translation de vecteur d’affixe $t$ : $z \mapsto z + t$ ;
          - homothétie de centre $\Omega(\omega)$ et de rapport $k \in \R^*$ : $z' - \omega = k(z - \omega)$ ;
          - rotation de centre $\Omega(\omega)$ et d’angle $\theta$ : $z' - \omega = e^{i\theta}(z - \omega)$ ;
          - plus généralement, $z \mapsto az + b$ avec $a \in \C^*$ est une **similitude directe** :
            elle multiplie les distances par $|a|$ et ajoute $\arg a$ aux angles de direction.`,
      },
      {
        type: 'methode',
        title: 'Reconnaître un triangle',
        body: md`$ABC$ est rectangle isocèle en $A$ si et seulement si $\frac{c - a}{b - a} = \pm i$,
          et équilatéral si et seulement si $\frac{c - a}{b - a} = e^{\pm i\pi/3}$ ; le signe donne le
          sens de parcours.`,
      },
      {
        type: 'exemple',
        body: md`La rotation de centre $O$ et d’angle $\frac{\pi}{2}$ est $z \mapsto iz$ : elle envoie
          $1$ sur $i$, et $2 + i$ sur $-1 + 2i$.`,
      },
      {
        type: 'piege',
        title: 'L’ordre dans le quotient',
        body: md`$\arg\frac{c - a}{b - a}$ mesure l’angle orienté **de** $\overrightarrow{AB}$ **vers**
          $\overrightarrow{AC}$. Inverser le quotient change le signe de l’angle, donc le sens de
          rotation.`,
      },
      {
        type: 'histoire',
        body: md`En 1872, Felix Klein propose dans son « programme d’Erlangen » de définir une
          géométrie par son groupe de transformations. Dans le plan, les similitudes directes
          $z \mapsto az + b$ en sont l’exemple le plus simple : c’est la géométrie des figures « à la
          même forme ».`,
      },
    ],
  },
];

const exercises = [
  {
    id: 'cplx-puissance-1-plus-i',
    section: 'module-argument',
    title: '(1 + i) puissance 10',
    difficulty: 1,
    level: 'Tle',
    kind: 'calcul',
    statement: md`Écrire $(1 + i)^{10}$ sous forme algébrique.`,
    hints: [md`Calcule d’abord $(1 + i)^2$.`, md`$(1 + i)^2 = 2i$.`],
    answer: { type: 'complex', value: { re: 0, im: 32 } },
    solution: md`**Par la forme algébrique.** $(1 + i)^2 = 1 + 2i + i^2 = 2i$, donc

      $$
      (1 + i)^{10} = \left((1 + i)^2\right)^5 = (2i)^5 = 32\, i^5 = 32i,
      $$

      car $i^4 = 1$, donc $i^5 = i$.

      **Par la forme exponentielle.** $1 + i = \sqrt{2}\, e^{i\pi/4}$, donc
      $(1 + i)^{10} = (\sqrt{2})^{10} e^{10i\pi/4} = 32\, e^{5i\pi/2} = 32\, e^{i\pi/2} = 32i$.

      Réponse : $\mathbf{32i}$.`,
  },
  {
    id: 'cplx-quotient',
    section: 'algebrique',
    title: 'Un quotient',
    difficulty: 1,
    level: 'Tle',
    kind: 'calcul',
    statement: md`Écrire sous forme algébrique $z = \dfrac{7 + i}{1 - i}$.`,
    hints: [md`Multiplie le numérateur et le dénominateur par le conjugué du dénominateur.`],
    answer: { type: 'complex', value: { re: 3, im: 4 } },
    solution: md`On multiplie par le conjugué $1 + i$ du dénominateur :

      $$
      \begin{aligned}
      z &= \frac{(7 + i)(1 + i)}{(1 - i)(1 + i)} = \frac{7 + 7i + i + i^2}{1 + 1} \\
      &= \frac{6 + 8i}{2} = 3 + 4i.
      \end{aligned}
      $$

      Vérification : $(3 + 4i)(1 - i) = 3 - 3i + 4i - 4i^2 = 7 + i$.`,
  },
  {
    id: 'cplx-qcm-module-argument',
    section: 'module-argument',
    title: 'Module et argument de −√3 + i',
    difficulty: 1,
    level: 'Tle',
    kind: 'qcm',
    statement: md`Quels sont le module et un argument de $z = -\sqrt{3} + i$ ?`,
    hints: [
      md`$|z| = \sqrt{a^2 + b^2}$. Pour l’argument, regarde le signe de la partie réelle avant de te
        fier à une tangente.`,
    ],
    answer: {
      type: 'choice',
      options: [
        md`$|z| = 2$ et $\arg z = -\frac{\pi}{6}$`,
        md`$|z| = 2$ et $\arg z = \frac{2\pi}{3}$`,
        md`$|z| = 2$ et $\arg z = \frac{5\pi}{6}$`,
        md`$|z| = 4$ et $\arg z = \frac{5\pi}{6}$`,
      ],
      correct: 2,
    },
    solution: md`$|z| = \sqrt{3 + 1} = 2$. On cherche $\theta$ avec $\cos\theta = -\frac{\sqrt{3}}{2}$ et
      $\sin\theta = \frac{1}{2}$ : le point est en haut à gauche, et
      $\theta \equiv \frac{5\pi}{6} \ [2\pi]$. Donc $z = 2e^{5i\pi/6}$.

      Piège : $\tan\theta = -\frac{1}{\sqrt{3}}$ conduit à $\arctan\left(-\frac{1}{\sqrt{3}}\right) = -\frac{\pi}{6}$,
      qui est un argument de $-z = \sqrt{3} - i$, pas de $z$. L’arctangente ne donne le bon angle
      que si la partie réelle est positive.`,
  },
  {
    id: 'cplx-vf-inverse-conjugue',
    section: 'algebrique',
    title: 'Inverse d’un complexe de module 1',
    difficulty: 1,
    level: 'Tle',
    kind: 'vrai-faux',
    statement: md`Vrai ou faux : si $|z| = 1$, alors $\dfrac{1}{z} = \overline{z}$.`,
    hints: [md`Que vaut $z\overline{z}$ ?`],
    answer: { type: 'truefalse', value: true },
    solution: md`**Vrai.** On a $z\overline{z} = |z|^2 = 1$, donc $z \ne 0$ et $\overline{z} = \frac{1}{z}$.

      En forme exponentielle : $z = e^{i\theta}$ et $\frac{1}{z} = e^{-i\theta} = \overline{z}$. Sur le
      cercle unité, inverser revient donc à prendre le symétrique par rapport à l’axe réel.`,
  },
  {
    id: 'cplx-equation-cubique',
    section: 'equations',
    title: 'Une équation de degré 3',
    difficulty: 2,
    level: 'Tle',
    kind: 'calcul',
    statement: md`Résoudre dans $\C$ l’équation $z^3 - 3z^2 + 7z - 5 = 0$.`,
    hints: [
      md`Cherche une racine évidente parmi $0$, $\pm 1$ et $\pm 5$.`,
      md`$1$ est racine : factorise par $z - 1$.`,
    ],
    answer: {
      type: 'complexes',
      values: [
        { re: 1, im: 0 },
        { re: 1, im: 2 },
        { re: 1, im: -2 },
      ],
    },
    solution: md`$1 - 3 + 7 - 5 = 0$ : $1$ est racine. On cherche
      $z^3 - 3z^2 + 7z - 5 = (z - 1)(z^2 + bz + c)$. En développant, le membre de droite vaut
      $z^3 + (b - 1)z^2 + (c - b)z - c$ ; on identifie : $b - 1 = -3$ et $c = 5$, donc $b = -2$, et le
      terme en $z$ est bien $c - b = 7$. Ainsi

      $$
      z^3 - 3z^2 + 7z - 5 = (z - 1)(z^2 - 2z + 5).
      $$

      Pour $z^2 - 2z + 5$ : $\Delta = 4 - 20 = -16 = (4i)^2$, d’où $z = \frac{2 \pm 4i}{2} = 1 \pm 2i$.

      Les solutions sont $\mathbf{1}$, $\mathbf{1 + 2i}$ et $\mathbf{1 - 2i}$ : les racines non
      réelles sont conjuguées, comme prévu pour des coefficients réels.`,
  },
  {
    id: 'cplx-lineariser-cos3',
    section: 'euler-moivre',
    title: 'Linéariser cos³ pour intégrer',
    difficulty: 2,
    level: 'Tle',
    kind: 'calcul',
    statement: md`1. Linéariser $\cos^3 x$, c’est-à-dire l’écrire comme combinaison de $\cos x$ et de
         $\cos(3x)$.
      2. En déduire la valeur de $I = \displaystyle\int_0^{\pi/2} \cos^3 x \, dx$ (valeur exacte, ou
         approchée à $10^{-3}$ près).`,
    hints: [
      md`Écris $\cos x = \frac{e^{ix} + e^{-ix}}{2}$ et développe le cube avec le binôme.`,
      md`Tu dois trouver $\cos^3 x = \frac{\cos(3x) + 3\cos x}{4}$.`,
    ],
    answer: { type: 'number', value: 2 / 3 },
    solution: md`**1.** Par la formule d’Euler et le binôme :

      $$
      \begin{aligned}
      \cos^3 x &= \frac{\left(e^{ix} + e^{-ix}\right)^3}{8} \\
      &= \frac{e^{3ix} + 3e^{ix} + 3e^{-ix} + e^{-3ix}}{8} \\
      &= \frac{2\cos(3x) + 6\cos x}{8},
      \end{aligned}
      $$

      soit $\cos^3 x = \dfrac{\cos(3x) + 3\cos x}{4}$.

      **2.** On intègre terme à terme :

      $$
      \begin{aligned}
      I &= \frac{1}{4}\left[\frac{\sin(3x)}{3} + 3\sin x\right]_0^{\pi/2} \\
      &= \frac{1}{4}\left(-\frac{1}{3} + 3\right) = \frac{1}{4} \times \frac{8}{3} = \frac{2}{3}.
      \end{aligned}
      $$

      Réponse : $I = \dfrac{2}{3} \approx 0{,}667$.`,
  },
  {
    id: 'cplx-vf-produit-racines',
    section: 'racines-unite',
    title: 'Le produit des racines n-ièmes',
    difficulty: 2,
    level: 'L1',
    kind: 'vrai-faux',
    statement: md`Vrai ou faux : pour tout entier $n \ge 2$, le produit des $n$ racines $n$-ièmes de
      l’unité vaut $1$.`,
    hints: [md`Teste avec $n = 2$.`],
    answer: { type: 'truefalse', value: false },
    solution: md`**Faux.** Pour $n = 2$, les racines carrées de l’unité sont $1$ et $-1$, de produit $-1$.

      En général, avec $\omega = e^{2i\pi/n}$ :

      $$
      \begin{aligned}
      \prod_{k=0}^{n-1} \omega^k &= \omega^{0 + 1 + \cdots + (n - 1)} = \omega^{\frac{n(n-1)}{2}} \\
      &= e^{i\pi(n - 1)} = (-1)^{n-1}.
      \end{aligned}
      $$

      Le produit vaut $1$ si $n$ est impair et $-1$ si $n$ est pair. On le retrouve aussi avec le
      coefficient constant de $z^n - 1 = \prod_k (z - \omega^k)$.`,
  },
  {
    id: 'cplx-code-points-disque',
    section: 'module-argument',
    title: 'Points entiers dans un disque',
    difficulty: 2,
    level: 'L1',
    kind: 'code',
    statement: md`Combien y a-t-il de complexes $z = a + ib$, avec $a$ et $b$ entiers, tels que
      $|z| \le 30$ ?`,
    hints: [
      md`$|z| \le 30 \iff a^2 + b^2 \le 900$ : deux boucles sur $a$ et $b$ entre $-30$ et $30$
        suffisent.`,
      md`Ordre de grandeur : l’aire du disque, $900\pi \approx 2\,827$.`,
    ],
    answer: { type: 'number', value: 2821 },
    solution: md`~~~python
      print(sum(1 for a in range(-30, 31) for b in range(-30, 31) if a * a + b * b <= 900))
      ~~~

      On trouve **2 821** points, très proche de l’aire $900\pi \approx 2\,827{,}4$.

      Ce n’est pas un hasard : chaque point entier est le coin d’un carré unité, et ces carrés
      recouvrent à peu près le disque. Le « problème du cercle de Gauss » porte sur l’erreur
      $N(r) - \pi r^2$ : Gauss l’a majorée par une constante fois $r$, et l’on conjecture qu’elle est
      un $O(r^{1/2 + \varepsilon})$ pour tout $\varepsilon > 0$. On sait seulement faire un peu
      mieux que $r^{2/3}$.`,
  },
  {
    id: 'cplx-equation-coef-complexes',
    section: 'equations',
    title: 'Second degré à coefficients complexes',
    difficulty: 3,
    level: 'L1',
    kind: 'calcul',
    statement: md`Résoudre dans $\C$ l’équation $z^2 - 3z + 3 - i = 0$.`,
    hints: [
      md`Calcule $\Delta$ : ce n’est pas un réel. Cherche une racine carrée $\delta = x + iy$ de
        $\Delta$.`,
      md`$\Delta = -3 + 4i$, et $(1 + 2i)^2 = -3 + 4i$.`,
    ],
    answer: {
      type: 'complexes',
      values: [
        { re: 2, im: 1 },
        { re: 1, im: -1 },
      ],
    },
    solution: md`$\Delta = (-3)^2 - 4(3 - i) = 9 - 12 + 4i = -3 + 4i$.

      **Racine carrée de $\Delta$.** On cherche $\delta = x + iy$ avec $\delta^2 = -3 + 4i$ :

      $$
      \begin{cases} x^2 - y^2 = -3 \\ x^2 + y^2 = \lvert -3 + 4i \rvert = 5 \\ 2xy = 4 \end{cases}
      $$

      Donc $x^2 = 1$ et $y^2 = 4$, avec $xy > 0$ : $\delta = 1 + 2i$ convient.

      **Solutions.**

      $$
      \begin{gathered}
      z = \frac{3 \pm (1 + 2i)}{2}, \\
      \text{soit } z_1 = 2 + i \text{ et } z_2 = 1 - i.
      \end{gathered}
      $$

      Vérification : $z_1 + z_2 = 3$ et $z_1 z_2 = (2 + i)(1 - i) = 2 - 2i + i + 1 = 3 - i$.`,
  },
  {
    id: 'cplx-cos-2pi-5',
    section: 'racines-unite',
    title: 'cos(2π/5) par les racines cinquièmes',
    difficulty: 3,
    level: 'L1',
    kind: 'probleme',
    statement: md`On pose $\omega = e^{2i\pi/5}$.

      1. Montrer que $1 + \omega + \omega^2 + \omega^3 + \omega^4 = 0$.
      2. On pose $\alpha = \omega + \omega^4$. Montrer que $\alpha = 2\cos\frac{2\pi}{5}$, puis que
         $\alpha^2 + \alpha - 1 = 0$.
      3. En déduire la valeur exacte de $\cos\frac{2\pi}{5}$, et donnes-en une valeur approchée à
         $10^{-3}$ près.`,
    hints: [
      md`$\omega^4 = \omega^{-1} = \overline{\omega}$, puisque $\omega^5 = 1$ et $|\omega| = 1$.`,
      md`Développe $\alpha^2 = \omega^2 + 2\omega^5 + \omega^8$, puis simplifie avec $\omega^5 = 1$.`,
    ],
    answer: { type: 'number', value: (Math.sqrt(5) - 1) / 4 },
    solution: md`**1.** C’est la somme des racines cinquièmes de l’unité : une somme géométrique de
      raison $\omega \ne 1$, égale à $\frac{1 - \omega^5}{1 - \omega} = 0$.

      **2.** Comme $\omega^5 = 1$ et $|\omega| = 1$, $\omega^4 = \omega^{-1} = \overline{\omega}$. Donc
      $\alpha = \omega + \overline{\omega} = 2\Re(\omega) = 2\cos\frac{2\pi}{5}$. Ensuite,

      $$
      \alpha^2 = \omega^2 + 2\omega^5 + \omega^8 = \omega^2 + 2 + \omega^3,
      $$

      donc $\alpha^2 + \alpha = \omega + \omega^2 + \omega^3 + \omega^4 + 2 = -1 + 2 = 1$, par la
      question 1.

      **3.** $\alpha$ est racine de $X^2 + X - 1$, dont les racines sont $\frac{-1 \pm \sqrt{5}}{2}$.
      Or $\alpha = 2\cos\frac{2\pi}{5} > 0$, car $0 < \frac{2\pi}{5} < \frac{\pi}{2}$. Donc
      $\alpha = \frac{\sqrt{5} - 1}{2}$ et

      $$
      \cos\frac{2\pi}{5} = \frac{\sqrt{5} - 1}{4} \approx 0{,}309.
      $$

      *Culture :* $\frac{\sqrt{5} - 1}{2}$ est l’inverse du nombre d’or, et c’est ce qui rend le
      pentagone régulier constructible à la règle et au compas.`,
  },
  {
    id: 'cplx-somme-cosinus',
    section: 'euler-moivre',
    title: 'Somme de cosinus',
    difficulty: 3,
    level: 'L1',
    kind: 'demo',
    statement: md`Soient $\theta \in \R \setminus 2\pi\Z$ et $n \in \N$. Calculer

      $$
      S_n = \sum_{k=0}^{n} \cos(k\theta).
      $$`,
    hints: [
      md`$S_n$ est la partie réelle de $\sum_{k=0}^{n} e^{ik\theta}$, une somme géométrique.`,
      md`Pour simplifier $\frac{e^{i(n+1)\theta} - 1}{e^{i\theta} - 1}$, factorise le numérateur et le
        dénominateur par l’angle moitié.`,
    ],
    solution: md`$S_n = \Re\left(\sum_{k=0}^{n} e^{ik\theta}\right)$, et comme $e^{i\theta} \ne 1$ :

      $$
      \sum_{k=0}^{n} e^{ik\theta} = \frac{e^{i(n+1)\theta} - 1}{e^{i\theta} - 1}.
      $$

      Angle moitié : $e^{ia} - 1 = e^{ia/2}\left(e^{ia/2} - e^{-ia/2}\right) = 2i\sin\left(\frac{a}{2}\right)e^{ia/2}$. Donc

      $$
      \begin{aligned}
      \sum_{k=0}^{n} e^{ik\theta} &= \frac{2i\sin\left(\frac{(n+1)\theta}{2}\right) e^{i(n+1)\theta/2}}{2i\sin\left(\frac{\theta}{2}\right) e^{i\theta/2}} \\
      &= \frac{\sin\left(\frac{(n+1)\theta}{2}\right)}{\sin\left(\frac{\theta}{2}\right)}\, e^{in\theta/2},
      \end{aligned}
      $$

      où $\sin\frac{\theta}{2} \ne 0$ puisque $\theta \notin 2\pi\Z$. En prenant la partie réelle :

      $$
      S_n = \frac{\sin\left(\frac{(n+1)\theta}{2}\right) \cos\left(\frac{n\theta}{2}\right)}{\sin\left(\frac{\theta}{2}\right)}.
      $$

      La partie imaginaire donne de même $\sum_{k=0}^{n} \sin(k\theta)$, avec
      $\sin\left(\frac{n\theta}{2}\right)$ à la place du cosinus.`,
  },
  {
    id: 'cplx-triangle-equilateral',
    section: 'geometrie',
    title: 'Triangle équilatéral et nombre j',
    difficulty: 3,
    level: 'L1',
    kind: 'demo',
    statement: md`Soient $j = e^{2i\pi/3}$ et $A$, $B$, $C$ trois points d’affixes $a$, $b$, $c$.
      Montrer que $ABC$ est équilatéral et parcouru dans le sens direct si et seulement si

      $$
      a + bj + cj^2 = 0.
      $$`,
    hints: [
      md`$ABC$ est équilatéral direct si et seulement si $C$ est l’image de $B$ par la rotation de
        centre $A$ et d’angle $\frac{\pi}{3}$.`,
      md`Exprime $e^{i\pi/3}$ à l’aide de $j$ : $e^{i\pi/3} = -j^2$. Et n’oublie pas $1 + j + j^2 = 0$.`,
    ],
    solution: md`$ABC$ est équilatéral direct si et seulement si $AC = AB$ et
      $(\overrightarrow{AB}, \overrightarrow{AC}) \equiv \frac{\pi}{3} \ [2\pi]$, c’est-à-dire si et
      seulement si $C$ est l’image de $B$ par la rotation de centre $A$ et d’angle $\frac{\pi}{3}$ :

      $$
      c - a = e^{i\pi/3}(b - a).
      $$

      Or $j^2 = e^{4i\pi/3} = e^{-2i\pi/3}$, donc $-j^2 = e^{i\pi}e^{-2i\pi/3} = e^{i\pi/3}$. La
      condition s’écrit

      $$
      \begin{aligned}
      &c - a = -j^2(b - a) \\
      \iff\; &c + j^2 b - (1 + j^2)a = 0 \\
      \iff\; &c + j^2 b + ja = 0,
      \end{aligned}
      $$

      car $1 + j^2 = -j$. En multipliant par $j^2$, non nul, et avec $j^3 = 1$ :
      $j^2 c + j^4 b + j^3 a = a + jb + j^2 c = 0$. Toutes les étapes sont des équivalences.`,
  },
  {
    id: 'cplx-produit-sinus',
    section: 'racines-unite',
    title: 'Le produit des sinus',
    difficulty: 4,
    level: 'L1',
    kind: 'demo',
    statement: md`Soit $n \ge 2$. Montrer que

      $$
      \prod_{k=1}^{n-1} \sin\left(\frac{k\pi}{n}\right) = \frac{n}{2^{n-1}}.
      $$`,
    hints: [
      md`Avec $\omega = e^{2i\pi/n}$, factorise $z^n - 1$, puis
        $\frac{z^n - 1}{z - 1} = 1 + z + \cdots + z^{n-1}$, et évalue en $z = 1$.`,
      md`Calcule $|1 - e^{i\theta}|$ avec l’angle moitié.`,
    ],
    solution: md`Avec $\omega = e^{2i\pi/n}$, les racines de $z^n - 1$ sont les $\omega^k$,
      $0 \le k \le n - 1$, donc $z^n - 1 = \prod_{k=0}^{n-1}(z - \omega^k)$. En retirant le facteur
      $z - 1$ (pour $k = 0$) :

      $$
      1 + z + \cdots + z^{n-1} = \prod_{k=1}^{n-1}(z - \omega^k).
      $$

      En $z = 1$ : $n = \prod_{k=1}^{n-1}(1 - \omega^k)$. On passe aux modules, avec l’angle moitié :

      $$
      \left| 1 - e^{i\theta} \right| = \left| e^{i\theta/2} \right| \left| e^{-i\theta/2} - e^{i\theta/2} \right| = 2\left| \sin\frac{\theta}{2} \right|.
      $$

      Pour $\theta = \frac{2k\pi}{n}$ avec $1 \le k \le n - 1$, on a $0 < \frac{k\pi}{n} < \pi$, donc
      $\sin\frac{k\pi}{n} > 0$ et $|1 - \omega^k| = 2\sin\frac{k\pi}{n}$. Finalement

      $$
      n = \prod_{k=1}^{n-1} 2\sin\frac{k\pi}{n} = 2^{n-1} \prod_{k=1}^{n-1} \sin\frac{k\pi}{n}.
      $$`,
  },
  {
    id: 'cplx-somme-binomiale',
    section: 'racines-unite',
    title: 'Un coefficient binomial sur trois',
    difficulty: 4,
    level: 'L1',
    kind: 'probleme',
    statement: md`Soient $n \in \N$ et $j = e^{2i\pi/3}$. On pose

      $$
      \begin{aligned}
      S_n &= \sum_{0 \le 3k \le n} \binom{n}{3k} \\
      &= \binom{n}{0} + \binom{n}{3} + \binom{n}{6} + \cdots
      \end{aligned}
      $$

      1. Pour $k \in \N$, que vaut $1 + j^k + j^{2k}$ ?
      2. Calculer de deux façons $(1 + 1)^n + (1 + j)^n + (1 + j^2)^n$, et en déduire une expression
         de $S_n$.
      3. Combien vaut $S_{10}$ ?`,
    hints: [
      md`$1 + j^k + j^{2k}$ vaut $3$ si $3 \mid k$, et $0$ sinon.`,
      md`$1 + j = -j^2 = e^{i\pi/3}$ et $1 + j^2 = -j = e^{-i\pi/3}$.`,
    ],
    answer: { type: 'number', value: 341 },
    solution: md`**1.** Si $3 \mid k$, $j^k = 1$ et la somme vaut $3$. Sinon $j^k \ne 1$ et
      $1 + j^k + (j^k)^2 = \frac{1 - j^{3k}}{1 - j^k} = 0$.

      **2.** D’une part, avec le binôme, en échangeant les sommes et d’après 1 :

      $$
      \begin{aligned}
      \sum_{m=0}^{2} (1 + j^m)^n &= \sum_{k=0}^{n} \binom{n}{k}\left(1 + j^k + j^{2k}\right) \\
      &= 3S_n.
      \end{aligned}
      $$

      D’autre part, $1 + j = -j^2 = e^{i\pi/3}$ et $1 + j^2 = -j = e^{-i\pi/3}$, donc la même somme vaut

      $$
      2^n + e^{in\pi/3} + e^{-in\pi/3} = 2^n + 2\cos\frac{n\pi}{3}.
      $$

      Ainsi $S_n = \dfrac{2^n + 2\cos\left(\frac{n\pi}{3}\right)}{3}$.

      **3.** $\cos\frac{10\pi}{3} = \cos\frac{4\pi}{3} = -\frac{1}{2}$, donc
      $S_{10} = \frac{1024 - 1}{3} = \mathbf{341}$. Vérification directe :
      $\binom{10}{0} + \binom{10}{3} + \binom{10}{6} + \binom{10}{9} = 1 + 120 + 210 + 10 = 341$.`,
  },
];

// Angles en douzièmes de π, ramenés dans ]-12, 12] (soit ]-π, π])
const normAngle = (t) => {
  const r = ((((t + 12) % 24) + 24) % 24) - 12;
  return r === -12 ? 12 : r;
};

// e^{iθ} en LaTeX, le signe de l'angle sorti devant le i : e^{-i\frac{\pi}{3}}
const expI = (t) => {
  if (t === 0) return 'e^{0}';
  const angle = texAngle(Math.abs(t), 12);
  return t < 0 ? raw`e^{-i ${angle}}` : raw`e^{i ${angle}}`;
};

const SIGNS = [
  [1, 1],
  [-1, 1],
  [-1, -1],
  [1, -1],
];

// Complexes à argument remarquable : z = k(x + iy), écrit en LaTeX, avec module et argument
const FAMILIES = {
  // argument ±π/4 ou ±3π/4
  quarter: (k, sx, sy) => ({
    tex: `${sx * k} ${sy < 0 ? '-' : '+'} ${k === 1 ? '' : k}i`,
    modTex: k === 1 ? '\\sqrt{2}' : `${k}\\sqrt{2}`,
    wrongModTex: `${2 * k * k}`,
    squares: [k * k, k * k],
    modSquare: 2 * k * k,
    t: sx > 0 ? 3 * sy : 9 * sy,
    cosTex: `${sx < 0 ? '-' : ''}\\frac{\\sqrt{2}}{2}`,
    sinTex: `${sy < 0 ? '-' : ''}\\frac{\\sqrt{2}}{2}`,
  }),
  // argument ±π/6 ou ±5π/6
  sixth: (k, sx, sy) => ({
    tex: `${sx < 0 ? '-' : ''}${k === 1 ? '' : k}\\sqrt{3} ${sy < 0 ? '-' : '+'} ${k === 1 ? '' : k}i`,
    modTex: `${2 * k}`,
    wrongModTex: `${4 * k * k}`,
    squares: [3 * k * k, k * k],
    modSquare: 4 * k * k,
    t: sx > 0 ? 2 * sy : 10 * sy,
    cosTex: `${sx < 0 ? '-' : ''}\\frac{\\sqrt{3}}{2}`,
    sinTex: `${sy < 0 ? '-' : ''}\\frac{1}{2}`,
  }),
  // argument ±π/3 ou ±2π/3
  third: (k, sx, sy) => ({
    tex: `${sx * k} ${sy < 0 ? '-' : '+'} ${k === 1 ? '' : k}i\\sqrt{3}`,
    modTex: `${2 * k}`,
    wrongModTex: `${4 * k * k}`,
    squares: [k * k, 3 * k * k],
    modSquare: 4 * k * k,
    t: sx > 0 ? 4 * sy : 8 * sy,
    cosTex: `${sx < 0 ? '-' : ''}\\frac{1}{2}`,
    sinTex: `${sy < 0 ? '-' : ''}\\frac{\\sqrt{3}}{2}`,
  }),
};

// e^{iφ} pour φ multiple de π/4 (en douzièmes de π)
const UNIT = {
  0: { tex: '1', re: 1, im: 0 },
  6: { tex: 'i', re: 0, im: 1 },
  12: { tex: '(-1)', re: -1, im: 0 },
  '-6': { tex: '(-i)', re: 0, im: -1 },
  3: { tex: '\\frac{\\sqrt{2}}{2}(1 + i)' },
  9: { tex: '\\frac{\\sqrt{2}}{2}(-1 + i)' },
  '-9': { tex: '\\frac{\\sqrt{2}}{2}(-1 - i)' },
  '-3': { tex: '\\frac{\\sqrt{2}}{2}(1 - i)' },
};

const generators = [
  {
    id: 'cplx-gen-produit',
    section: 'algebrique',
    title: 'Produit ou quotient',
    difficulty: 1,
    level: 'Tle',
    kind: 'calcul',
    hints: [
      md`Pour un produit, développe avec $i^2 = -1$. Pour un quotient, multiplie le numérateur et le
        dénominateur par le conjugué du dénominateur.`,
    ],
    generate: (rng) => {
      const c = rng.nonZero(-5, 5);
      const d = rng.nonZero(-5, 5);
      if (rng.next() < 0.5) {
        const a = rng.nonZero(-6, 6);
        const b = rng.nonZero(-6, 6);
        const re = a * c - b * d;
        const im = a * d + b * c;
        return {
          statement: raw`Écrire sous forme algébrique $z = ${texComplexParen(a, b)}${texComplexParen(c, d)}$.`,
          answer: { type: 'complex', value: { re, im } },
          solution: [
            raw`On développe, avec $i^2 = -1$ : $(a + bi)(c + di) = (ac - bd) + (ad + bc)i$. Ici :`,
            '',
            '$$',
            raw`\begin{aligned} \Re(z) &= ${a} \times ${paren(c)} - ${paren(b)} \times ${paren(d)} = ${re}, \\ \Im(z) &= ${a} \times ${paren(d)} + ${paren(b)} \times ${paren(c)} = ${im}. \end{aligned}`,
            '$$',
            '',
            raw`Réponse : $\mathbf{${texComplex(re, im)}}$.`,
          ].join('\n'),
        };
      }
      let wre = 0;
      let wim = 0;
      while (wre === 0 && wim === 0) {
        wre = rng.int(-5, 5);
        wim = rng.int(-5, 5);
      }
      // Numérateur choisi pour que le quotient tombe juste : w (c + di)
      const nre = wre * c - wim * d;
      const nim = wre * d + wim * c;
      const n2 = c * c + d * d;
      return {
        statement: raw`Écrire sous forme algébrique $z = \dfrac{${texComplex(nre, nim)}}{${texComplex(c, d)}}$.`,
        answer: { type: 'complex', value: { re: wre, im: wim } },
        solution: [
          raw`On multiplie le numérateur et le dénominateur par le conjugué du dénominateur, $${texComplex(c, -d)}$ :`,
          '',
          '$$',
          raw`\begin{aligned} z &= \frac{${texComplexParen(nre, nim)}${texComplexParen(c, -d)}}{${paren(c)}^2 + ${paren(d)}^2} \\ &= \frac{${texComplex(wre * n2, wim * n2)}}{${n2}} = ${texComplex(wre, wim)}. \end{aligned}`,
          '$$',
          '',
          raw`Réponse : $\mathbf{${texComplex(wre, wim)}}$.`,
        ].join('\n'),
      };
    },
  },
  {
    id: 'cplx-gen-module-arg',
    section: 'module-argument',
    title: 'Module et argument',
    difficulty: 1,
    level: 'Tle',
    kind: 'qcm',
    hints: [
      md`Calcule $|z|$, puis cherche $\theta$ tel que $\cos\theta = \frac{\Re z}{|z|}$ et
        $\sin\theta = \frac{\Im z}{|z|}$.`,
    ],
    generate: (rng) => {
      const family = FAMILIES[rng.pick(['quarter', 'sixth', 'third'])];
      const [sx, sy] = rng.pick(SIGNS);
      const z = family(rng.pick([1, 1, 2, 3]), sx, sy);
      const option = (modTex, t) => raw`$|z| = ${modTex}$ et $\arg z = ${texAngle(normAngle(t), 12)}$`;
      const correct = option(z.modTex, z.t);
      // Erreurs classiques : conjugué, symétrique, cosinus et sinus échangés, oubli de la racine
      const distractors = rng
        .shuffle([
          option(z.modTex, -z.t),
          option(z.modTex, 12 - z.t),
          option(z.modTex, 6 - z.t),
          option(z.modTex, z.t + 12),
          option(z.wrongModTex, z.t),
        ])
        .filter((o, i, list) => o !== correct && list.indexOf(o) === i)
        .slice(0, 3);
      const options = rng.shuffle([correct, ...distractors]);
      const angle = texAngle(normAngle(z.t), 12);
      return {
        statement: raw`Quels sont le module et un argument de $z = ${z.tex}$ ?`,
        answer: { type: 'choice', options, correct: options.indexOf(correct) },
        solution: [
          raw`$|z|^2 = ${z.squares[0]} + ${z.squares[1]} = ${z.modSquare}$, donc $|z| = ${z.modTex}$.`,
          '',
          raw`Un argument $\theta$ vérifie $\cos\theta = \frac{\Re z}{|z|} = ${z.cosTex}$ et $\sin\theta = \frac{\Im z}{|z|} = ${z.sinTex}$, donc $\theta \equiv ${angle} \ [2\pi]$.`,
          '',
          raw`Réponse : $|z| = ${z.modTex}$ et $\arg z \equiv ${angle} \ [2\pi]$, soit $z = ${z.modTex}\, ${expI(normAngle(z.t))}$.`,
        ].join('\n'),
      };
    },
  },
  {
    id: 'cplx-gen-puissance',
    section: 'euler-moivre',
    title: 'Puissance par la forme exponentielle',
    difficulty: 2,
    level: 'Tle',
    kind: 'calcul',
    hints: [md`Écris $z$ sous forme exponentielle $re^{i\theta}$ : alors $z^n = r^n e^{in\theta}$.`],
    generate: (rng) => {
      const [sx, sy] = rng.pick(SIGNS);
      const kind = rng.pick(['quarter', 'quarter', 'sixth', 'third']);
      const z = FAMILIES[kind](1, sx, sy);
      // Avec π/6 ou π/3, n multiple de 3 pour que nθ soit un multiple de π/2
      const n = kind === 'quarter' ? rng.int(3, 12) : rng.pick([3, 6, 9]);
      const phi = normAngle(n * z.t);
      let re;
      let im;
      let rTex;
      let rnTex;
      if (kind === 'quarter') {
        // (±1 ± i)^n calculé exactement dans les entiers de Gauss
        [re, im] = [1, 0];
        for (let i = 0; i < n; i += 1) [re, im] = [re * sx - im * sy, re * sy + im * sx];
        rTex = '\\sqrt{2}';
        rnTex = n % 2 === 0 ? `${2 ** (n / 2)}` : `${2 ** ((n - 1) / 2)}\\sqrt{2}`;
      } else {
        re = 2 ** n * UNIT[phi].re;
        im = 2 ** n * UNIT[phi].im;
        rTex = '2';
        rnTex = `${2 ** n}`;
      }
      const result = texComplex(re, im);
      return {
        statement: raw`Écrire $\left(${z.tex}\right)^{${n}}$ sous forme algébrique.`,
        answer: { type: 'complex', value: { re, im } },
        solution: [
          raw`Forme exponentielle : $z = ${z.tex} = ${rTex}\, ${expI(z.t)}$. Par la formule de Moivre,`,
          '',
          '$$',
          raw`\begin{aligned} z^{${n}} &= ${kind === 'quarter' ? raw`\left(\sqrt{2}\right)` : '2'}^{${n}} ${expI(n * z.t)} \\ &= ${rnTex}\, ${expI(n * z.t)}. \end{aligned}`,
          '$$',
          '',
          raw`Or $${texAngle(n * z.t, 12)} \equiv ${texAngle(phi, 12)} \ [2\pi]$, donc`,
          '',
          '$$',
          raw`\begin{aligned} z^{${n}} &= ${rnTex}\, ${expI(phi)} = ${rnTex} \times ${UNIT[phi].tex} \\ &= ${result}. \end{aligned}`,
          '$$',
          '',
          raw`Réponse : $\mathbf{${result}}$.`,
        ].join('\n'),
      };
    },
  },
];

export default {
  id: 'complexes',
  domain: 'algebre',
  title: 'Nombres complexes',
  levels: 'Tle → L1',
  summary: 'Forme exponentielle, Euler et Moivre, équations, racines de l’unité et géométrie.',
  lesson,
  exercises,
  generators,
};
