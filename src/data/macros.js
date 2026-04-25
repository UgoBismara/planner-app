// ─────────────────────────────────────────────────────────────────────────────
// Références CIQUAL 2020 (ANSES) — valeurs pour 100 g de portion comestible
// ─────────────────────────────────────────────────────────────────────────────
// Céréales (crus/secs)
//   Spaghetti crus        : 371 kcal  G:74  L:1.1  P:13
//   Riz basmati cru       : 358 kcal  G:80  L:0.3  P:7
//   Semoule crue          : 357 kcal  G:72  L:1.1  P:12
//   Flocons d'avoine      : 372 kcal  G:60  L:7    P:13
//   Farine T55            : 364 kcal  G:74  L:1.1  P:10.5
//   Riz rond cru          : 353 kcal  G:79  L:0.5  P:6.5
//   Pain complet          : 247 kcal  G:45  L:2.5  P:9
//   Pain de mie           : 268 kcal  G:49  L:3.5  P:8
//   Brioche               : 390 kcal  G:48  L:18   P:8
//   Farine de sarrasin    : 335 kcal  G:64  L:3    P:13
//   Chapelure             : 385 kcal  G:74  L:4    P:13
//
// Viandes (crues)
//   Blanc de poulet       : 110 kcal  G:0   L:1.8  P:23
//   Blanc de dinde        : 107 kcal  G:0   L:1.0  P:23
//   Cuisse de poulet      : 175 kcal  G:0   L:10   P:21
//   Bœuf haché 15 % MG   : 196 kcal  G:0   L:13   P:19
//   Agneau haché          : 260 kcal  G:0   L:20   P:18
//   Bœuf à braiser        : 150 kcal  G:0   L:6    P:22
//   Lardons fumés         : 290 kcal  G:0.5 L:24   P:16
//   Saucisses de Morteau  : 330 kcal  G:0.5 L:28   P:17
//   Saucisses fumées      : 280 kcal  G:2   L:24   P:14
//   Poitrine fumée        : 380 kcal  G:0   L:33   P:19
//   Jambon blanc          : 140 kcal  G:0   L:4    P:25
//
// Poissons (crus)
//   Saumon atlantique     : 208 kcal  G:0   L:13   P:21
//   Daurade               :  97 kcal  G:0   L:2    P:19
//   Moules cuites         :  86 kcal  G:3.7 L:2.1  P:12
//   Thon en conserve      : 190 kcal  G:0   L:11   P:22
//
// Œufs & Lait
//   Œuf entier (60 g/u)   : 155 kcal  G:1.1 L:11   P:13  (pour 100 g)
//   Lait entier           :  64 kcal  G:4.9 L:3.6  P:3.2
//   Yaourt grec entier    : 133 kcal  G:4   L:10   P:6
//   Fromage blanc 20 %    :  92 kcal  G:4.1 L:5    P:8
//   Crème fraîche 30 %    : 290 kcal  G:3.7 L:30   P:2.4
//   Gruyère               : 396 kcal  G:0.5 L:31   P:29
//   Parmesan              : 431 kcal  G:0   L:29   P:38
//   Emmental              : 382 kcal  G:0.3 L:29   P:28
//   Fromage de chèvre fr. : 260 kcal  G:2   L:21   P:15
//   Mozzarella            : 255 kcal  G:2.5 L:20   P:16
//   Beurre                : 717 kcal  G:0.1 L:81   P:0.9
//
// Matières grasses
//   Huile d'olive         : 900 kcal  G:0   L:100  P:0
//
// Légumineuses
//   Lentilles corail cru  : 349 kcal  G:57  L:1    P:25
//   Lentilles vertes cru  : 322 kcal  G:46  L:1.4  P:27
//   Pois chiches boîte    : 130 kcal  G:17  L:2.5  P:7
//   Haricots rouges boîte :  93 kcal  G:14  L:0.5  P:6.5
//
// Légumes (crus)
//   Pomme de terre        :  77 kcal  G:17  L:0.1  P:2
//   Courgette             :  17 kcal  G:2.5 L:0.3  P:1.3
//   Aubergine             :  23 kcal  G:3.5 L:0.2  P:1
//   Tomate                :  18 kcal  G:3.1 L:0.2  P:0.9
//   Tomates concassées    :  24 kcal  G:3.8 L:0.2  P:1.2
//   Carotte               :  38 kcal  G:7   L:0.2  P:1
//   Poivron rouge         :  31 kcal  G:5.8 L:0.3  P:1
//   Oignon                :  40 kcal  G:8.5 L:0.1  P:1.1
//   Champignons de Paris  :  22 kcal  G:0.3 L:0.5  P:3.1
//   Brocoli               :  33 kcal  G:3.3 L:0.4  P:3.5
//   Butternut             :  45 kcal  G:9   L:0.1  P:1
//   Épinards frais        :  22 kcal  G:1.4 L:0.4  P:2.9
//   Lait de coco boîte    : 180 kcal  G:3   L:18   P:2
//   Olives vertes         : 150 kcal  G:0   L:15   P:1.5
//
// Fruits
//   Banane                :  90 kcal  G:22  L:0.2  P:1.1
//   Pomme                 :  52 kcal  G:13  L:0.2  P:0.3
//   Avocat                : 167 kcal  G:0.7 L:16   P:2
//   Myrtilles             :  57 kcal  G:12  L:0.4  P:0.7
//   Framboises            :  32 kcal  G:5.5 L:0.7  P:1.2
//   Kiwi                  :  61 kcal  G:13  L:0.5  P:1.2
//   Raisins secs          : 307 kcal  G:72  L:0.4  P:3
//
// Divers
//   Miel                  : 303 kcal  G:80  L:0    P:0.3
//   Sucre blanc           : 400 kcal  G:100 L:0    P:0
//   Granola               : 450 kcal  G:63  L:18   P:8
//   Graines de chia       : 490 kcal  G:42  L:31   P:17
//   Graines de tournesol  : 580 kcal  G:15  L:50   P:20
//   Noix                  : 659 kcal  G:7   L:65   P:15
//   Amandes               : 600 kcal  G:7   L:52   P:21
//   Beurre de cacahuète   : 597 kcal  G:20  L:51   P:25
//   Chocolat noir 70 %    : 576 kcal  G:42  L:43   P:8
//   Cacao non sucré       : 355 kcal  G:55  L:12   P:20
// ─────────────────────────────────────────────────────────────────────────────

