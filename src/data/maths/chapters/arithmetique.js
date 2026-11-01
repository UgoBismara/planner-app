// Chapitre « Arithmétique » : de la divisibilité (Tle maths expertes) au chiffrement
// RSA (L2). Réponses numériques recalculées par script avant livraison.
import {
  bezoutRows,
  bezoutTable,
  egcd,
  euclidSteps,
  gcd,
  md,
  mod,
  modPow,
  paren,
} from '../helpers.js';

const raw = String.raw;

const lesson = [
  {
    id: 'divisibilite',
    title: 'Divisibilité et division euclidienne',
    level: 'Tle',
    blocks: [
      {
        type: 'texte',
        body: md`L’arithmétique ne parle que des entiers, et pourtant elle cache certaines des
          questions les plus difficiles des mathématiques. Tout part d’une relation très simple :
          la divisibilité.`,
      },
      {
        type: 'definition',
        title: 'Divisibilité',
        body: md`Soient $a, b \in \Z$. On dit que $a$ **divise** $b$, et on note $a \mid b$, s’il
          existe $k \in \Z$ tel que $b = ka$. On dit aussi que $b$ est un **multiple** de $a$.`,
      },
      {
        type: 'propriete',
        title: 'Combinaisons linéaires',
        body: md`Si $a \mid b$ et $a \mid c$, alors $a \mid bu + cv$ pour tous $u, v \in \Z$.
          La divisibilité est aussi transitive : si $a \mid b$ et $b \mid c$, alors $a \mid c$.`,
      },
      {
        type: 'theoreme',
        title: 'Division euclidienne',
        body: md`Soient $a \in \Z$ et $b \in \N^*$. Il existe un unique couple $(q, r) \in \Z^2$ tel que

          $$
          a = bq + r \quad \text{et} \quad 0 \le r < b.
          $$

          $q$ est le **quotient** et $r$ le **reste**. En particulier, $b \mid a$ si et seulement si $r = 0$.`,
      },
      {
        type: 'demo',
        body: md`**Existence.** On pose $q = \left\lfloor \frac{a}{b} \right\rfloor$, le plus grand
          entier inférieur ou égal à $\frac{a}{b}$, et $r = a - bq$. De $q \le \frac{a}{b} < q + 1$,
          on tire $bq \le a < bq + b$, c’est-à-dire $0 \le r < b$.

          **Unicité.** Si $a = bq + r = bq' + r'$ avec $0 \le r, r' < b$, alors $b(q - q') = r' - r$.
          Ainsi $b$ divise $r' - r$, qui vérifie $-b < r' - r < b$ : la seule possibilité est
          $r' - r = 0$, donc $r = r'$, puis $q = q'$.`,
      },
      {
        type: 'methode',
        title: 'Faire disparaître l’inconnue',
        body: md`Pour trouver les $n \in \N^*$ tels que $n \mid n + 6$ : comme $n \mid n$, on a
          $n \mid (n + 6) - n = 6$. Réciproquement, tout diviseur de $6$ convient, donc
          $n \in \{1, 2, 3, 6\}$. L’idée générale : combiner les quantités pour éliminer $n$.`,
      },
      {
        type: 'piege',
        title: 'Le reste est toujours positif',
        body: md`La division euclidienne de $-17$ par $5$ s’écrit $-17 = 5 \times (-4) + 3$ : le
          reste est $3$, et non $-2$ comme dans $-17 = 5 \times (-3) - 2$.`,
      },
    ],
  },
  {
    id: 'congruences',
    title: 'Congruences',
    level: 'Tle',
    blocks: [
      {
        type: 'definition',
        body: md`Soit $n \in \N^*$. On dit que $a$ est **congru** à $b$ modulo $n$, et on note
          $a \equiv b \ [n]$, si $n \mid a - b$. Cela revient à dire que $a$ et $b$ ont le même reste
          dans la division euclidienne par $n$.`,
      },
      {
        type: 'propriete',
        title: 'Compatibilité avec les opérations',
        body: md`Si $a \equiv b \ [n]$ et $c \equiv d \ [n]$, alors

          $$
          \begin{gathered}
          a + c \equiv b + d \ [n], \\
          ac \equiv bd \ [n], \\
          a^k \equiv b^k \ [n] \text{ pour tout } k \in \N.
          \end{gathered}
          $$

          On peut donc remplacer un nombre par n’importe quel nombre qui lui est congru, au milieu
          d’un calcul.`,
      },
      {
        type: 'methode',
        title: 'Calculer une puissance modulo n',
        body: md`On cherche une petite puissance congrue à $1$ (ou à $-1$), puis on divise
          l’exposant. Par exemple, $2^3 = 8 \equiv 1 \ [7]$ et $100 = 3 \times 33 + 1$, donc

          $$
          2^{100} = \left(2^3\right)^{33} \times 2 \equiv 1^{33} \times 2 \equiv 2 \ [7].
          $$`,
      },
      {
        type: 'exemple',
        title: 'Critère de divisibilité par 9',
        body: md`Comme $10 \equiv 1 \ [9]$, on a $10^k \equiv 1 \ [9]$ pour tout $k$. Un entier
          $n = \overline{a_p \ldots a_1 a_0}$ vérifie donc $n = \sum a_k 10^k \equiv \sum a_k \ [9]$ :
          un nombre et la somme de ses chiffres ont le même reste modulo $9$.`,
      },
      {
        type: 'piege',
        title: 'On ne divise pas une congruence',
        body: md`$2 \times 3 \equiv 2 \times 0 \ [6]$, et pourtant $3 \not\equiv 0 \ [6]$. On ne peut
          simplifier par $k$ que si $k$ est premier avec $n$ : c’est le théorème de Gauss, plus loin.`,
      },
      {
        type: 'histoire',
        body: md`La notation $\equiv$ est due à Gauss, dans ses *Disquisitiones arithmeticae*,
          achevées à 21 ans et publiées en 1801. Il explique l’avoir choisie à cause de la grande
          analogie entre l’égalité et la congruence.`,
      },
    ],
  },
  {
    id: 'pgcd',
    title: 'PGCD, Bézout et Gauss',
    level: 'Tle',
    blocks: [
      {
        type: 'definition',
        body: md`Pour $a, b$ entiers non tous deux nuls, $\pgcd(a, b)$ est le plus grand entier qui
          divise à la fois $a$ et $b$. On dit que $a$ et $b$ sont **premiers entre eux** si
          $\pgcd(a, b) = 1$.`,
      },
      {
        type: 'propriete',
        title: 'Algorithme d’Euclide',
        body: md`Si $a = bq + r$, alors $\pgcd(a, b) = \pgcd(b, r)$ : les diviseurs communs à $a$ et
          $b$ sont exactement ceux communs à $b$ et $r$. On remplace donc $(a, b)$ par $(b, r)$
          jusqu’à obtenir un reste nul : le PGCD est le **dernier reste non nul**.`,
      },
      {
        type: 'theoreme',
        title: 'Bézout',
        body: md`Soient $a, b$ entiers non tous deux nuls et $d = \pgcd(a, b)$. Il existe
          $u, v \in \Z$ tels que $au + bv = d$. En particulier,

          $$
          \begin{gathered}
          \pgcd(a, b) = 1 \iff \text{il existe } u, v \in \Z \\
          \text{tels que } au + bv = 1.
          \end{gathered}
          $$`,
      },
      {
        type: 'demo',
        body: md`Soit $E$ l’ensemble des entiers $au + bv > 0$, pour $u, v \in \Z$. Il est non vide
          (il contient $|a|$ ou $|b|$), il a donc un plus petit élément $m = au_0 + bv_0$.

          Écrivons $a = mq + r$ avec $0 \le r < m$. Alors $r = a(1 - qu_0) + b(-qv_0)$ est encore de
          la forme $au + bv$ : s’il était non nul, il serait dans $E$ tout en étant plus petit que
          $m$. Donc $r = 0$ et $m \mid a$. De même $m \mid b$, donc $m \le d$.

          Inversement, $d$ divise $a$ et $b$, donc $d$ divise $au_0 + bv_0 = m$, d’où $d \le m$.
          Finalement $m = d$. Pour l’équivalence : si $au + bv = 1$, tout diviseur commun à $a$ et
          $b$ divise $1$.`,
      },
      {
        type: 'theoreme',
        title: 'Gauss',
        body: md`Si $a \mid bc$ et $\pgcd(a, b) = 1$, alors $a \mid c$.

          Conséquence : si $a \mid n$, $b \mid n$ et $\pgcd(a, b) = 1$, alors $ab \mid n$.`,
      },
      {
        type: 'demo',
        body: md`Par Bézout, il existe $u, v$ tels que $au + bv = 1$. En multipliant par $c$ :
          $c = acu + bcv$. Or $a$ divise $acu$, et $bcv$ puisque $a \mid bc$ : $a$ divise leur
          somme $c$.

          Pour la conséquence : $n = ak$ et $b \mid ak$ avec $\pgcd(a, b) = 1$, donc $b \mid k$ par
          Gauss, et $ab \mid ak = n$.`,
      },
      {
        type: 'methode',
        title: 'Trouver u et v : remonter l’algorithme',
        body: md`Pour $a = 84$ et $b = 30$ :

          $$
          \begin{aligned}
          84 &= 2 \times 30 + 24, \\
          30 &= 1 \times 24 + 6, \\
          24 &= 4 \times 6 + 0.
          \end{aligned}
          $$

          Donc $\pgcd(84, 30) = 6$. On remonte : $6 = 30 - 24 = 30 - (84 - 2 \times 30) = 3 \times 30 - 84$.
          Ainsi $u = -1$ et $v = 3$ conviennent : $84 \times (-1) + 30 \times 3 = 6$.`,
      },
      {
        type: 'histoire',
        body: md`L’algorithme d’Euclide figure dans le livre VII des *Éléments*, vers 300 av. J.-C. :
          c’est l’un des plus vieux algorithmes encore utilisés chaque jour, jusque dans les
          protocoles de chiffrement. L’identité porte le nom d’Étienne Bézout (1779), qui l’a étendue
          aux polynômes ; pour les entiers, Bachet de Méziriac la connaissait dès 1624.`,
      },
    ],
  },
  {
    id: 'premiers',
    title: 'Nombres premiers',
    level: 'Tle',
    blocks: [
      {
        type: 'definition',
        body: md`Un entier $p \ge 2$ est **premier** s’il a exactement deux diviseurs positifs, $1$ et
          $p$ : $2, 3, 5, 7, 11, 13, 17, 19, 23, \ldots$`,
      },
      {
        type: 'propriete',
        title: 'Trouver un diviseur premier',
        body: md`Tout entier $n \ge 2$ a un diviseur premier : son plus petit diviseur supérieur ou
          égal à $2$. Si $n$ n’est pas premier, ce diviseur vérifie $p \le \sqrt{n}$. Pour tester si
          $n$ est premier, il suffit donc d’essayer les premiers $p \le \sqrt{n}$.`,
      },
      {
        type: 'theoreme',
        title: 'Euclide',
        body: md`Il existe une infinité de nombres premiers.`,
      },
      {
        type: 'demo',
        body: md`Supposons qu’il n’y en ait qu’un nombre fini, $p_1, \ldots, p_k$, et posons
          $N = p_1 p_2 \cdots p_k + 1$. $N \ge 2$ a un diviseur premier $p$, qui est l’un des $p_i$.
          Alors $p$ divise $N$ et $p_1 \cdots p_k$, donc leur différence $1$ : absurde.`,
      },
      {
        type: 'propriete',
        title: 'Lemme d’Euclide',
        body: md`Si $p$ est premier et $p \mid ab$, alors $p \mid a$ ou $p \mid b$. C’est le théorème
          de Gauss : si $p \nmid a$, alors $\pgcd(p, a) = 1$.`,
      },
      {
        type: 'theoreme',
        title: 'Décomposition en facteurs premiers',
        body: md`Tout entier $n \ge 2$ s’écrit de manière unique, à l’ordre près,
          $n = p_1^{\alpha_1} \cdots p_r^{\alpha_r}$, avec des premiers $p_1 < \cdots < p_r$ et des
          exposants $\alpha_i \ge 1$. Ses diviseurs positifs sont les $p_1^{\beta_1} \cdots p_r^{\beta_r}$
          avec $0 \le \beta_i \le \alpha_i$ : il y en a $(\alpha_1 + 1) \cdots (\alpha_r + 1)$.`,
      },
      {
        type: 'exemple',
        body: md`$84 = 2^2 \times 3 \times 7$ a $(2 + 1)(1 + 1)(1 + 1) = 12$ diviseurs positifs :
          $1, 2, 3, 4, 6, 7, 12, 14, 21, 28, 42, 84$.`,
      },
      {
        type: 'histoire',
        body: md`Le crible d’Ératosthène (IIIe siècle av. J.-C.) trouve tous les premiers jusqu’à
          $N$ en barrant les multiples. Leur répartition reste mystérieuse : le théorème des nombres
          premiers (Hadamard et de La Vallée Poussin, 1896) dit qu’il y en a environ
          $\frac{x}{\ln x}$ jusqu’à $x$, mais on ne sait toujours pas s’il y a une infinité de
          premiers jumeaux $p$ et $p + 2$. Depuis Zhang (2013) et le projet Polymath, on sait
          seulement qu’il y a une infinité de couples de premiers distants d’au plus $246$.`,
      },
    ],
  },
  {
    id: 'fermat',
    title: 'Petit théorème de Fermat, puis Euler',
    level: 'Tle',
    blocks: [
      {
        type: 'theoreme',
        title: 'Petit théorème de Fermat',
        body: md`Si $p$ est premier et $a$ un entier non divisible par $p$, alors

          $$
          a^{p-1} \equiv 1 \ [p].
          $$

          Pour tout entier $a$, on a donc $a^p \equiv a \ [p]$.`,
      },
      {
        type: 'demo',
        body: md`Multiplions par $a$ les entiers $1, 2, \ldots, p - 1$. Les nombres
          $a, 2a, \ldots, (p - 1)a$ sont deux à deux non congrus modulo $p$ : si $ia \equiv ja \ [p]$,
          alors $p \mid (i - j)a$, donc $p \mid i - j$ (lemme d’Euclide, car $p \nmid a$), d’où
          $i = j$. Aucun n’est divisible par $p$. Leurs restes sont donc exactement
          $1, 2, \ldots, p - 1$, dans un autre ordre, et

          $$
          \begin{aligned}
          &a \times 2a \times \cdots \times (p - 1)a \\
          &\equiv 1 \times 2 \times \cdots \times (p - 1) \ [p],
          \end{aligned}
          $$

          soit $a^{p-1}(p - 1)! \equiv (p - 1)! \ [p]$. Comme $(p - 1)!$ est premier avec $p$, on peut
          simplifier (Gauss) : $a^{p-1} \equiv 1 \ [p]$. Enfin, $a^p \equiv a \ [p]$ vaut aussi quand
          $p \mid a$, les deux membres étant alors congrus à $0$.`,
      },
      {
        type: 'methode',
        title: 'Réduire un exposant',
        body: md`Modulo un premier $p$, on peut réduire l’exposant modulo $p - 1$. Par exemple
          $3^6 \equiv 1 \ [7]$ et $2026 = 6 \times 337 + 4$, donc
          $3^{2026} \equiv 3^4 = 81 \equiv 4 \ [7]$.`,
      },
      {
        type: 'definition',
        title: 'Indicatrice d’Euler (L2)',
        body: md`Pour $n \ge 1$, $\varphi(n)$ est le nombre d’entiers de $\llbracket 1, n \rrbracket$
          premiers avec $n$. Pour $p$ premier, $\varphi(p) = p - 1$ et $\varphi(p^k) = p^k - p^{k-1}$ ;
          de plus $\varphi(mn) = \varphi(m)\varphi(n)$ si $\pgcd(m, n) = 1$. Exemple :
          $\varphi(12) = \varphi(4)\varphi(3) = 2 \times 2 = 4$ (les entiers $1, 5, 7, 11$).`,
      },
      {
        type: 'theoreme',
        title: 'Euler (L2)',
        body: md`Si $\pgcd(a, n) = 1$, alors $a^{\varphi(n)} \equiv 1 \ [n]$. La preuve est celle de
          Fermat, en multipliant par $a$ les $\varphi(n)$ restes premiers avec $n$.`,
      },
      {
        type: 'piege',
        title: 'La réciproque est fausse',
        body: md`Avoir $a^{n-1} \equiv 1 \ [n]$ pour un certain $a$ ne prouve pas que $n$ est premier.
          Pire : $561 = 3 \times 11 \times 17$ vérifie $a^{560} \equiv 1 \ [561]$ pour **tous** les $a$
          premiers avec $561$. Ces nombres de Carmichael sont en nombre infini (Alford, Granville et
          Pomerance, 1994).`,
      },
      {
        type: 'histoire',
        body: md`Fermat énonce le résultat en 1640 dans une lettre à Frénicle de Bessy, sans preuve :
          il la lui enverrait bien, « s’il n’appréhendait d’être trop long ». Euler en rédige une
          démonstration en 1736, puis la généralisation avec $\varphi$ en 1763. Ce « petit »
          théorème est aujourd’hui au cœur des tests de primalité et du chiffrement RSA.`,
      },
    ],
  },
  {
    id: 'diophantiennes',
    title: 'Équations ax + by = c',
    level: 'Tle',
    blocks: [
      {
        type: 'theoreme',
        body: md`Soient $a, b$ non nuls et $d = \pgcd(a, b)$. L’équation $ax + by = c$ a des solutions
          entières si et seulement si $d \mid c$.`,
      },
      {
        type: 'demo',
        body: md`Si $(x, y)$ est solution, $d$ divise $ax + by = c$. Réciproquement, si $c = dk$,
          Bézout donne $au + bv = d$, et $(uk, vk)$ est solution.`,
      },
      {
        type: 'methode',
        title: 'Résoudre en trois temps',
        body: md`1. Diviser par $d$ : on se ramène à $a'x + b'y = c'$ avec $\pgcd(a', b') = 1$.
          2. Trouver une solution particulière $(x_0, y_0)$, à vue ou par Bézout.
          3. Soustraire : $a'(x - x_0) = -b'(y - y_0)$. Comme $a'$ divise $b'(y - y_0)$ et est premier
             avec $b'$, Gauss donne $a' \mid y - y_0$. On obtient

          $$
          x = x_0 + b'k, \quad y = y_0 - a'k \quad (k \in \Z),
          $$

          puis on vérifie que ces couples sont bien solutions.`,
      },
      {
        type: 'exemple',
        body: md`$5x + 3y = 1$ : $(2, -3)$ est solution, donc les solutions sont les
          $(2 + 3k, -3 - 5k)$, $k \in \Z$.`,
      },
      {
        type: 'piege',
        title: 'Oublier de diviser par d',
        body: md`Pour $6x + 4y = 2$, la solution $(1, -1)$ ne donne pas toutes les solutions sous la
          forme $(1 + 4k, -1 - 6k)$ : il en manque une sur deux, comme $(3, -4)$. Après division par
          $2$, $3x + 2y = 1$ donne les solutions $(1 + 2k, -1 - 3k)$.`,
      },
    ],
  },
  {
    id: 'chinois-rsa',
    title: 'Théorème chinois et RSA',
    level: 'L2',
    blocks: [
      {
        type: 'theoreme',
        title: 'Théorème chinois',
        body: md`Si $\pgcd(m, n) = 1$, le système

          $$
          \begin{cases} x \equiv a \ [m] \\ x \equiv b \ [n] \end{cases}
          $$

          a des solutions, et elles forment une seule classe modulo $mn$.`,
      },
      {
        type: 'methode',
        title: 'Construire la solution',
        body: md`On écrit $mu + nv = 1$ (Bézout). Le nombre $nv$ est congru à $1$ modulo $m$ et à
          $0$ modulo $n$ ; $mu$ fait l’inverse. Donc $x = a \cdot nv + b \cdot mu$ convient, et les
          solutions sont les $x + kmn$, $k \in \Z$.`,
      },
      {
        type: 'demo',
        body: md`La formule donne une solution. Si $x$ et $x'$ sont deux solutions, $m$ et $n$
          divisent $x - x'$ ; étant premiers entre eux, $mn \mid x - x'$ (conséquence de Gauss).
          Réciproquement, $x + kmn$ est solution pour tout $k$.`,
      },
      {
        type: 'methode',
        title: 'Le principe de RSA',
        body: md`1. Choisir deux grands premiers $p \ne q$, poser $n = pq$ et $\varphi(n) = (p - 1)(q - 1)$.
          2. Choisir $e$ premier avec $\varphi(n)$, puis calculer $d$, inverse de $e$ modulo
             $\varphi(n)$ : $ed \equiv 1 \ [\varphi(n)]$.
          3. La clé publique est $(n, e)$ et la clé privée $d$. On chiffre un message $m < n$ en
             $c = m^e \bmod n$, et on le déchiffre par $m = c^d \bmod n$.

          Casser RSA reviendrait, en l’état des connaissances, à factoriser $n$ : personne ne sait le
          faire en un temps raisonnable pour des nombres de plus de 600 chiffres.`,
      },
      {
        type: 'demo',
        title: 'Pourquoi le déchiffrement marche',
        body: md`On a $ed = 1 + k\varphi(n)$. Si $\pgcd(m, n) = 1$, Euler donne
          $c^d \equiv m^{ed} = m \cdot \left(m^{\varphi(n)}\right)^k \equiv m \ [n]$. Dans le cas
          général, on montre de même que $m^{ed} \equiv m$ modulo $p$ et modulo $q$ (Fermat, en
          traitant à part le cas où $p \mid m$), puis on conclut par le théorème chinois.`,
      },
      {
        type: 'histoire',
        body: md`Le problème de Sun Zi, écrit entre le IIIe et le Ve siècle, demande un nombre qui
          laisse $2$ quand on le divise par $3$, $3$ par $5$ et $2$ par $7$ : la réponse $23$ y est
          obtenue par cette méthode. RSA a été publié en 1977 par Rivest, Shamir et Adleman ; on a
          appris en 1997 que Clifford Cocks, au service britannique du chiffre, avait trouvé le même
          système dès 1973, resté secret.`,
      },
    ],
  },
];