// Macros par portion calculées depuis les ingrédients × quantités ÷ nb portions
export const RECIPE_MACROS = {
  // ── Plats principaux ──────────────────────────────────────────────────────
  // 1. Pâtes carbonara (×2 → /2) : 100g spagh G74+L1+P13 · 1œuf G0.7+L6.6+P7.8 · 50g lardons G0.3+L12+P8 · 25g parmesan G0+L7.2+P9.5
  1:  { glucides: 75, lipides: 27, proteines: 38 },
  // 2. Poulet rôti (×4 → /4) : ~250g poulet rôti G0+L25+P52 · 5ml huile L4.5
  2:  { glucides:  0, lipides: 22, proteines: 48 },
  // 3. Soupe lentilles (×4 → /4) : 50g lentilles G28.5+L0.5+P12.5 · 50g carottes G3.5+L0.1+P0.5 · 5ml huile L4.5
  3:  { glucides: 30, lipides:  4, proteines: 11 },
  // 4. Salade niçoise (×2 → /2) : 1 œuf dur G0.7+L6.6+P7.8 · 93g thon G0+L10.2+P20.5 · légumes G4 · vinaigrette G1+L7
  4:  { glucides:  8, lipides: 16, proteines: 22 },
  // 5. Quiche lorraine (×6 → /6) : pâte 1/6 (≈60g) G11+L8+P2 · 33g lardons G0.2+L8+P5.3 · ½œuf G0.4+L3.3+P3.9 · 33ml crème G1.2+L10+P0.8 · 10g gruyère G0+L3.1+P2.9
  5:  { glucides: 26, lipides: 32, proteines: 18 },
  // 6. Risotto champignons (×4 → /4) : 75g riz cru G60+L0.2+P5.3 · 75g champignons G0.2+L0.4+P2.3 · 37ml vin G0.7 · 12.5g parmesan G0+L3.6+P4.8 · 7.5g beurre G0+L6.1+P0
  6:  { glucides: 60, lipides: 14, proteines: 14 },
  // 7. Omelette herbes : 3 œufs G1.9+L19.8+P23.4 · 10g beurre G0+L8.1+P0
  7:  { glucides:  2, lipides: 26, proteines: 22 },
  // 8. Curry pois chiches (×4 → /4) : 100g pois chiches G17+L2.5+P7 · 100ml lait coco G3+L18+P2 · 50g tomates G1.9+L0.1+P0.6 · 50g riz G40+L0.15+P3.5 · 5g pâte curry ~L2
  8:  { glucides: 65, lipides: 22, proteines: 16 },
  // 9. Saumon papillote (×2 → /2) : 150g saumon G0+L19.5+P31.5 · 75g courgette G1.9+L0.2+P1 · 7.5ml huile L6.8
  9:  { glucides:  3, lipides: 18, proteines: 34 },
  // 10. Gratin courgettes (×4 → /4) : 250g courgettes G6.3+L0.8+P3.3 · ½œuf G0.3+L3.3+P3.9 · 37ml crème G1.4+L11+P0.9 · 20g gruyère G0.1+L6.2+P5.8
  10: { glucides:  8, lipides: 22, proteines: 14 },
  // 11. Steak haché (×2 → /2) : 200g bœuf 15% G0+L26+P38 · 1 œuf G0.7+L6.6+P7.8 · 15g chapelure G11+L0.6+P2
  11: { glucides:  6, lipides: 34, proteines: 44 },
  // 12. Soupe à l'oignon (×4 → /4) : 100g oignon G8.5+L0.1+P1.1 · 37ml vin G0.5 · 1 tranche pain G11+L0.9+P2.3 · 20g gruyère G0.1+L6.2+P5.8 · 10g beurre G0+L8.1+P0
  12: { glucides: 26, lipides: 14, proteines: 14 },
  // 13. Pâtes bolognaise (×4 → /4) : 100g pâtes G74+L1.1+P13 · 100g bœuf G0+L13+P19 · légumes G5 · sauce tomate G3 · 25ml vin rouge G0.75
  13: { glucides: 80, lipides: 18, proteines: 36 },
  // 14. Taboulé (×4 → /4) : 50g semoule crue G36+L0.6+P6 · 50g tomates G1.6+L0.1+P0.5 · 50g concombre G1.1 · herbes G1 · 11ml huile L9.9
  14: { glucides: 44, lipides:  8, proteines:  7 },
  // 15. Poulet basquaise (×4 → /4) : 250g poulet rôti G0+L25+P52 · 75g poivrons G4.4+L0.2+P0.8 · 100g tomates G3.1+L0.2+P0.9 · 37ml vin G0.75
  15: { glucides: 10, lipides: 20, proteines: 45 },
  // 16. Velouté butternut (×4 → /4) : 200g butternut G18+L0.2+P2 · 50ml lait coco G1.5+L9+P1 · 5ml huile L4.5 · oignon G2
  16: { glucides: 18, lipides: 11, proteines:  3 },
  // 17. Tarte flambée (×4 → /4) : pâte 75g G19+L3+P2 · 50g fromage blanc+crème G2.1+L12+P4.5 · 50g oignon G4.3 · 37g lardons G0.2+L8.9+P5.9
  17: { glucides: 30, lipides: 22, proteines: 14 },
  // 18. Poêlée légumes (×2 → /2) : 250g légumes variés G9+L0.6+P2.6 · 15ml huile L13.5
  18: { glucides: 14, lipides: 13, proteines:  4 },
  // 19. Moules marinières (×2 → /2) : 400g chair moules G14.8+L8.4+P48 · 10g beurre G0+L8.1+P0 · 75ml vin G1.5
  19: { glucides:  8, lipides: 12, proteines: 34 },
  // 20. Gratin dauphinois (×6 → /6) : 167g pommes de terre G28.4+L0.2+P3.3 · 83ml crème G3.1+L24.9+P2 · 17g gruyère G0.1+L5.3+P4.9 · 3g beurre L2.4
  20: { glucides: 40, lipides: 34, proteines: 12 },
  // 21. Salade César (×2 → /2) : 100g poulet grillé G0+L1.8+P23 · 25g croûtons G10+L2+P1.5 · 20g parmesan G0+L5.8+P7.6 · sauce G3+L8
  21: { glucides: 20, lipides: 20, proteines: 32 },
  // 22. Lentilles saucisses (×4 → /4) : 75g lentilles G34.5+L1.1+P20.3 · 150g saucisse Morteau G0.75+L42+P25.5
  22: { glucides: 50, lipides: 28, proteines: 38 },
  // 23. Pizza maison (×4 → /4) : pâte 75g G18+L1.5+P2.5 · sauce G3 · 62g mozzarella G1.6+L12.4+P9.9 · garnitures G4+L4+P6
  23: { glucides: 50, lipides: 18, proteines: 22 },
  // 24. Daurade au four (×2 → /2) : 175g daurade G0+L3.5+P33.3 · 7.5ml huile L6.8 · légumes G2
  24: { glucides:  2, lipides: 14, proteines: 40 },
  // 25. Wok tofu (×2 → /2) : 100g tofu G0.8+L5+P8 · 150g légumes G8+L0.5+P3 · 7.5ml huile sésame L6.8
  25: { glucides: 12, lipides: 10, proteines: 12 },
  // 26. Bœuf bourguignon (×6 → /6) : 167g bœuf G0+L10+P36.7 · 33g lardons G0.2+L7.9+P5.3 · légumes G8 · 125ml vin G2.5
  26: { glucides: 10, lipides: 28, proteines: 48 },
  // 27. Soupe minestrone (×4 → /4) : 50g haricots blancs G8+L0.3+P3.5 · légumes G10 · 25g pâtes G18.5+L0.3+P3.3 · 10g parmesan G0+L2.9+P3.8
  27: { glucides: 40, lipides:  6, proteines: 12 },
  // 28. Crêpes salées (×4 → /4 soit 2 gal/pers) : 50g farine sarrasin G32+L1.5+P6.5 · ½ œuf G0.3+L3.3+P3.9 · garnitures (jambon 50g G0+L2+P12.5 · fromage 30g G0.1+L8.7+P8.4)
  28: { glucides: 34, lipides: 12, proteines: 18 },
  // 29. Tajine poulet (×4 → /4) : 225g poulet G0+L22.5+P47.3 · olives 25g G0+L3.8+P0.4 · légumes G5
  29: { glucides:  6, lipides: 20, proteines: 44 },
  // 30. Tian légumes (×4 → /4) : 200g légumes variés G9+L0.5+P2.5 · 11ml huile L9.9
  30: { glucides: 14, lipides: 10, proteines:  3 },

  // ── Batch cooking ─────────────────────────────────────────────────────────
  // 31. Chili con carne (×4 → /4) : 100g bœuf G0+L13+P19 · 100g harg.rouges G14+L0.5+P6.5 · 100g tomates G3.8+L0.2+P1.2
  31: { glucides: 26, lipides: 12, proteines: 24 },
  // 32. Ratatouille (×4 → /4) : 200g légumes var. G8+L0.3+P2 · 11ml huile L9.9
  32: { glucides: 14, lipides: 10, proteines:  3 },
  // 33. Hachis parmentier (×4 → /4) : 200g pommes de terre G34+L0.2+P4 · 100g bœuf G0+L13+P19 · 12.5g beurre G0+L10.1+P0 · 25ml lait G1.2+L0.9+P0.8 · 15g gruyère G0.1+L4.7+P4.4
  33: { glucides: 50, lipides: 22, proteines: 28 },
  // 34. Dhal lentilles (×4 → /4) : 62g lentilles corail G35.3+L0.6+P15.5 · 50ml lait coco G1.5+L9+P1 · 50g tomates G1.9+L0.1+P0.6 · épices G2
  34: { glucides: 40, lipides: 14, proteines: 16 },
  // 35. Lasagnes (×6 → /6) : 33g lasagnes G24.7+L0.4+P4.3 · 67g bœuf G0+L8.7+P12.7 · sauce tom. G3 · béchamel: 8g beurre L6.5 + 8g farine G5.9+P0.8 + 83ml lait G4.1+L3+P2.7 · 17g gruyère L5.3+P4.9
  35: { glucides: 44, lipides: 22, proteines: 28 },
  // 36. Boulettes sauce tomate (×4 → /4) : 125g viande G0+L20+P22.5 · 200g tomates G7.6+L0.4+P2.4 · ½œuf G0.3+L3.3+P3.9 · 7.5g chapelure G5.6+P1
  36: { glucides: 14, lipides: 16, proteines: 28 },
  // 37. Couscous poulet (×4 → /4) : 200g cuisse poulet G0+L20+P42 · 50g semoule G36+L0.6+P6 · légumes G6
  37: { glucides: 64, lipides: 14, proteines: 38 },
  // 38. Cake salé jambon (×8 → /8) : 25g farine G18.5+L0.3+P2.6 · 37.5g bœuf+porc G0+L6+P6.8 · ⅜ œuf G0.25+L2.5+P2.9 · 12ml huile L10.8 · 12ml lait G0.6+L0.4+P0.4 · 12.5g jambon G0+L0.5+P3.1 · 6g olives G0+L0.9+P0.1 · 10g gruyère L3.1+P2.9
  38: { glucides: 22, lipides: 18, proteines: 12 },
  // 39. Chili végétarien (×4 → /4) : 100g harg.rouges G14+L0.5+P6.5 · 100g pois chiches G17+L2.5+P7 · 100g tomates G3.8+L0.2+P1.2 · légumes G4
  39: { glucides: 38, lipides:  6, proteines: 14 },
  // 40. Potée au chou (×4 → /4) : 100g saucisses fumées G2+L24+P14 · 37g poitrine fumée G0+L12.2+P7 · légumes G15 · 100g pommes de terre G17+L0.1+P2
  40: { glucides: 26, lipides: 34, proteines: 30 },
  // 41. Moussaka (×6 → /6) : 83g agneau G0+L16.7+P15 · légumes G8 · béchamel légère G6+L5+P3 · 10g gruyère L3.1+P2.9
  41: { glucides: 14, lipides: 20, proteines: 26 },
  // 42. Soupe légumes (×4 → /4) : 250g légumes var. G14+L0.5+P3 · 5ml huile L4.5
  42: { glucides: 20, lipides:  3, proteines:  3 },
  // 43. Poulet tikka masala (×4 → /4) : 150g poulet G0+L2.7+P34.5 · 100ml lait coco G3+L18+P2 · 50g tomates G1.9 · épices G2
  43: { glucides: 10, lipides: 22, proteines: 38 },
  // 44. Pain de viande (×6 → /6) : 100g viande hachée G0+L16+P18 · ⅓ œuf G0.2+L2.2+P2.6 · 8g chapelure G6.2+P1 · légumes G4
  44: { glucides:  6, lipides: 14, proteines: 28 },
  // 45. Gratin pâtes jambon (×4 → /4) : 75g pâtes G55.5+L0.8+P9.8 · 50g jambon G0+L2+P12.5 · béchamel: 7.5g beurre L6.1 + 7.5g farine G5.6+P0.8 + 100ml lait G4.9+L3.6+P3.2 · 20g gruyère L6.2+P5.8
  45: { glucides: 54, lipides: 24, proteines: 28 },

  // ── Petit-déjeuner ────────────────────────────────────────────────────────
  // 46. Porridge fruits rouges : 80g flocons G48+L5.6+P10.4 · 300ml lait G14.7+L10.8+P9.6 · 100g fruits rouges G8+L0.5+P1 · 1cs miel G16+L0+P0 · 1cs chia G4.9+L3.6+P2
  46: { glucides: 58, lipides:  9, proteines: 14 },
  // 47. Pancakes : 150g farine G111+L1.7+P15.8 · 2 œufs G1.3+L13.2+P15.6 · 150ml lait G7.4+L5.4+P4.8 · 1cs sucre G12 · 1cs huile G0+L9+P0 → /4 gros pancakes (1 portion)
  47: { glucides: 62, lipides: 14, proteines: 14 },
  // 48. Avocado toast œuf poché : 2 tranches pain complet G90+L5+P18 · ½ avocat (75g) G0.5+L12+P1.5 · 2 œufs G1.3+L13.2+P15.6 · roquette G0.5
  48: { glucides: 26, lipides: 28, proteines: 20 },
  // 49. Bowl yaourt granola : 200g yaourt grec G8+L20+P12 · 50g granola G31.5+L9+P4 · 1 banane (120g) G26.4+L0.2+P1.3 · framboises 50g G2.8+L0.4+P0.6 · 1cs miel G8
  49: { glucides: 46, lipides: 12, proteines: 14 },
  // 50. Œufs brouillés crémeux : 3 œufs G1.9+L19.8+P23.4 · 2cs crème G0.7+L5.6+P0.5 · 10g beurre G0+L8.1+P0 · 2 tranches pain de mie G23+L1.6+P3.8
  50: { glucides: 20, lipides: 28, proteines: 20 },
  // 51. Smoothie bowl épinards : 2 bananes (240g) G52.8+L0.5+P2.6 · épinards 30g G0.4+L0.1+P0.9 · 100ml lait végétal G5+L2+P0.5 · granola 40g G25.2+L7.2+P3.2 · kiwi (76g) G9.9+L0.4+P0.9
  51: { glucides: 52, lipides:  7, proteines:  8 },
  // 52. Pain perdu cannelle : 4 tranches brioche (120g) G57.6+L21.6+P9.6 · 2 œufs G1.3+L13.2+P15.6 · 100ml lait G4.9+L3.6+P3.2 · 1cs sucre G12 · 10g beurre L8.1
  52: { glucides: 56, lipides: 20, proteines: 14 },
  // 53. Bircher muesli : 80g flocons G48+L5.6+P10.4 · 150ml lait G7.4+L5.4+P4.8 · 1 pomme (150g) G19.5+L0.3+P0.5 · 1cs miel G16 · 1cs raisins G7.2+L0.1+P0.7 · noix 20g G1.4+L13+P3
  53: { glucides: 62, lipides: 12, proteines: 12 },
  // 54. Tartines fromage blanc : 3 tranches pain complet G135+L7.5+P27 → 90g : G40.5+L2.3+P8.1 · 150g fromage blanc G6.2+L7.5+P12 · 1cs miel G16 · noix 20g G1.4+L13+P3
  54: { glucides: 42, lipides:  6, proteines: 14 },
  // 55. Galette sarrasin œuf : 2 galettes (~120g cuites) G38.4+L4.2+P15.6 · 1 œuf G0.7+L6.6+P7.8 · 20g emmental G0.1+L5.8+P5.6
  55: { glucides: 32, lipides: 20, proteines: 18 },

  // ── Goûter ────────────────────────────────────────────────────────────────
  // 56. Banana bread (×8 → /8) : 37.5g farine G27.8+L0.4+P3.9 · ⅜ banane (112g) G24.6+L0.2+P1.2 · ¼ œuf G0.2+L1.7+P2 · 10g sucre G10 · 7.5g beurre L6.1
  56: { glucides: 40, lipides: 10, proteines:  6 },
  // 57. Energy balls (4u) : 25g flocons G15+L1.8+P3.3 · 20g beurre cacahuète G4+L10.2+P5 · ½cs cacao G2.8+L0.6+P1 · ½cs miel G4 · ½cs chia G2.5+L1.8+P1 · pépites G3.6+L2.7+P0.5
  57: { glucides: 20, lipides: 12, proteines:  8 },
  // 58. Muffins myrtilles (×12 → 1u) : 17g farine G12.6+L0.2+P1.8 · 8g sucre G8.3 · ½ œuf/6 G0.2+L1.1+P1.3 · 7ml huile G0+L6.3+P0 · 8ml lait G0.4+L0.3+P0.3 · 12g myrtilles G1.4+L0.1+P0.1
  58: { glucides: 36, lipides:  9, proteines:  5 },
  // 59. Cookies (×12 → 2u) : 33g farine G24.5+L0.4+P3.5 · 20g beurre L16.2 · 16g sucre brun G16.7 · ⅙ œuf G0.1+L1.1+P1.3 · 25g pépites G12+L9+P1.8
  59: { glucides: 32, lipides: 12, proteines:  4 },
  // 60. Yaourt miel noix : 200g yaourt grec G8+L20+P12 · 1cs miel G16 · 30g noix G2.1+L19.5+P4.5
  60: { glucides: 22, lipides: 16, proteines: 10 },
  // 61. Tartines beurre cacahuète banane : 2 tranches pain complet (60g) G27+L1.5+P5.4 · 2cs beurre cacahuète (30g) G6+L15.3+P7.5 · 1 banane (120g) G26.4+L0.2+P1.3 · 1cs miel G8
  61: { glucides: 42, lipides: 16, proteines: 10 },
  // 62. Crêpes sucrées (×8 → 2u) : 62.5g farine G46.3+L0.7+P6.6 · ¾ œuf G0.5+L5+P5.9 · 125ml lait G6.1+L4.5+P4 · 7g sucre G7 · 7.5g beurre L6.1 → 2 crêpes/pers
  62: { glucides: 46, lipides:  8, proteines:  9 },
  // 63. Pomme cuite cannelle : 2 pommes (300g) G39+L0.6+P0.9 · 2cs miel G32 · amandes effilées 20g G1.4+L10.4+P4.2 · filet citron G0.5
  63: { glucides: 32, lipides:  5, proteines:  2 },
  // 64. Riz au lait : 37.5g riz rond G29.6+L0.2+P2.4 · 175ml lait G8.6+L6.3+P5.6 · 12.5g sucre G12.5 · vanille G0
  64: { glucides: 46, lipides:  7, proteines:  8 },
  // 65. Toast chèvre miel noix : 2 tranches pain complet (60g) G27+L1.5+P5.4 · 60g fromage chèvre frais G1.2+L12.6+P9 · 1cs miel G16 · 15g noix G1+L9.8+P2.3
  65: { glucides: 28, lipides: 18, proteines: 13 },
  // 66. Riz dinde légumes : 90g riz basmati G72+L0.3+P6.3 · 160g dinde G0+L2+P40 · 200g brocolis G6.6+L0.8+P7 · 1.5cs huile (22.5ml=20g) L20
  66: { glucides: 79, lipides: 23, proteines: 53 },
};

// Extrait le nom principal d'un ingrédient (pour le compteur de diversité)
const IGNORED_WORDS = new Set([
  'sel', 'poivre', "d'olive", 'bouillon', 'eau', 'vinaigre', 'levure',
  'muscade', 'laurier', 'épices', 'piment', 'optionnel', 'selon', 'goût',
]);

export function extractFoodName(ingredient) {
  let s = ingredient.toLowerCase().trim();
  s = s.replace(/^[\d,./\s]+\s*(g|kg|ml|l|cl|c\.s\.|c\.c\.|boîtes?|sachets?|tranches?|gousses?|pincées?|filets?|feuilles?|branches?)?\s*(de\s+|d['']\s*|du\s+|des\s+|à\s+la\s+|au\s+)?/i, '');
  s = s.replace(/\s*\(.*?\)/g, '');
  s = s.replace(/\s+(râpé[e]?s?|frais|fraîche[s]?|surgelé[e]?s?|cuit[e]?s?|fumé[e]?s?|haché[e]?s?|mûr[e]?|dénoyauté[e]?s?|concassé[e]?s?|entier[e]?s?|en\s+poudre|moulu[e]?s?).*/, '');
  s = s.replace(/,?\s*(sel|poivre|sel.*poivre|poivre.*sel).*/, '').trim();
  const name = s.trim().split(/\s+/).slice(0, 3).join(' ');
  if (!name || IGNORED_WORDS.has(name.split(' ')[0])) return null;
  return name;
}