const exercises = [
  {
    id: 'arith-dernier-chiffre',
    section: 'congruences',
    title: 'Le dernier chiffre de 7²⁰²⁶',
    difficulty: 1,
    level: 'Tle',
    kind: 'calcul',
    statement: md`Quel est le chiffre des unités de $7^{2026}$ ?`,
    hints: [
      md`Le chiffre des unités d’un entier, c’est son reste modulo $10$.`,
      md`Calcule $7^1, 7^2, 7^3, 7^4$ modulo $10$ : tu dois retomber sur $1$.`,
    ],
    answer: { type: 'number', value: 9 },
    solution: md`Le chiffre des unités est le reste modulo $10$. Les premières puissances de $7$
      donnent :

      | $k$ | $1$ | $2$ | $3$ | $4$ |
      |---|---|---|---|---|
      | $7^k \bmod 10$ | $7$ | $9$ | $3$ | $1$ |

      Ainsi $7^4 \equiv 1 \ [10]$. Comme $2026 = 4 \times 506 + 2$,

      $$
      7^{2026} = \left(7^4\right)^{506} \times 7^2 \equiv 1 \times 49 \equiv 9 \ [10].
      $$

      Le chiffre des unités de $7^{2026}$ est $\mathbf{9}$.`,
  },
  {
    id: 'arith-vf-divise-produit',
    section: 'pgcd',
    title: 'Diviser un produit',
    difficulty: 1,
    level: 'Tle',
    kind: 'vrai-faux',
    statement: md`Vrai ou faux : pour tous entiers $a, b, c$ avec $a \ne 0$, si $a \mid bc$, alors
      $a \mid b$ ou $a \mid c$.`,
    hints: [md`Essaie avec $a = 6$.`],
    answer: { type: 'truefalse', value: false },
    solution: md`**Faux.** Contre-exemple : $6 \mid 2 \times 3$, mais $6 \nmid 2$ et $6 \nmid 3$.

      L’énoncé devient vrai dans deux cas importants :

      - si $a$ est **premier** (lemme d’Euclide) ;
      - si $a$ est **premier avec** $b$ : alors $a \mid c$ (théorème de Gauss).`,
  },
  {
    id: 'arith-critere-11',
    section: 'congruences',
    title: 'Critère de divisibilité par 11',
    difficulty: 1,
    level: 'Tle',
    kind: 'demo',
    statement: md`Soit $n = \overline{a_p a_{p-1} \ldots a_1 a_0}$ l’écriture décimale d’un entier
      naturel. Montrer que $n$ est divisible par $11$ si et seulement si la somme alternée de ses
      chiffres

      $$
      S = a_0 - a_1 + a_2 - \cdots + (-1)^p a_p
      $$

      l’est. Application : $918\,082$ est-il divisible par $11$ ?`,
    hints: [md`Que vaut $10$ modulo $11$ ?`],
    solution: md`On a $10 \equiv -1 \ [11]$, donc $10^k \equiv (-1)^k \ [11]$ pour tout $k \in \N$.
      Par compatibilité avec la somme et le produit :

      $$
      n = \sum_{k=0}^{p} a_k 10^k \equiv \sum_{k=0}^{p} (-1)^k a_k = S \ [11].
      $$

      $n$ et $S$ ont donc le même reste modulo $11$ ; en particulier $11 \mid n \iff 11 \mid S$.

      **Application.** Pour $918\,082$, en partant des unités :
      $S = 2 - 8 + 0 - 8 + 1 - 9 = -22$, divisible par $11$. Donc $918\,082$ est divisible par
      $11$ ; en effet, $918\,082 = 11 \times 83\,462$.`,
  },
  {
    id: 'arith-diviseurs-360',
    section: 'premiers',
    title: 'Les diviseurs de 360',
    difficulty: 1,
    level: 'Tle',
    kind: 'calcul',
    statement: md`Combien l’entier $360$ a-t-il de diviseurs positifs ?`,
    hints: [md`Commence par décomposer $360$ en facteurs premiers.`],
    answer: { type: 'number', value: 24 },
    solution: md`On décompose : $360 = 2^3 \times 3^2 \times 5$. Un diviseur positif s’écrit
      $2^\alpha \times 3^\beta \times 5^\gamma$ avec $0 \le \alpha \le 3$, $0 \le \beta \le 2$ et
      $0 \le \gamma \le 1$, et deux choix différents donnent deux diviseurs différents (unicité de
      la décomposition). Il y en a donc

      $$
      (3 + 1)(2 + 1)(1 + 1) = 24.
      $$

      Bonus : leur somme vaut $(1 + 2 + 4 + 8)(1 + 3 + 9)(1 + 5) = 15 \times 13 \times 6 = 1\,170$.`,
  },
  {
    id: 'arith-congruence-lineaire',
    section: 'congruences',
    title: 'Une équation modulo 23',
    difficulty: 2,
    level: 'Tle',
    kind: 'calcul',
    statement: md`Résoudre dans $\Z$ l’équation $17x \equiv 5 \ [23]$. Donne la solution comprise
      entre $0$ et $22$.`,
    hints: [
      md`Cherche un inverse de $17$ modulo $23$ : un entier $v$ tel que $17v \equiv 1 \ [23]$.`,
      md`L’algorithme d’Euclide sur $23$ et $17$, remonté, donne $3 \times 23 - 4 \times 17 = 1$.`,
    ],
    answer: { type: 'number', value: 3 },
    solution: md`**Inverse de 17 modulo 23.** Euclide : $23 = 1 \times 17 + 6$, $17 = 2 \times 6 + 5$,
      $6 = 1 \times 5 + 1$. En remontant :

      $$
      \begin{aligned}
      1 &= 6 - 5 = 6 - (17 - 2 \times 6) \\
      &= 3 \times 6 - 17 \\
      &= 3 \times (23 - 17) - 17 \\
      &= 3 \times 23 - 4 \times 17.
      \end{aligned}
      $$

      Donc $17 \times (-4) \equiv 1 \ [23]$ : $-4 \equiv 19$ est un inverse de $17$.

      **Résolution.** Multiplier par $19$ est réversible (on peut remultiplier par $17$), donc

      $$
      17x \equiv 5 \ [23] \iff x \equiv 19 \times 5 = 95 \equiv 3 \ [23].
      $$

      Les solutions sont les $x = 3 + 23k$, $k \in \Z$ ; entre $0$ et $22$, c’est $\mathbf{3}$.
      Vérification : $17 \times 3 = 51 = 2 \times 23 + 5$.`,
  },
  {
    id: 'arith-pgcd-parametre',
    section: 'pgcd',
    title: 'Un PGCD qui dépend de n',
    difficulty: 2,
    level: 'Tle',
    kind: 'qcm',
    statement: md`Pour quels entiers naturels $n$ a-t-on $\pgcd(n + 4, \, 2n + 3) = 5$ ?`,
    hints: [
      md`Un diviseur commun à $n + 4$ et $2n + 3$ divise toute combinaison des deux.`,
      md`Calcule $2(n + 4) - (2n + 3)$.`,
    ],
    answer: {
      type: 'choice',
      options: [
        md`Pour aucun $n$`,
        md`Exactement quand $n$ est impair`,
        md`Exactement quand $n \equiv 1 \ [5]$`,
        md`Exactement quand $n \equiv 4 \ [5]$`,
      ],
      correct: 2,
    },
    solution: md`Soit $d = \pgcd(n + 4, 2n + 3)$. Il divise $2(n + 4) - (2n + 3) = 5$, donc
      $d \in \{1, 5\}$, et

      $$
      d = 5 \iff 5 \mid n + 4 \text{ et } 5 \mid 2n + 3.
      $$

      Or $5 \mid n + 4 \iff n \equiv 1 \ [5]$, et dans ce cas $2n + 3 \equiv 2 + 3 \equiv 0 \ [5]$
      automatiquement. Le PGCD vaut donc $5$ **exactement quand $n \equiv 1 \ [5]$**, et $1$ sinon.
      Exemple : $n = 6$ donne $\pgcd(10, 15) = 5$.`,
  },
  {
    id: 'arith-diophante',
    section: 'diophantiennes',
    title: 'L’équation 7x − 12y = 3',
    difficulty: 2,
    level: 'Tle',
    kind: 'calcul',
    statement: md`1. Résoudre dans $\Z^2$ l’équation $7x - 12y = 3$.
      2. Combien de solutions $(x, y)$ vérifient $0 \le x \le 100$ ?`,
    hints: [
      md`$\pgcd(7, 12) = 1$ divise $3$ : il y a des solutions. Cherche-en une petite à vue, avec des
        nombres négatifs.`,
      md`$(x, y) = (-3, -2)$ convient. Soustrais, puis applique le théorème de Gauss.`,
    ],
    answer: { type: 'number', value: 8 },
    solution: md`**1.** $\pgcd(7, 12) = 1$ divise $3$ : l’équation a des solutions, par exemple
      $(-3, -2)$ puisque $7 \times (-3) - 12 \times (-2) = -21 + 24 = 3$.

      Si $(x, y)$ est solution, en soustrayant : $7(x + 3) = 12(y + 2)$. Ainsi $12$ divise
      $7(x + 3)$ et est premier avec $7$ : par Gauss, $12 \mid x + 3$. On écrit $x = -3 + 12k$ ; en
      reportant, $7 \times 12k = 12(y + 2)$, donc $y = -2 + 7k$.

      Réciproquement, $7(-3 + 12k) - 12(-2 + 7k) = -21 + 24 = 3$. Les solutions sont donc

      $$
      (x, y) = (-3 + 12k, \; -2 + 7k), \qquad k \in \Z.
      $$

      **2.** $0 \le -3 + 12k \le 100 \iff \frac{3}{12} \le k \le \frac{103}{12} \approx 8{,}6$,
      soit $k \in \{1, \ldots, 8\}$ : il y a **8** solutions, de $(9, 5)$ à $(93, 54)$.`,
  },
  {
    id: 'arith-code-jumeaux',
    section: 'premiers',
    title: 'Premiers jumeaux',
    difficulty: 2,
    level: 'L1',
    kind: 'code',
    statement: md`Deux nombres premiers $p$ et $p + 2$ sont dits **jumeaux** : $(3, 5)$, $(5, 7)$,
      $(11, 13)$… Écris un programme qui compte les couples de premiers jumeaux tels que
      $p + 2 < 10^6$.`,
    hints: [
      md`Crible d’Ératosthène jusqu’à $10^6$ : un tableau de booléens, où l’on barre les multiples
        de chaque premier à partir de son carré.`,
      md`Pour tester ton programme : il y a $35$ couples avec $p + 2 < 1\,000$.`,
    ],
    answer: { type: 'number', value: 8169 },
    solution: md`Un crible d’Ératosthène, puis un comptage. En Python :

      ~~~python
      N = 10**6
      est_premier = [True] * N
      est_premier[0] = est_premier[1] = False
      for i in range(2, int(N**0.5) + 1):
          if est_premier[i]:
              for j in range(i * i, N, i):
                  est_premier[j] = False
      print(sum(1 for p in range(2, N - 2) if est_premier[p] and est_premier[p + 2]))
      ~~~

      On trouve **8 169** couples. Le crible coûte de l’ordre de $N \ln \ln N$ opérations.

      On ne sait pas s’il existe une infinité de premiers jumeaux. Viggo Brun a montré en 1919 que
      la somme de leurs inverses converge (vers la constante de Brun, environ $1{,}902$), alors que
      celle des inverses de tous les premiers diverge.`,
  },
  {
    id: 'arith-code-parfaits',
    section: 'premiers',
    title: 'Nombres parfaits',
    difficulty: 2,
    level: 'L1',
    kind: 'code',
    statement: md`Un entier $n \ge 2$ est **parfait** s’il est égal à la somme de ses diviseurs
      positifs autres que lui-même : $6 = 1 + 2 + 3$ est parfait. Calcule la somme des nombres
      parfaits inférieurs à $10\,000$.`,
    hints: [
      md`Pour chaque $n$, parcours les diviseurs $d \le \sqrt{n}$ : ils vont par paires $(d, n/d)$.`,
      md`Il n’y a que quatre nombres parfaits sous $10\,000$.`,
    ],
    answer: { type: 'number', value: 8658 },
    solution: md`~~~python
      def somme_diviseurs_stricts(n):
          s, d = 1, 2
          while d * d <= n:
              if n % d == 0:
                  s += d
                  if d * d != n:
                      s += n // d
              d += 1
          return s

      parfaits = [n for n in range(2, 10_000) if somme_diviseurs_stricts(n) == n]
      print(parfaits, sum(parfaits))
      ~~~

      On trouve $6, 28, 496, 8\,128$, de somme **8 658**.

      Ce n’est pas un hasard : $6 = 2 \times 3$, $28 = 4 \times 7$, $496 = 16 \times 31$ et
      $8\,128 = 64 \times 127$ sont de la forme $2^{p-1}(2^p - 1)$ avec $2^p - 1$ premier (Euclide),
      et Euler a montré que tous les nombres parfaits **pairs** sont de cette forme. On ignore s’il
      existe un nombre parfait impair.`,
  },
  {
    id: 'arith-n5-moins-n',
    section: 'fermat',
    title: 'n⁵ − n est divisible par 30',
    difficulty: 3,
    level: 'Tle',
    kind: 'demo',
    statement: md`Montrer que pour tout entier $n$, $30$ divise $n^5 - n$.`,
    hints: [
      md`$30 = 2 \times 3 \times 5$, avec des facteurs premiers entre eux deux à deux.`,
      md`Factorise : $n^5 - n = (n - 1)n(n + 1)(n^2 + 1)$. Et pour $5$, pense à Fermat.`,
    ],
    solution: md`On factorise : $n^5 - n = n(n^4 - 1) = (n - 1)n(n + 1)(n^2 + 1)$.

      - **Par 2 et par 3.** $(n - 1)n(n + 1)$ est le produit de trois entiers consécutifs : l’un
        d’eux est pair, et l’un d’eux est multiple de $3$.
      - **Par 5.** Le petit théorème de Fermat donne $n^5 \equiv n \ [5]$ pour tout entier $n$,
        c’est-à-dire $5 \mid n^5 - n$.

      Ainsi $2$, $3$ et $5$ divisent $n^5 - n$. Comme ils sont premiers entre eux deux à deux, leur
      produit aussi (conséquence du théorème de Gauss, appliquée deux fois) : $30 \mid n^5 - n$.

      *Variante sans Fermat :* $n^2 + 1 \equiv n^2 - 4 = (n - 2)(n + 2) \ [5]$, si bien que
      $n^5 - n$ est congru modulo $5$ au produit des cinq entiers consécutifs
      $(n - 2)(n - 1)n(n + 1)(n + 2)$, dont l’un est multiple de $5$.`,
  },
  {
    id: 'arith-rsa',
    section: 'chinois-rsa',
    title: 'Une clé RSA à la main',
    difficulty: 3,
    level: 'L2',
    kind: 'calcul',
    statement: md`Alice fabrique une clé RSA avec $p = 11$ et $q = 13$, donc $n = 143$, et choisit
      l’exposant public $e = 7$.

      1. Calculer $\varphi(n)$ et vérifier que $e$ est un exposant valable.
      2. Déterminer sa clé privée : l’entier $d \in \llbracket 1, \varphi(n) - 1 \rrbracket$ tel que
         $ed \equiv 1 \ [\varphi(n)]$.`,
    hints: [
      md`$\varphi(pq) = (p - 1)(q - 1)$ pour deux premiers distincts.`,
      md`Applique l’algorithme d’Euclide à $120$ et $7$, puis remonte.`,
    ],
    answer: { type: 'number', value: 103 },
    solution: md`**1.** $\varphi(143) = (11 - 1)(13 - 1) = 120 = 2^3 \times 3 \times 5$. Le premier $7$
      ne divise pas $120$, donc $\pgcd(7, 120) = 1$ : $e = 7$ est valable.

      **2.** On cherche l’inverse de $7$ modulo $120$. Euclide donne tout de suite
      $120 = 17 \times 7 + 1$, d’où

      $$
      \begin{gathered}
      1 = 120 - 17 \times 7, \\
      \text{donc } 7 \times (-17) \equiv 1 \ [120].
      \end{gathered}
      $$

      Ainsi $d \equiv -17 \equiv 103 \ [120]$ : la clé privée est $\mathbf{d = 103}$. Vérification :
      $7 \times 103 = 721 = 6 \times 120 + 1$.

      *Pour aller plus loin :* le message $m = 2$ se chiffre en $c = 2^7 \bmod 143 = 128$, et l’on
      retrouve bien $128^{103} \equiv 2 \ [143]$.`,
  },
  {
    id: 'arith-soldats',
    section: 'chinois-rsa',
    title: 'Les soldats du général Han Xin',
    difficulty: 3,
    level: 'L2',
    kind: 'probleme',
    statement: md`Selon la légende, le général Han Xin comptait ses soldats sans les compter : il les
      faisait se ranger par $3$, puis par $5$, puis par $7$, et ne regardait que les restes. Ce
      jour-là, il reste $2$ soldats en rangs de $3$, $3$ soldats en rangs de $5$ et $2$ soldats en
      rangs de $7$. Sachant que la troupe compte entre $100$ et $200$ soldats, combien sont-ils ?`,
    hints: [
      md`Commence par les deux premières conditions : $x \equiv 2 \ [3]$ et $x \equiv 3 \ [5]$
        équivalent à une seule congruence modulo $15$.`,
      md`Les deux premières conditions donnent $x \equiv 8 \ [15]$. Il reste à combiner avec
        $x \equiv 2 \ [7]$.`,
    ],
    answer: { type: 'number', value: 128 },
    solution: md`**Modulo 15.** Parmi $3, 8, 13$ (les entiers $\equiv 3 \ [5]$ entre $0$ et $14$), seul
      $8$ vérifie $8 \equiv 2 \ [3]$. Par le théorème chinois, les deux premières conditions
      équivalent à $x \equiv 8 \ [15]$.

      **Modulo 105.** On cherche $x = 8 + 15k$ avec $8 + 15k \equiv 2 \ [7]$. Comme $8 \equiv 1$ et
      $15 \equiv 1 \ [7]$, cela donne $1 + k \equiv 2 \ [7]$, soit $k \equiv 1 \ [7]$. D’où
      $x \equiv 23 \ [105]$ : c’est la réponse du problème de Sun Zi.

      **Conclusion.** Les solutions sont $23, 128, 233, \ldots$ ; entre $100$ et $200$, il y a
      **128** soldats.`,
  },
  {
    id: 'arith-ordre-1001',
    section: 'fermat',
    title: 'Quand 2ⁿ revient à 1 modulo 1001',
    difficulty: 3,
    level: 'L2',
    kind: 'probleme',
    statement: md`Déterminer le plus petit entier $n \ge 1$ tel que $2^n \equiv 1 \ [1001]$.`,
    hints: [
      md`$1001 = 7 \times 11 \times 13$. D’après le théorème chinois, $2^n \equiv 1 \ [1001]$ équivaut à
        la même congruence modulo $7$, $11$ et $13$.`,
      md`Le plus petit $n \ge 1$ tel que $2^n \equiv 1 \ [p]$ (l’ordre de $2$ modulo $p$) divise tous
        les exposants qui marchent. Calcule-le pour $p = 7$, $11$ et $13$.`,
    ],
    answer: { type: 'number', value: 60 },
    solution: md`Comme $1001 = 7 \times 11 \times 13$, avec des facteurs premiers entre eux,
      $1001 \mid 2^n - 1$ si et seulement si $7$, $11$ et $13$ divisent $2^n - 1$.

      **Un lemme.** Soit $\delta$ le plus petit $n \ge 1$ tel que $2^n \equiv 1 \ [p]$, l’**ordre** de
      $2$ modulo $p$. Alors $2^n \equiv 1 \ [p] \iff \delta \mid n$. En effet, avec $n = \delta q + r$
      et $0 \le r < \delta$, on a $2^n \equiv 2^r$, et $2^r \equiv 1$ force $r = 0$ par minimalité.
      Avec Fermat, l’ordre divise donc $p - 1$.

      **Les trois ordres.**

      - Modulo $7$ : $2^3 = 8 \equiv 1$, l’ordre est $3$.
      - Modulo $11$ : l’ordre divise $10$. Or $2^1 = 2$, $2^2 = 4$ et $2^5 = 32 \equiv -1$ : l’ordre
        est $10$.
      - Modulo $13$ : l’ordre divise $12$. Or $2^1 = 2$, $2^2 = 4$, $2^3 = 8$, $2^4 = 16 \equiv 3$ et
        $2^6 = 64 \equiv -1$ : aucune de ces puissances ne vaut $1$, l’ordre est $12$.

      **Conclusion.** $2^n \equiv 1 \ [1001]$ si et seulement si $3$, $10$ et $12$ divisent $n$,
      c’est-à-dire $\ppcm(3, 10, 12) = 60 \mid n$. Le plus petit est $n = \mathbf{60}$.`,
  },
  {
    id: 'arith-premiers-4k3',
    section: 'premiers',
    title: 'Une infinité de premiers de la forme 4k + 3',
    difficulty: 4,
    level: 'Tle',
    kind: 'demo',
    statement: md`Montrer qu’il existe une infinité de nombres premiers congrus à $3$ modulo $4$.`,
    hints: [
      md`Imite la preuve d’Euclide : suppose qu’il n’y en a qu’un nombre fini, $p_1, \ldots, p_r$, et
        fabrique un nombre bien choisi à partir d’eux.`,
      md`Considère $N = 4p_1 p_2 \cdots p_r - 1$. Quels restes modulo $4$ ses facteurs premiers
        peuvent-ils avoir ?`,
    ],
    solution: md`Supposons qu’il n’y en ait qu’un nombre fini, $p_1, \ldots, p_r$ (il y en a au moins
      un : $3$), et posons

      $$
      N = 4 p_1 p_2 \cdots p_r - 1.
      $$

      $N \ge 11$ est impair et $N \equiv -1 \equiv 3 \ [4]$. Ses facteurs premiers sont impairs, donc
      congrus à $1$ ou $3$ modulo $4$. S’ils étaient tous congrus à $1$, leur produit $N$ le serait
      aussi : impossible. Il existe donc un premier $q \mid N$ avec $q \equiv 3 \ [4]$, c’est-à-dire
      $q = p_i$ pour un certain $i$.

      Mais alors $q$ divise $4 p_1 \cdots p_r$ et $N$, donc leur différence $1$ : absurde.

      *Remarque :* la même idée échoue pour $4k + 1$, car un produit de nombres $\equiv 3$ peut être
      $\equiv 1$. Le résultat reste vrai, et bien plus général : Dirichlet a montré en 1837 que
      toute progression $a + kn$ avec $\pgcd(a, n) = 1$ contient une infinité de premiers.`,
  },
  {
    id: 'arith-wilson',
    section: 'fermat',
    title: 'Le théorème de Wilson',
    difficulty: 4,
    level: 'L1',
    kind: 'demo',
    statement: md`Soit $n \ge 2$. Montrer que $n$ est premier si et seulement si
      $(n - 1)! \equiv -1 \ [n]$.`,
    hints: [
      md`Sens réciproque : si $n = ab$ avec $1 < a < n$, que peut diviser $a$ ?`,
      md`Sens direct : modulo $p$ premier, chaque $x \in \llbracket 1, p - 1 \rrbracket$ a un unique
        inverse dans $\llbracket 1, p - 1 \rrbracket$. Quels $x$ sont leur propre inverse ?`,
    ],
    solution: md`**Si $n$ n’est pas premier.** Écrivons $n = ab$ avec $1 < a < n$. Alors $a$ figure
      dans le produit $(n - 1)!$, donc $a \mid (n - 1)!$. Si l’on avait $(n - 1)! \equiv -1 \ [n]$,
      $a$ diviserait aussi $(n - 1)! + 1$, donc $1$ : absurde.

      **Si $n = p$ est premier.** Pour $p = 2$, $1! = 1 \equiv -1 \ [2]$. Supposons $p \ge 3$. Chaque
      $x \in \llbracket 1, p - 1 \rrbracket$ est premier avec $p$, donc a un inverse modulo $p$
      (Bézout), unique dans $\llbracket 1, p - 1 \rrbracket$. Par le lemme d’Euclide,

      $$
      \begin{aligned}
      &x \text{ est son propre inverse} \\
      \iff\; &x^2 \equiv 1 \ [p] \\
      \iff\; &p \mid (x - 1)(x + 1) \\
      \iff\; &x \equiv \pm 1 \ [p].
      \end{aligned}
      $$

      Les entiers $2, 3, \ldots, p - 2$ se regroupent donc en paires $\{x, x^{-1}\}$ de produit
      $\equiv 1$ : leur produit est congru à $1$, et

      $$
      (p - 1)! \equiv 1 \times 1 \times (p - 1) \equiv -1 \ [p].
      $$

      *Culture :* le résultat porte le nom de John Wilson (XVIIIe siècle), mais Ibn al-Haytham le
      connaissait vers l’an 1000. C’est un test de primalité parfait… et inutilisable :
      calculer $(n - 1)!$ est bien trop long.`,
  },
];

// Euclide étendu sur (a, b) en Markdown : les divisions, puis la table des coefficients
const extendedEuclid = (a, b) => {
  const rows = bezoutRows(a, b);
  const divisions = euclidSteps(a, b)
    .map((s) => raw`$${s.a} = ${s.q} \times ${s.b} + ${s.r}$`)
    .join(', ');
  return { rows, last: rows[rows.length - 1], divisions, table: bezoutTable(rows) };
};

const generators = [
  {
    id: 'arith-gen-puissance',
    section: 'congruences',
    title: 'Puissance modulo n',
    difficulty: 1,
    level: 'Tle',
    kind: 'calcul',
    generate: (rng) => {
      let m;
      let a;
      let order = 0;
      // Un a premier avec m dont les puissances reviennent vite à 1 : table courte
      while (order < 2 || order > 6) {
        m = rng.pick([5, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
        a = rng.int(2, m - 1);
        order = 0;
        if (gcd(a, m) === 1) {
          for (let k = 1; k <= m; k += 1) {
            if (modPow(a, k, m) === 1) {
              order = k;
              break;
            }
          }
        }
      }
      const n = rng.int(40, 2030);
      const q = Math.floor(n / order);
      const r = n % order;
      const value = modPow(a, n, m);
      const ks = Array.from({ length: order }, (_, i) => i + 1);
      // Deux lignes, pour tenir sur un écran de téléphone
      const head = raw`\left(${a}^{${order}}\right)^{${q}}`;
      let first = head;
      let second = raw`\equiv 1^{${q}} = 1`;
      if (r === 1) {
        first = raw`${head} \times ${a}`;
        second = raw`\equiv ${a}`;
      }
      if (r > 1) {
        const power = a ** r;
        first = raw`${head} \times ${a}^{${r}}`;
        second = raw`\equiv ${a}^{${r}} = ${power}${power === value ? '' : raw` \equiv ${value}`}`;
      }
      return {
        statement: raw`Déterminer le reste de la division euclidienne de $${a}^{${n}}$ par $${m}$.`,
        answer: { type: 'number', value },
        solution: [
          raw`On calcule les premières puissances de $${a}$ modulo $${m}$ :`,
          '',
          `| $k$ | ${ks.map((k) => `$${k}$`).join(' | ')} |`,
          `|---|${ks.map(() => '---').join('|')}|`,
          raw`| $${a}^k \bmod ${m}$ | ${ks.map((k) => `$${modPow(a, k, m)}$`).join(' | ')} |`,
          '',
          raw`Donc $${a}^{${order}} \equiv 1 \ [${m}]$. La division euclidienne de $${n}$ par $${order}$ s’écrit $${n} = ${order} \times ${q} + ${r}$, d’où`,
          '',
          '$$',
          raw`\begin{aligned} ${a}^{${n}} &= ${first} \\ &${second} \ [${m}]. \end{aligned}`,
          '$$',
          '',
          raw`Le reste est $\mathbf{${value}}$.`,
        ].join('\n'),
      };
    },
  },
  {
    id: 'arith-gen-bezout',
    section: 'pgcd',
    title: 'PGCD et coefficients de Bézout',
    difficulty: 2,
    level: 'Tle',
    kind: 'calcul',
    generate: (rng) => {
      let a = 0;
      let b = 0;
      while (!a) {
        const d = rng.pick([1, 1, 2, 3, 4, 5, 6]);
        const x = rng.int(8, 70);
        const y = rng.int(5, 60);
        const [big, small] = [d * Math.max(x, y), d * Math.min(x, y)];
        if (x !== y && gcd(x, y) === 1 && big <= 420 && euclidSteps(big, small).length >= 3) {
          [a, b] = [big, small];
        }
      }
      const { last, divisions, table } = extendedEuclid(a, b);
      const { r: d, u, v } = last;
      return {
        statement: raw`Déterminer $d = \pgcd(${a}, ${b})$, puis un couple d’entiers $(u, v)$ tel que $${a}u + ${b}v = d$.`,
        answer: {
          type: 'integers',
          ordered: true,
          placeholder: 'd ; u ; v',
          help: 'Trois entiers, dans l’ordre d ; u ; v. Plusieurs couples (u, v) conviennent.',
          expected: `${d} ; ${u} ; ${v}`,
          validate: (vals) => vals.length === 3 && vals[0] === d && a * vals[1] + b * vals[2] === d,
        },
        solution: [
          raw`**Algorithme d’Euclide :** ${divisions}. Le dernier reste non nul est $d = ${d}$.`,
          '',
          raw`**Coefficients.** On écrit chaque reste sous la forme $r = ${a}u + ${b}v$ : une ligne s’obtient à partir des deux précédentes, en retranchant $q$ fois la dernière.`,
          '',
          table,
          '',
          raw`La dernière ligne donne $${a} \times ${paren(u)} + ${b} \times ${paren(v)} = ${d}$ : $\mathbf{(u, v) = (${u}, ${v})}$ convient.`,
          '',
          raw`Les autres couples s’obtiennent en ajoutant $${b / d}k$ à $u$ et en retranchant $${a / d}k$ à $v$, pour $k \in \Z$.`,
        ].join('\n'),
      };
    },
  },
  {
    id: 'arith-gen-inverse',
    section: 'congruences',
    title: 'Inverse modulaire',
    difficulty: 2,
    level: 'Tle',
    kind: 'calcul',
    generate: (rng) => {
      let m = 1;
      let a = 1;
      while (gcd(a, m) !== 1 || a < 2) {
        m = rng.pick([11, 13, 17, 19, 23, 26, 29, 31, 35, 37, 41, 43, 47]);
        a = rng.int(2, m - 2);
      }
      const { last, divisions, table } = extendedEuclid(m, a);
      const inverse = mod(last.v, m);
      const k = (a * inverse - 1) / m;
      return {
        statement: raw`Déterminer un inverse de $${a}$ modulo $${m}$, c’est-à-dire un entier $x$ tel que $${a}x \equiv 1 \ [${m}]$.`,
        answer: {
          type: 'number',
          value: inverse,
          validate: (x) => Number.isInteger(x) && mod(a * x, m) === 1,
        },
        solution: [
          raw`**Euclide :** ${divisions}. Donc $\pgcd(${m}, ${a}) = 1$ : $${a}$ est bien inversible modulo $${m}$.`,
          '',
          raw`**Remontée**, avec $r = ${m}u + ${a}v$ sur chaque ligne :`,
          '',
          table,
          '',
          raw`La dernière ligne donne $${m} \times ${paren(last.u)} + ${a} \times ${paren(last.v)} = 1$. Modulo $${m}$, il reste $${a} \times ${paren(last.v)} \equiv 1$, donc $x \equiv ${last.v === inverse ? inverse : raw`${last.v} \equiv ${inverse}`} \ [${m}]$.`,
          '',
          raw`Vérification : $${a} \times ${inverse} = ${a * inverse} = ${k} \times ${m} + 1$. Les inverses de $${a}$ sont les $x = ${inverse} + ${m}k$, $k \in \Z$.`,
        ].join('\n'),
      };
    },
  },
  {
    id: 'arith-gen-chinois',
    section: 'chinois-rsa',
    title: 'Système de congruences',
    difficulty: 2,
    level: 'L2',
    kind: 'calcul',
    generate: (rng) => {
      let m = 1;
      let n = 1;
      while (m >= n || gcd(m, n) !== 1) {
        m = rng.pick([3, 4, 5, 7, 8, 9]);
        n = rng.pick([5, 7, 8, 9, 11, 13]);
      }
      const a = rng.int(0, m - 1);
      const b = a === 0 ? rng.int(1, n - 1) : rng.int(0, n - 1);
      const total = m * n;
      const [, u, v] = egcd(m, n); // m u + n v = 1
      const e1 = n * v; // ≡ 1 [m], ≡ 0 [n]
      const e2 = m * u; // ≡ 0 [m], ≡ 1 [n]
      const sum = a * e1 + b * e2;
      const x = mod(sum, total);
      return {
        statement: [
          raw`Déterminer l’unique entier $x \in \llbracket 0, ${total - 1} \rrbracket$ tel que`,
          '',
          '$$',
          raw`\begin{cases} x \equiv ${a} \ [${m}] \\ x \equiv ${b} \ [${n}] \end{cases}`,
          '$$',
        ].join('\n'),
        answer: {
          type: 'number',
          value: x,
          validate: (y) => Number.isInteger(y) && mod(y, m) === a && mod(y, n) === b,
        },
        solution: [
          raw`$\pgcd(${m}, ${n}) = 1$ : par le théorème chinois, il y a une unique solution modulo $${total}$.`,
          '',
          raw`**Bézout.** $${m} \times ${paren(u)} + ${n} \times ${paren(v)} = 1$ (Euclide étendu). On en tire :`,
          '',
          raw`- $e_1 = ${n} \times ${paren(v)} = ${e1}$, qui vérifie $e_1 \equiv 1 \ [${m}]$ et $e_1 \equiv 0 \ [${n}]$ ;`,
          raw`- $e_2 = ${m} \times ${paren(u)} = ${e2}$, qui vérifie $e_2 \equiv 0 \ [${m}]$ et $e_2 \equiv 1 \ [${n}]$.`,
          '',
          sum === x
            ? raw`**Solution.** $x = ${a}e_1 + ${b}e_2 = ${sum}$ convient.`
            : raw`**Solution.** $x = ${a}e_1 + ${b}e_2 = ${sum}$ convient, et $${sum} \equiv ${x} \ [${total}]$.`,
          '',
          raw`Dans $\llbracket 0, ${total - 1} \rrbracket$ : $\mathbf{x = ${x}}$. Vérification : $${x} = ${m} \times ${Math.floor(x / m)} + ${a}$ et $${x} = ${n} \times ${Math.floor(x / n)} + ${b}$.`,
        ].join('\n'),
      };
    },
  },
];

export default {
  id: 'arithmetique',
  domain: 'algebre',
  title: 'Arithmétique',
  levels: 'Tle → L2',
  summary: 'Divisibilité, congruences, PGCD, nombres premiers, et jusqu’au chiffrement RSA.',
  lesson,
  exercises,
  generators,
};
