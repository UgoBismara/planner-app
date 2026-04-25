// Calories calculées par portion (1 personne) à partir des ingrédients
// Référence : base CIQUAL (Anses) et tables nutritionnelles courantes
export const RECIPES = [
  {
    id: 1,
    title: "Pâtes carbonara",
    category: "pâtes",
    time: 20,
    // Pour 2 : 200g pâtes crues (680) + 2 œufs (156) + 100g lardons (300) + 50g parmesan (195) = 1331 / 2
    calories: 665,
    ingredients: ["200g de spaghetti (crus)", "2 œufs", "100g de lardons fumés", "50g de parmesan râpé", "Poivre noir", "Sel"],
    steps: [
      "Cuire les pâtes al dente dans de l'eau bouillante salée.",
      "Faire revenir les lardons à sec dans une poêle.",
      "Battre les œufs avec le parmesan et beaucoup de poivre.",
      "Égoutter les pâtes en gardant un peu d'eau de cuisson.",
      "Hors du feu, mélanger les pâtes avec les lardons puis verser le mélange œufs/parmesan.",
      "Ajouter un peu d'eau de cuisson pour lier la sauce. Servir immédiatement."
    ]
  },
  {
    id: 2,
    title: "Poulet rôti aux herbes",
    category: "viande",
    time: 90,
    // Pour 4 : 1 poulet ~1.5kg → chair cuite ~900g (1350) + 2 c.s. huile (240) = 1590 / 4
    calories: 400,
    ingredients: ["1 poulet entier", "2 gousses d'ail", "1 citron", "Herbes de Provence", "Huile d'olive", "Sel, poivre"],
    steps: [
      "Préchauffer le four à 200°C.",
      "Frotter le poulet avec l'ail écrasé, le jus de citron, l'huile d'olive et les herbes.",
      "Saler et poivrer généreusement à l'intérieur et à l'extérieur.",
      "Placer le citron coupé en deux à l'intérieur du poulet.",
      "Enfourner 1h15 en arrosant régulièrement avec le jus de cuisson."
    ]
  },
  {
    id: 3,
    title: "Soupe de lentilles",
    category: "soupe",
    time: 40,
    batchCooking: true,
    // Pour 4 : 200g lentilles corail (680) + 2 carottes (70) + oignon (40) + 1 c.s. huile (90) = 880 / 4
    calories: 220,
    ingredients: ["200g de lentilles corail (crues)", "1 oignon", "2 carottes", "1 c.c. de cumin", "1 c.c. de curcuma", "Bouillon de légumes", "Huile d'olive"],
    steps: [
      "Faire revenir l'oignon émincé dans l'huile.",
      "Ajouter les carottes coupées en rondelles, le cumin et le curcuma.",
      "Incorporer les lentilles rincées et couvrir de bouillon.",
      "Cuire 25 minutes à feu doux jusqu'à ce que les lentilles soient tendres.",
      "Mixer partiellement selon la texture désirée. Ajuster l'assaisonnement."
    ]
  },
  {
    id: 4,
    title: "Salade niçoise",
    category: "salade",
    time: 15,
    // Pour 2 : 2 œufs (156) + thon 185g (195) + légumes (80) + vinaigrette 2 c.s. (120) = 551 / 2
    calories: 275,
    ingredients: ["2 œufs durs", "1 boîte de thon", "Tomates cerises", "Olives noires", "Haricots verts cuits", "Anchois (optionnel)", "Vinaigrette"],
    steps: [
      "Cuire les œufs durs 10 minutes, les écaler et les couper en quartiers.",
      "Disposer la salade, les tomates, les haricots verts dans un plat.",
      "Ajouter le thon émietté, les œufs, les olives et les anchois.",
      "Arroser de vinaigrette à l'huile d'olive et au citron."
    ]
  },
  {
    id: 5,
    title: "Quiche lorraine",
    category: "tarte",
    time: 50,
    batchCooking: true,
    // Pour 6 : pâte brisée (900) + 200g lardons (600) + 3 œufs (234) + 200ml crème (700) + 100ml lait (60) + 60g gruyère (240) = 2734 / 6
    calories: 455,
    ingredients: ["1 pâte brisée", "200g de lardons", "3 œufs", "200ml de crème fraîche", "100ml de lait", "Gruyère râpé", "Sel, poivre, muscade"],
    steps: [
      "Préchauffer le four à 180°C. Foncer la pâte dans un moule.",
      "Faire revenir les lardons et les répartir sur la pâte.",
      "Battre les œufs avec la crème, le lait, sel, poivre et muscade.",
      "Verser l'appareil sur les lardons. Parsemer de gruyère.",
      "Cuire 35 minutes jusqu'à ce que la quiche soit dorée et prise."
    ]
  },
  {
    id: 6,
    title: "Risotto aux champignons",
    category: "riz",
    time: 35,
    // Pour 4 : 300g riz arborio (1080) + 300g champignons (60) + 150ml vin blanc (110) + 50g parmesan (195) + 30g beurre (225) = 1670 / 4
    calories: 420,
    ingredients: ["300g de riz arborio (cru)", "300g de champignons", "1 oignon", "150ml de vin blanc", "1L de bouillon", "Parmesan", "Beurre"],
    steps: [
      "Faire revenir l'oignon dans le beurre, ajouter les champignons.",
      "Incorporer le riz et le nacrer 2 minutes.",
      "Verser le vin blanc et laisser absorber.",
      "Ajouter le bouillon chaud louche par louche en remuant.",
      "Après 18-20 min, hors du feu, ajouter parmesan et beurre froid. Mantecare."
    ]
  },
  {
    id: 7,
    title: "Omelette aux fines herbes",
    category: "œufs",
    time: 10,
    // Pour 1 : 3 œufs (234) + 10g beurre (75) + herbes (5) = 314
    calories: 315,
    ingredients: ["3 œufs", "Ciboulette", "Persil", "Estragon", "Beurre", "Sel, poivre"],
    steps: [
      "Battre les œufs avec les herbes ciselées, sel et poivre.",
      "Faire fondre le beurre dans une poêle chaude.",
      "Verser les œufs et remuer avec une spatule au centre.",
      "Plier l'omelette en deux quand elle est encore baveuse. Servir."
    ]
  },
  {
    id: 8,
    title: "Curry de pois chiches",
    category: "végétarien",
    time: 30,
    batchCooking: true,
    // Pour 4 : pois chiches 400g (530) + tomates concassées (70) + lait de coco 400ml (840) + pâte curry (60) + épinards (20) + riz 200g cru (730) = 2250 / 4
    calories: 560,
    ingredients: ["1 boîte de pois chiches", "1 boîte de tomates concassées", "1 oignon", "2 c.s. de pâte de curry", "Lait de coco", "Épinards frais", "Riz basmati"],
    steps: [
      "Faire revenir l'oignon, ajouter la pâte de curry et cuire 1 minute.",
      "Ajouter les tomates concassées et les pois chiches égouttés.",
      "Verser le lait de coco et laisser mijoter 15 minutes.",
      "Incorporer les épinards en fin de cuisson. Servir avec le riz."
    ]
  },
  {
    id: 9,
    title: "Saumon en papillote",
    category: "poisson",
    time: 25,
    // Pour 2 : 2 pavés saumon 300g (540) + courgette (30) + 1 c.s. huile (90) = 660 / 2
    calories: 330,
    ingredients: ["2 pavés de saumon (crus, ~150g chacun)", "1 citron", "Aneth", "1 courgette", "1 c.s. d'huile d'olive", "Sel, poivre"],
    steps: [
      "Préchauffer le four à 200°C.",
      "Déposer chaque pavé sur une feuille de papier cuisson.",
      "Ajouter des rondelles de courgette, citron, aneth, huile, sel et poivre.",
      "Fermer les papillotes hermétiquement.",
      "Cuire 18 minutes au four."
    ]
  },
  {
    id: 10,
    title: "Gratin de courgettes",
    category: "légumes",
    time: 45,
    batchCooking: true,
    // Pour 4 : 4 courgettes (120) + 2 œufs (156) + 150ml crème (525) + 80g gruyère (320) = 1121 / 4
    calories: 280,
    ingredients: ["4 courgettes", "2 œufs", "150ml de crème fraîche", "Gruyère râpé", "Ail", "Herbes de Provence", "Sel, poivre"],
    steps: [
      "Préchauffer le four à 180°C.",
      "Couper les courgettes en rondelles et les faire revenir à l'ail.",
      "Battre les œufs avec la crème, sel, poivre et herbes.",
      "Disposer les courgettes dans un plat, verser l'appareil.",
      "Couvrir de gruyère et cuire 30 minutes."
    ]
  },
  {
    id: 11,
    title: "Steak haché maison",
    category: "viande",
    time: 15,
    // Pour 2 : 400g bœuf haché 15%MG (840) + 1 œuf (78) + chapelure 30g (110) = 1028 / 2
    calories: 515,
    ingredients: ["400g de bœuf haché (cru)", "1 œuf", "Chapelure", "Persil", "Sel, poivre", "Moutarde (optionnel)"],
    steps: [
      "Mélanger la viande avec l'œuf, un peu de chapelure, persil, sel et poivre.",
      "Former des steaks et les saisir à feu vif 3 minutes par côté.",
      "Servir avec une salade verte ou des pommes de terre."
    ]
  },
  {
    id: 12,
    title: "Soupe à l'oignon",
    category: "soupe",
    time: 50,
    // Pour 4 : 4 oignons (200) + 150ml vin blanc (110) + 4 tranches pain (280) + 80g gruyère (320) + 40g beurre (300) = 1210 / 4
    calories: 300,
    ingredients: ["4 gros oignons", "1L de bouillon de bœuf", "150ml de vin blanc", "Baguette", "Gruyère râpé", "Beurre", "Sel, poivre"],
    steps: [
      "Faire caraméliser les oignons émincés dans le beurre 30 minutes.",
      "Déglacer au vin blanc, ajouter le bouillon et cuire 15 min.",
      "Verser dans des bols allant au four, poser une tranche de pain.",
      "Couvrir de gruyère et gratiner sous le grill."
    ]
  },
  {
    id: 13,
    title: "Pâtes bolognaise",
    category: "pâtes",
    time: 45,
    batchCooking: true,
    // Pour 4 : 400g viande hachée (840) + 400g spaghetti crus (1360) + légumes (150) + sauce tomate (120) + 100ml vin rouge (85) = 2555 / 4
    calories: 640,
    ingredients: ["400g de viande hachée (crue)", "1 oignon", "2 carottes", "Sauce tomate", "Vin rouge", "400g de spaghetti (crus)", "Parmesan"],
    steps: [
      "Faire revenir oignon et carottes en brunoise, ajouter la viande.",
      "Déglacer au vin rouge, incorporer la sauce tomate.",
      "Laisser mijoter 30 minutes à feu doux.",
      "Servir sur les pâtes cuites al dente avec du parmesan."
    ]
  },
  {
    id: 14,
    title: "Taboulé",
    category: "salade",
    time: 20,
    // Pour 4 : 200g semoule (690) + tomates 200g (36) + concombre 200g (24) + herbes (10) + 3 c.s. huile (360) + jus citron (15) = 1135 / 4
    calories: 285,
    ingredients: ["200g de semoule (crue)", "Tomates", "Concombre", "Menthe fraîche", "Persil", "Citron", "Huile d'olive"],
    steps: [
      "Verser de l'eau bouillante sur la semoule et laisser gonfler 10 minutes.",
      "Ajouter tous les légumes coupés en petits dés.",
      "Incorporer les herbes ciselées, jus de citron et huile d'olive.",
      "Réfrigérer au moins 1 heure avant de servir."
    ]
  },
  {
    id: 15,
    title: "Poulet basquaise",
    category: "viande",
    time: 60,
    batchCooking: true,
    // Pour 4 : 1 poulet (1350) + 3 poivrons (120) + 4 tomates (80) + 150ml vin blanc (110) = 1660 / 4
    calories: 415,
    ingredients: ["1 poulet découpé", "3 poivrons", "4 tomates", "1 oignon", "Ail", "Piment d'Espelette", "Vin blanc"],
    steps: [
      "Faire dorer les morceaux de poulet, réserver.",
      "Faire revenir oignon, ail et poivrons coupés en lanières.",
      "Ajouter les tomates concassées, le vin blanc et le piment.",
      "Remettre le poulet et laisser mijoter 40 minutes."
    ]
  },
  {
    id: 16,
    title: "Velouté de butternut",
    category: "soupe",
    time: 35,
    batchCooking: true,
    // Pour 4 : butternut 800g (200) + lait de coco 200ml (420) + oignon (40) + 1 c.s. huile (90) = 750 / 4
    calories: 190,
    ingredients: ["1 courge butternut", "1 oignon", "Gingembre frais", "Lait de coco", "Bouillon", "Huile d'olive"],
    steps: [
      "Faire revenir l'oignon, ajouter la butternut coupée en cubes.",
      "Incorporer le gingembre râpé et le bouillon.",
      "Cuire 20 minutes, ajouter le lait de coco.",
      "Mixer finement et ajuster l'assaisonnement."
    ]
  },
  {
    id: 17,
    title: "Tarte flambée",
    category: "tarte",
    time: 25,
    // Pour 4 : pâte fine (400) + fromage blanc 200g (160) + crème 100ml (350) + oignons (80) + lardons 150g (450) = 1440 / 4
    calories: 360,
    ingredients: ["Pâte fine (ou pâte à pain)", "Fromage blanc", "Crème fraîche", "Oignons", "Lardons", "Muscade"],
    steps: [
      "Préchauffer le four à 250°C (très chaud).",
      "Étaler la pâte très finement sur une plaque.",
      "Mélanger fromage blanc et crème, étaler sur la pâte.",
      "Répartir oignons émincés et lardons.",
      "Cuire 10-12 minutes jusqu'à ce que les bords soient croustillants."
    ]
  },
  {
    id: 18,
    title: "Poêlée de légumes",
    category: "végétarien",
    time: 20,
    // Pour 2 : légumes 500g (150) + 2 c.s. huile (240) = 390 / 2
    calories: 195,
    ingredients: ["Courgettes", "Poivrons", "Aubergine", "Tomates cerises", "Ail", "Herbes de Provence", "Huile d'olive"],
    steps: [
      "Couper tous les légumes en dés de taille similaire.",
      "Faire chauffer l'huile dans une grande poêle.",
      "Commencer par l'aubergine, puis ajouter les autres légumes.",
      "Ajouter l'ail et les herbes, cuire 15 minutes en remuant."
    ]
  },
  {
    id: 19,
    title: "Moules marinières",
    category: "poisson",
    time: 20,
    // Pour 2 : 2kg moules → chair ~400g (300) + 30g beurre (225) + 150ml vin blanc (110) = 635 / 2
    calories: 320,
    ingredients: ["2kg de moules", "2 échalotes", "Vin blanc sec", "Persil", "Beurre", "Poivre"],
    steps: [
      "Nettoyer et gratter les moules, jeter celles qui sont ouvertes.",
      "Faire fondre le beurre, ajouter les échalotes émincées.",
      "Verser le vin blanc, ajouter les moules et couvrir à feu vif.",
      "Remuer 5 minutes jusqu'à ce que les moules soient ouvertes.",
      "Parsemer de persil et servir avec du pain."
    ]
  },
  {
    id: 20,
    title: "Gratin dauphinois",
    category: "légumes",
    time: 75,
    batchCooking: true,
    // Pour 6 : 1kg pommes de terre (800) + 500ml crème entière (1750) + 100g gruyère (400) + beurre 20g (150) = 3100 / 6
    calories: 515,
    ingredients: ["1kg de pommes de terre", "500ml de crème fraîche", "2 gousses d'ail", "Gruyère râpé", "Beurre", "Sel, poivre, muscade"],
    steps: [
      "Préchauffer le four à 160°C.",
      "Frotter un plat à gratin avec l'ail et beurrer.",
      "Éplucher et couper les pommes de terre en fines rondelles.",
      "Disposer en couches en assaisonnant entre chaque.",
      "Verser la crème, ajouter le gruyère.",
      "Cuire 1h15 jusqu'à ce que les pommes de terre soient fondantes."
    ]
  },
  {
    id: 21,
    title: "Salade César",
    category: "salade",
    time: 15,
    // Pour 2 : romaine (20) + 200g poulet grillé (280) + croûtons 50g (175) + parmesan 40g (160) + sauce César (150) = 785 / 2
    calories: 390,
    ingredients: ["Salade romaine", "Blanc de poulet grillé", "Croûtons", "Parmesan", "Anchois", "Sauce César (yaourt, citron, ail, moutarde)"],
    steps: [
      "Préparer la sauce en mixant yaourt, jus de citron, ail, moutarde et anchois.",
      "Couper le poulet grillé en lamelles.",
      "Mélanger la salade avec la sauce.",
      "Garnir de poulet, croûtons et copeaux de parmesan."
    ]
  },
  {
    id: 22,
    title: "Lentilles aux saucisses",
    category: "légumineuses",
    time: 40,
    batchCooking: true,
    // Pour 4 : 300g lentilles du Puy (1020) + 4 saucisses Morteau 600g (1380) + légumes (110) = 2510 / 4
    calories: 630,
    ingredients: ["300g de lentilles vertes du Puy (crues)", "4 saucisses de Morteau", "2 carottes", "1 oignon", "Bouquet garni", "Moutarde"],
    steps: [
      "Faire revenir l'oignon, ajouter les carottes et les lentilles.",
      "Couvrir de bouillon avec le bouquet garni.",
      "Ajouter les saucisses piquées à la fourchette.",
      "Cuire 30 minutes. Servir avec de la moutarde."
    ]
  },
  {
    id: 23,
    title: "Pizza maison",
    category: "pizza",
    time: 40,
    // Pour 4 : pâte 300g (810) + sauce tomate (80) + mozzarella 250g (625) + garnitures jambon/champignons (200) = 1715 / 4
    calories: 430,
    ingredients: ["Pâte à pizza (ou achetée)", "Sauce tomate", "Mozzarella", "Garnitures au choix (jambon, champignons, poivrons)", "Origan"],
    steps: [
      "Préchauffer le four à 220°C.",
      "Étaler la pâte sur une plaque farinée.",
      "Étaler la sauce tomate, disposer la mozzarella et les garnitures.",
      "Parsemer d'origan et cuire 12-15 minutes."
    ]
  },
  {
    id: 24,
    title: "Daurade au four",
    category: "poisson",
    time: 35,
    // Pour 2 : daurade 600g → chair ~350g (350) + fenouil (30) + 2 c.s. huile (240) = 620 / 2
    calories: 310,
    ingredients: ["1 daurade entière", "1 citron", "Fenouil", "Ail", "Herbes (thym, persil)", "Huile d'olive", "Sel, poivre"],
    steps: [
      "Préchauffer le four à 200°C.",
      "Inciser la daurade, la farcir d'herbes et d'ail.",
      "Disposer des tranches de fenouil et citron autour.",
      "Arroser d'huile d'olive, saler et poivrer.",
      "Cuire 25-30 minutes selon la taille."
    ]
  },
  {
    id: 25,
    title: "Wok de légumes au tofu",
    category: "végétarien",
    time: 20,
    // Pour 2 : tofu 200g (170) + légumes 300g (90) + sauce soja (20) + 1 c.s. huile sésame (120) = 400 / 2
    calories: 200,
    ingredients: ["200g de tofu ferme", "Brocoli", "Carottes", "Pois gourmands", "Sauce soja", "Gingembre", "Sésame", "Huile de sésame"],
    steps: [
      "Couper le tofu en cubes et le faire dorer à l'huile.",
      "Ajouter les légumes en commençant par les plus durs.",
      "Incorporer le gingembre râpé et la sauce soja.",
      "Cuire 5-7 minutes en remuant. Finir avec l'huile de sésame."
    ]
  },
  {
    id: 26,
    title: "Bœuf bourguignon",
    category: "viande",
    time: 180,
    batchCooking: true,
    // Pour 6 : 1kg bœuf à braiser (2000) + 200g lardons (600) + 300g champignons (60) + légumes (150) + vin rouge 750ml (500) = 3310 / 6
    calories: 550,
    ingredients: ["1kg de bœuf à braiser", "1 bouteille de vin rouge de Bourgogne", "Lardons", "Champignons", "Oignons grelots", "Carottes", "Bouquet garni"],
    steps: [
      "Faire mariner la viande dans le vin toute une nuit.",
      "Faire dorer la viande et les lardons.",
      "Verser la marinade filtrée, ajouter carottes et bouquet garni.",
      "Cuire 2h30 à couvert à feu très doux.",
      "Ajouter champignons et oignons grelots la dernière heure."
    ]
  },
  {
    id: 27,
    title: "Soupe minestrone",
    category: "soupe",
    time: 40,
    batchCooking: true,
    // Pour 4 : légumes 400g (120) + haricots blancs 200g (460) + pâtes 100g (350) + parmesan 40g (160) = 1090 / 4
    calories: 270,
    ingredients: ["Haricots blancs", "Courgettes", "Carottes", "Céleri", "Tomates", "Pâtes courtes", "Basilic", "Parmesan"],
    steps: [
      "Faire revenir céleri, carottes et oignon.",
      "Ajouter les tomates et les légumes, couvrir de bouillon.",
      "Incorporer les haricots et cuire 20 minutes.",
      "Ajouter les pâtes 10 minutes avant la fin.",
      "Servir avec du pesto et du parmesan."
    ]
  },
  {
    id: 28,
    title: "Crêpes salées (galettes)",
    category: "crêpes",
    time: 30,
    // Pour 4 (2 galettes/pers) : 200g farine sarrasin (680) + garnitures jambon/fromage/œuf 4 portions (600) = 1280 / 4
    calories: 320,
    ingredients: ["200g de farine de sarrasin", "1 œuf", "500ml d'eau", "Garnitures : jambon, fromage, œuf"],
    steps: [
      "Mélanger la farine, l'œuf et l'eau pour obtenir une pâte lisse.",
      "Laisser reposer 30 minutes.",
      "Cuire les galettes dans une poêle beurrée.",
      "Garnir selon l'envie : jambon-fromage, champignons-chèvre, etc."
    ]
  },
  {
    id: 29,
    title: "Tajine de poulet aux olives",
    category: "viande",
    time: 60,
    batchCooking: true,
    // Pour 4 : 1 poulet (1350) + olives 100g (145) + citron confit (30) + épices (10) = 1535 / 4
    calories: 385,
    ingredients: ["1 poulet découpé", "Olives vertes", "Citron confit", "Oignon", "Ail", "Cumin", "Coriandre", "Gingembre"],
    steps: [
      "Faire dorer les morceaux de poulet avec l'oignon et l'ail.",
      "Ajouter les épices, le citron confit coupé et les olives.",
      "Verser un peu d'eau et cuire à couvert 45 minutes.",
      "Parsemer de coriandre fraîche. Servir avec du couscous ou du pain."
    ]
  },
  {
    id: 30,
    title: "Tian de légumes",
    category: "légumes",
    time: 60,
    // Pour 4 : légumes 800g (200) + 3 c.s. huile d'olive (360) = 560 / 4
    calories: 140,
    ingredients: ["2 courgettes", "2 tomates", "1 aubergine", "1 oignon", "Thym", "Huile d'olive", "Sel, poivre"],
    steps: [
      "Préchauffer le four à 180°C.",
      "Couper tous les légumes en rondelles fines.",
      "Disposer en alternant dans un plat huilé.",
      "Parsemer de thym, huile d'olive, sel et poivre.",
      "Cuire 45-50 minutes."
    ]
  },

  {
    id: 66,
    title: "Riz dinde légumes",
    category: "viande",
    time: 25,
    // 90g riz basmati cru (322) + 160g blanc de dinde (178) + 200g brocolis (62) + 1,5 c.s. huile (22.5ml=20g → 180) + épices (5) = ~750 kcal
    calories: 750,
    ingredients: ["90g de riz basmati (cru)", "160g de blanc de dinde (cru)", "200g de brocolis (ou courgettes)", "1,5 c.s. d'huile d'olive", "1 gousse d'ail", "Paprika", "Herbes de Provence", "Sel, poivre"],
    steps: [
      "Cuire le riz basmati dans de l'eau bouillante salée (10-12 min), égoutter.",
      "Couper la dinde en lanières, assaisonner de paprika, herbes, sel et poivre.",
      "Faire chauffer l'huile dans une poêle, saisir la dinde 3-4 min de chaque côté.",
      "Retirer la dinde, faire revenir l'ail dans la même poêle.",
      "Ajouter les brocolis (ou courgettes en dés), cuire 5-6 min en remuant.",
      "Remettre la dinde, mélanger avec les légumes 1 minute et servir sur le riz."
    ]
  },

  // ── Recettes batch cooking ────────────────────────────────────────────────
  {
    id: 31,
    title: "Chili con carne",
    category: "viande",
    time: 45,
    batchCooking: true,
    // Pour 4 : 400g bœuf haché (840) + haricots rouges 400g (340) + tomates concassées (70) + oignon (40) = 1290 / 4
    calories: 325,
    ingredients: ["400g de bœuf haché (cru)", "1 boîte de haricots rouges", "1 boîte de tomates concassées", "1 oignon", "2 gousses d'ail", "1 c.c. de cumin", "1 c.c. de paprika fumé", "Piment selon goût", "Sel, poivre"],
    steps: [
      "Faire revenir l'oignon émincé et l'ail dans un filet d'huile.",
      "Ajouter la viande hachée et faire dorer en émiettant.",
      "Assaisonner avec cumin, paprika et piment.",
      "Incorporer les tomates concassées et laisser réduire 10 minutes.",
      "Ajouter les haricots rouges égouttés et laisser mijoter 20 minutes.",
      "Se conserve 4 jours au frigo, se congèle très bien par portions."
    ]
  },
  {
    id: 32,
    title: "Ratatouille",
    category: "légumes",
    time: 60,
    batchCooking: true,
    // Pour 4 : aubergine 400g (70) + courgettes 400g (55) + poivrons 400g (80) + tomates 400g (70) + 3 c.s. huile (360) = 635 / 4
    calories: 160,
    ingredients: ["2 aubergines", "3 courgettes", "3 poivrons", "4 tomates", "2 oignons", "4 gousses d'ail", "Thym", "Basilic", "Huile d'olive", "Sel, poivre"],
    steps: [
      "Couper tous les légumes en dés de 2 cm.",
      "Faire revenir l'oignon et l'ail, puis cuire chaque légume séparément quelques minutes.",
      "Réunir tous les légumes dans la casserole avec thym et laurier.",
      "Couvrir et cuire 30 minutes à feu doux, puis 10 minutes à découvert.",
      "Parsemer de basilic frais. Délicieuse froide aussi, se congèle très bien."
    ]
  },
  {
    id: 33,
    title: "Hachis parmentier",
    category: "viande",
    time: 60,
    batchCooking: true,
    // Pour 4 : 400g bœuf haché (840) + 800g pommes de terre (640) + 50g beurre (375) + 100ml lait (60) + 60g gruyère (240) = 2155 / 4
    calories: 540,
    ingredients: ["400g de bœuf haché (cru)", "800g de pommes de terre", "1 oignon", "50g de beurre", "100ml de lait", "60g de gruyère râpé", "Muscade", "Sel, poivre"],
    steps: [
      "Cuire les pommes de terre à l'eau salée, les écraser en purée avec beurre, lait et muscade.",
      "Faire revenir l'oignon, ajouter la viande et cuire jusqu'à coloration.",
      "Assaisonner et disposer la viande dans un plat à gratin.",
      "Recouvrir de purée et parsemer de gruyère.",
      "Gratiner au four à 200°C pendant 20 minutes. Congèle très bien."
    ]
  },
  {
    id: 34,
    title: "Dhal de lentilles rouges",
    category: "végétarien",
    time: 30,
    batchCooking: true,
    // Pour 4 : 250g lentilles corail (850) + lait de coco 200ml (420) + tomates (70) + oignon (40) + épices (20) = 1400 / 4
    calories: 350,
    ingredients: ["250g de lentilles corail (crues)", "1 boîte de lait de coco", "1 boîte de tomates concassées", "1 oignon", "2 gousses d'ail", "1 c.c. de curcuma", "1 c.c. de garam masala", "1 c.c. de gingembre râpé", "Sel"],
    steps: [
      "Faire revenir l'oignon, l'ail et le gingembre dans l'huile.",
      "Ajouter les épices et cuire 1 minute pour les libérer.",
      "Incorporer les lentilles rincées, les tomates et le lait de coco.",
      "Cuire 20 minutes à feu doux en remuant régulièrement.",
      "Ajuster l'assaisonnement. Servir avec du riz basmati ou du pain naan.",
      "Se congèle parfaitement par portions individuelles."
    ]
  },
  {
    id: 35,
    title: "Lasagnes bolognaise",
    category: "pâtes",
    time: 90,
    batchCooking: true,
    // Pour 6 : bœuf haché 400g (840) + lasagnes 200g (700) + sauce tomate (120) + béchamel (855) + gruyère 100g (400) = 2915 / 6
    calories: 485,
    ingredients: ["400g de viande hachée", "Feuilles de lasagnes", "1 boîte de tomates concassées", "1 oignon", "50g de beurre", "50g de farine", "500ml de lait", "100g de gruyère râpé", "Sel, poivre, muscade"],
    steps: [
      "Préparer la bolognaise : faire revenir l'oignon et la viande, ajouter les tomates, mijoter 20 min.",
      "Préparer la béchamel : faire fondre le beurre, ajouter la farine, verser le lait progressivement, cuire jusqu'à épaississement.",
      "Alterner couches de lasagnes, bolognaise et béchamel dans un grand plat.",
      "Finir par la béchamel et le gruyère râpé.",
      "Cuire à 180°C pendant 40 minutes. Idéal à congeler en portions."
    ]
  },
  {
    id: 36,
    title: "Boulettes en sauce tomate",
    category: "viande",
    time: 45,
    batchCooking: true,
    // Pour 4 : 500g viande hachée (1050) + tomates concassées 800g (140) + chapelure/œuf (158) = 1348 / 4
    calories: 335,
    ingredients: ["500g de viande hachée crue (bœuf ou agneau)", "800g de tomates concassées", "1 œuf", "30g de chapelure", "2 gousses d'ail", "Persil", "1 oignon", "1 c.c. de paprika", "Sel, poivre"],
    steps: [
      "Mélanger la viande avec l'œuf, la chapelure, l'ail, le persil, sel, poivre et paprika.",
      "Former des boulettes de la taille d'une noix.",
      "Faire dorer les boulettes de tous côtés dans une poêle huilée.",
      "Faire revenir l'oignon, ajouter les tomates concassées et les épices.",
      "Plonger les boulettes dans la sauce et mijoter 20 minutes.",
      "Se congèle très bien avec la sauce."
    ]
  },
  {
    id: 37,
    title: "Couscous de poulet",
    category: "viande",
    time: 60,
    batchCooking: true,
    // Pour 4 : 800g cuisses de poulet (1280) + semoule 200g (690) + légumes 500g (170) + épices (10) + 1 c.s. huile (90) = 2240 / 4
    calories: 560,
    ingredients: ["800g de cuisses de poulet (crues)", "200g de semoule (crue)", "2 carottes", "2 courgettes", "1 boîte de pois chiches", "1 oignon", "Ras-el-hanout", "Harissa", "Bouillon de volaille"],
    steps: [
      "Faire dorer les cuisses de poulet avec l'oignon et le ras-el-hanout.",
      "Ajouter les carottes, les pois chiches et couvrir de bouillon.",
      "Cuire 25 minutes, ajouter les courgettes et cuire encore 10 minutes.",
      "Préparer la semoule en versant du bouillon chaud, laisser gonfler 5 min.",
      "Égrener la semoule avec une fourchette. Servir avec de la harissa.",
      "Le bouillon et la viande se congèlent, cuire la semoule fraîche à chaque fois."
    ]
  },
  {
    id: 38,
    title: "Cake salé jambon-olives",
    category: "tarte",
    time: 50,
    batchCooking: true,
    // Pour 8 : 200g farine (700) + 3 œufs (234) + 100ml huile (900) + 100ml lait (60) + 100g jambon (145) + 50g olives (75) + 80g gruyère (320) = 2434 / 8
    calories: 305,
    ingredients: ["200g de farine", "3 œufs", "100ml d'huile d'olive", "100ml de lait", "1 sachet de levure", "100g de jambon en dés", "50g d'olives vertes dénoyautées", "80g de gruyère râpé", "Sel, poivre"],
    steps: [
      "Préchauffer le four à 180°C.",
      "Battre les œufs avec l'huile et le lait.",
      "Incorporer la farine et la levure, saler et poivrer.",
      "Ajouter le jambon, les olives et le gruyère.",
      "Verser dans un moule à cake beurré et cuire 45 minutes.",
      "Se conserve 4 jours au frigo. Idéal pour les pique-niques ou snacks."
    ]
  },
  {
    id: 39,
    title: "Chili végétarien",
    category: "végétarien",
    time: 40,
    batchCooking: true,
    // Pour 4 : haricots rouges 400g (340) + pois chiches 400g (530) + tomates concassées (70) + oignon (40) + 1 c.s. huile (90) = 1070 / 4
    calories: 270,
    ingredients: ["1 boîte de haricots rouges", "1 boîte de pois chiches", "1 boîte de tomates concassées", "1 oignon", "2 gousses d'ail", "1 poivron rouge", "1 c.c. de cumin", "1 c.c. de paprika fumé", "Piment", "Chocolat noir (optionnel)"],
    steps: [
      "Faire revenir l'oignon, l'ail et le poivron dans l'huile.",
      "Ajouter cumin, paprika et piment, cuire 1 minute.",
      "Incorporer les tomates et laisser réduire 10 minutes.",
      "Ajouter haricots rouges et pois chiches égouttés.",
      "Mijoter 20 minutes. Optionnel : ajouter un carré de chocolat noir pour la profondeur.",
      "Se congèle très bien. Servir avec du riz ou des tortillas."
    ]
  },
  {
    id: 40,
    title: "Potée au chou",
    category: "viande",
    time: 90,
    batchCooking: true,
    // Pour 4 : saucisses fumées 400g (1100) + chou 600g (150) + 4 carottes (140) + pommes de terre 400g (320) + lard 150g (550) = 2260 / 4
    calories: 565,
    ingredients: ["1 chou vert", "400g de saucisses fumées", "150g de poitrine fumée", "4 carottes", "400g de pommes de terre", "2 navets", "1 oignon", "Bouquet garni", "Sel, poivre"],
    steps: [
      "Faire revenir la poitrine fumée coupée en lardons.",
      "Ajouter l'oignon, les carottes et les navets.",
      "Incorporer le chou grossièrement coupé et couvrir de bouillon.",
      "Cuire 30 minutes, ajouter les pommes de terre et les saucisses.",
      "Cuire encore 30 minutes à feu doux.",
      "Se conserve et se réchauffe très bien. La saveur s'améliore le lendemain."
    ]
  },
  {
    id: 41,
    title: "Moussaka",
    category: "viande",
    time: 90,
    batchCooking: true,
    // Pour 6 : agneau haché 500g (1150) + aubergines 600g (100) + béchamel légère (505) + sauce tomate (120) + gruyère 60g (240) = 2115 / 6
    calories: 355,
    ingredients: ["500g de viande hachée d'agneau (crue)", "2 aubergines", "1 boîte de tomates concassées", "1 oignon", "Cannelle", "30g de beurre", "30g de farine", "300ml de lait", "60g de gruyère râpé", "Sel, poivre"],
    steps: [
      "Trancher les aubergines et les faire rôtir au four à 200°C, 20 minutes.",
      "Préparer la bolognaise d'agneau avec oignon, tomates, cannelle.",
      "Préparer la béchamel : beurre + farine + lait, cuire jusqu'à épaississement.",
      "Alterner couches d'aubergines et de viande dans un plat à gratin.",
      "Napper de béchamel et parsemer de gruyère.",
      "Cuire 40 minutes à 180°C. Excellente le lendemain, se congèle très bien."
    ]
  },
  {
    id: 42,
    title: "Soupe de légumes maison",
    category: "soupe",
    time: 45,
    batchCooking: true,
    // Pour 4 : 2 carottes (55) + 2 poireaux (65) + 2 pommes de terre (240) + céleri (10) + oignon (40) + 1 c.s. huile (90) = 500 / 4
    calories: 125,
    ingredients: ["2 poireaux", "3 carottes", "2 pommes de terre", "1 branche de céleri", "1 oignon", "1 navet", "Persil", "Bouillon de légumes", "Huile d'olive", "Sel, poivre"],
    steps: [
      "Éplucher et couper tous les légumes en morceaux.",
      "Faire revenir l'oignon et le poireau dans l'huile.",
      "Ajouter les autres légumes et couvrir de bouillon.",
      "Cuire 30 minutes à feu moyen jusqu'à ce que les légumes soient tendres.",
      "Mixer selon la texture désirée — lisse ou avec morceaux.",
      "Se congèle parfaitement en portions. Idéal pour des semaines chargées."
    ]
  },
  {
    id: 43,
    title: "Poulet tikka masala",
    category: "viande",
    time: 40,
    batchCooking: true,
    // Pour 4 : 600g blancs de poulet (660) + lait de coco 400ml (840) + tomates concassées (70) + oignon (40) + épices (20) = 1630 / 4
    calories: 410,
    ingredients: ["600g de blancs de poulet (crus)", "1 boîte de lait de coco", "1 boîte de tomates concassées", "1 oignon", "3 gousses d'ail", "Gingembre frais", "2 c.s. de pâte tandoori", "1 c.c. de garam masala", "Coriandre fraîche"],
    steps: [
      "Couper le poulet en cubes, les enrober de pâte tandoori et mariner 30 minutes.",
      "Faire revenir l'oignon, l'ail et le gingembre.",
      "Ajouter le poulet et le faire dorer de tous côtés.",
      "Incorporer les tomates concassées et le lait de coco.",
      "Mijoter 20 minutes. Parsemer de coriandre et servir avec du riz basmati.",
      "La sauce se congèle très bien."
    ]
  },
  {
    id: 44,
    title: "Pain de viande",
    category: "viande",
    time: 70,
    batchCooking: true,
    // Pour 6 : 600g viande hachée (1260) + 2 œufs (156) + chapelure 50g (175) + oignon (40) = 1631 / 6
    calories: 270,
    ingredients: ["600g de viande hachée crue (bœuf + porc)", "2 œufs", "50g de chapelure", "1 oignon", "2 gousses d'ail", "Persil", "1 c.s. de moutarde", "Ketchup pour glacer", "Sel, poivre"],
    steps: [
      "Préchauffer le four à 180°C.",
      "Mélanger la viande avec les œufs, la chapelure, l'oignon haché, l'ail, le persil et la moutarde.",
      "Assaisonner généreusement et former un pain dans un moule à cake.",
      "Badigeonner de ketchup sur le dessus.",
      "Cuire 50-55 minutes. Vérifier la cuisson avec un couteau.",
      "Se coupe en tranches, se mange froid ou chaud. Se congèle très bien."
    ]
  },
  // ── Petit-déjeuner ───────────────────────────────────────────────────────
  {
    id: 46,
    title: "Porridge aux fruits rouges",
    category: "petit-déjeuner",
    time: 10,
    calories: 380,
    ingredients: ["80g de flocons d'avoine (secs)", "300ml de lait (ou lait végétal)", "100g de fruits rouges surgelés", "1 c.s. de miel", "1 c.s. de graines de chia"],
    steps: [
      "Verser les flocons et le lait dans une casserole.",
      "Cuire 5 minutes à feu moyen en remuant.",
      "Ajouter le miel et les graines de chia.",
      "Servir dans un bol avec les fruits rouges décongelés dessus."
    ]
  },
  {
    id: 47,
    title: "Pancakes maison",
    category: "petit-déjeuner",
    time: 20,
    calories: 420,
    ingredients: ["150g de farine", "1 c.s. de sucre", "1 c.c. de levure chimique", "1 pincée de sel", "2 œufs", "150ml de lait", "1 c.s. d'huile", "Sirop d'érable ou miel"],
    steps: [
      "Mélanger farine, sucre, levure et sel dans un bol.",
      "Incorporer les œufs battus, le lait et l'huile.",
      "Mélanger sans trop travailler la pâte.",
      "Cuire des petits cercles dans une poêle légèrement huilée, 2 min par côté.",
      "Servir avec sirop d'érable, miel ou fruits frais."
    ]
  },
  {
    id: 48,
    title: "Avocado toast œuf poché",
    category: "petit-déjeuner",
    time: 15,
    calories: 440,
    ingredients: ["2 tranches de pain complet", "1 avocat mûr", "2 œufs", "Jus de citron", "Piment d'Espelette", "Fleur de sel", "Quelques feuilles de roquette"],
    steps: [
      "Toaster le pain.",
      "Écraser l'avocat avec le jus de citron, saler.",
      "Porter une casserole d'eau à frémissement, ajouter un filet de vinaigre.",
      "Casser les œufs un par un dans l'eau et pocher 3 minutes.",
      "Étaler l'avocat sur le pain, poser l'œuf, piment d'Espelette et roquette."
    ]
  },
  {
    id: 49,
    title: "Bowl yaourt granola fruits",
    category: "petit-déjeuner",
    time: 5,
    calories: 350,
    ingredients: ["200g de yaourt grec", "50g de granola", "1 banane", "Quelques framboises", "1 c.s. de miel", "1 c.s. de beurre d'amande (optionnel)"],
    steps: [
      "Verser le yaourt grec dans un bol.",
      "Couper la banane en rondelles et disposer sur le yaourt.",
      "Ajouter les framboises et le granola.",
      "Finir avec le miel et le beurre d'amande."
    ]
  },
  {
    id: 50,
    title: "Œufs brouillés crémeux",
    category: "petit-déjeuner",
    time: 10,
    calories: 390,
    ingredients: ["3 œufs", "2 c.s. de crème fraîche", "10g de beurre", "2 tranches de pain de mie grillé", "Ciboulette", "Sel, poivre"],
    steps: [
      "Battre les œufs avec la crème, saler et poivrer.",
      "Faire fondre le beurre à feu très doux.",
      "Verser les œufs et remuer doucement en faisant des mouvements lents.",
      "Retirer du feu avant la fin de la cuisson — ils continuent de cuire hors du feu.",
      "Servir sur le pain grillé avec la ciboulette ciselée."
    ]
  },
  {
    id: 51,
    title: "Smoothie bowl banane-épinards",
    category: "petit-déjeuner",
    time: 10,
    calories: 320,
    ingredients: ["2 bananes congelées", "1 poignée d'épinards frais", "100ml de lait végétal", "Granola", "Kiwi", "Graines de tournesol"],
    steps: [
      "Mixer les bananes congelées avec les épinards et le lait végétal jusqu'à consistance lisse.",
      "Verser dans un bol — la texture doit être épaisse.",
      "Disposer le granola, le kiwi tranché et les graines dessus."
    ]
  },
  {
    id: 52,
    title: "Pain perdu à la cannelle",
    category: "petit-déjeuner",
    time: 15,
    calories: 460,
    ingredients: ["4 tranches de brioche ou pain rassis", "2 œufs", "100ml de lait", "1 c.s. de sucre", "1 c.c. de cannelle", "Beurre", "Sucre glace"],
    steps: [
      "Battre les œufs avec le lait, le sucre et la cannelle.",
      "Tremper les tranches de pain des deux côtés.",
      "Faire dorer dans le beurre chaud 2-3 minutes par côté.",
      "Saupoudrer de sucre glace. Servir avec des fruits ou du sirop."
    ]
  },
  {
    id: 53,
    title: "Bircher muesli (prep nuit)",
    category: "petit-déjeuner",
    time: 5,
    calories: 400,
    ingredients: ["80g de flocons d'avoine (secs)", "150ml de lait (ou yaourt)", "1 pomme râpée", "1 c.s. de miel", "1 c.s. de raisins secs", "Noix concassées", "Cannelle"],
    steps: [
      "Mélanger les flocons avec le lait, la pomme râpée, le miel et les raisins.",
      "Couvrir et mettre au frigo toute la nuit.",
      "Le matin, ajouter les noix et une pincée de cannelle."
    ]
  },
  {
    id: 54,
    title: "Tartines fromage blanc fruits",
    category: "petit-déjeuner",
    time: 5,
    calories: 290,
    ingredients: ["3 tranches de pain complet", "150g de fromage blanc", "1 c.s. de miel", "Fruits de saison (fraises, myrtilles, pêche)", "Quelques noix"],
    steps: [
      "Toaster légèrement le pain.",
      "Étaler le fromage blanc sur chaque tranche.",
      "Disposer les fruits coupés, les noix et le filet de miel."
    ]
  },
  {
    id: 55,
    title: "Galette de sarrasin œuf-fromage",
    category: "petit-déjeuner",
    time: 15,
    calories: 370,
    ingredients: ["2 galettes de sarrasin (prêtes à l'emploi)", "2 œufs", "40g d'emmental râpé", "Sel, poivre", "Beurre"],
    steps: [
      "Faire chauffer chaque galette dans une poêle beurrée.",
      "Casser un œuf au centre, saler, poivrer.",
      "Parsemer d'emmental et replier les bords.",
      "Cuire jusqu'à ce que l'œuf soit cuit selon les préférences."
    ]
  },

  // ── Goûter ───────────────────────────────────────────────────────────────
  {
    id: 56,
    title: "Banana bread maison",
    category: "goûter",
    time: 60,
    batchCooking: true,
    calories: 280,
    ingredients: ["3 bananes très mûres", "200g de farine", "2 œufs", "80g de sucre", "60g de beurre fondu", "1 c.c. de levure", "1 c.c. de cannelle", "Noix (optionnel)"],
    steps: [
      "Préchauffer le four à 175°C.",
      "Écraser les bananes à la fourchette.",
      "Mélanger avec les œufs, le beurre fondu et le sucre.",
      "Incorporer la farine, la levure et la cannelle.",
      "Ajouter les noix si souhaité.",
      "Verser dans un moule à cake et cuire 50-55 minutes."
    ]
  },
  {
    id: 57,
    title: "Energy balls cacao-avoine",
    category: "goûter",
    time: 15,
    calories: 220,
    ingredients: ["100g de flocons d'avoine", "80g de beurre de cacahuète", "2 c.s. de cacao en poudre", "2 c.s. de miel", "1 c.s. de graines de chia", "1 c.s. de pépites de chocolat noir"],
    steps: [
      "Mélanger tous les ingrédients dans un bol.",
      "Réfrigérer 20 minutes si la pâte est trop collante.",
      "Former des boules avec les mains.",
      "Conserver au frigo jusqu'à 1 semaine."
    ]
  },
  {
    id: 58,
    title: "Muffins aux myrtilles",
    category: "goûter",
    time: 30,
    batchCooking: true,
    calories: 250,
    ingredients: ["200g de farine", "100g de sucre", "2 œufs", "80ml d'huile", "100ml de lait", "1 c.c. de levure", "150g de myrtilles (fraîches ou surgelées)"],
    steps: [
      "Préchauffer le four à 180°C.",
      "Mélanger les ingrédients secs d'un côté, les liquides de l'autre.",
      "Incorporer les liquides aux secs sans trop mélanger.",
      "Ajouter délicatement les myrtilles.",
      "Remplir les moules à muffins aux 3/4 et cuire 20-22 minutes."
    ]
  },
  {
    id: 59,
    title: "Cookies pépites de chocolat",
    category: "goûter",
    time: 25,
    batchCooking: true,
    calories: 260,
    ingredients: ["200g de farine", "120g de beurre mou", "100g de sucre brun", "50g de sucre blanc", "1 œuf", "1 c.c. de vanille", "150g de pépites de chocolat noir", "1 pincée de sel"],
    steps: [
      "Préchauffer le four à 180°C.",
      "Crémer le beurre avec les sucres.",
      "Incorporer l'œuf et la vanille.",
      "Ajouter la farine et le sel, puis les pépites.",
      "Former des boules, les espacer sur une plaque et cuire 11-12 minutes.",
      "Laisser refroidir — ils durcissent en refroidissant."
    ]
  },
  {
    id: 60,
    title: "Yaourt miel noix",
    category: "goûter",
    time: 5,
    calories: 250,
    ingredients: ["200g de yaourt grec", "1 c.s. de miel", "30g de noix concassées", "5 dattes ou quelques raisins secs"],
    steps: [
      "Verser le yaourt dans un bol.",
      "Arroser de miel.",
      "Parsemer de noix et de dattes coupées."
    ]
  },
  {
    id: 61,
    title: "Tartines beurre de cacahuète banane",
    category: "goûter",
    time: 5,
    calories: 360,
    ingredients: ["2 tranches de pain complet", "2 c.s. de beurre de cacahuète", "1 banane", "1 filet de miel", "Graines de sésame (optionnel)"],
    steps: [
      "Toaster le pain.",
      "Étaler généreusement le beurre de cacahuète.",
      "Disposer les rondelles de banane et arroser de miel."
    ]
  },
  {
    id: 62,
    title: "Crêpes sucrées",
    category: "goûter",
    time: 30,
    calories: 300,
    ingredients: ["250g de farine", "3 œufs", "500ml de lait", "2 c.s. de sucre", "1 sachet de sucre vanillé", "30g de beurre fondu", "Garniture au choix : Nutella, confiture, citron-sucre"],
    steps: [
      "Mélanger la farine, le sucre et les œufs.",
      "Incorporer progressivement le lait pour éviter les grumeaux.",
      "Ajouter le beurre fondu et laisser reposer 30 minutes.",
      "Cuire dans une poêle légèrement beurrée.",
      "Garnir selon les envies."
    ]
  },
  {
    id: 63,
    title: "Pomme cuite cannelle-amande",
    category: "goûter",
    time: 15,
    calories: 180,
    ingredients: ["2 pommes", "2 c.s. de miel", "1 c.c. de cannelle", "20g d'amandes effilées", "1 filet de jus de citron"],
    steps: [
      "Éplucher et couper les pommes en quartiers.",
      "Faire revenir dans une poêle avec le miel et la cannelle.",
      "Ajouter un filet de jus de citron.",
      "Parsemer d'amandes effilées et servir tiède.",
      "Variante : passer au four 20 minutes à 180°C dans des pommes entières évvidées."
    ]
  },
  {
    id: 64,
    title: "Riz au lait maison",
    category: "goûter",
    time: 40,
    batchCooking: true,
    calories: 280,
    ingredients: ["150g de riz rond (cru)", "700ml de lait entier", "50g de sucre", "1 gousse de vanille", "1 pincée de sel", "Cannelle en poudre"],
    steps: [
      "Fendre la gousse de vanille et gratter les graines.",
      "Porter le lait à frémissement avec le sucre, la vanille et le sel.",
      "Ajouter le riz et cuire à feu très doux 35-40 minutes en remuant souvent.",
      "Servir tiède ou froid avec une pincée de cannelle.",
      "Se conserve 3 jours au frigo."
    ]
  },
  {
    id: 65,
    title: "Toast chèvre miel noix",
    category: "goûter",
    time: 10,
    calories: 320,
    ingredients: ["2 tranches de pain de campagne", "60g de fromage de chèvre frais", "1 c.s. de miel", "15g de cerneaux de noix", "Quelques feuilles de thym frais"],
    steps: [
      "Toaster le pain.",
      "Étaler le fromage de chèvre.",
      "Parsemer les noix grossièrement concassées.",
      "Arroser de miel et décorer avec le thym."
    ]
  },

  {
    id: 45,
    title: "Gratin de pâtes au jambon",
    category: "pâtes",
    time: 45,
    batchCooking: true,
    // Pour 4 : 300g pâtes (1050) + jambon 200g (290) + béchamel (570) + gruyère 80g (320) = 2230 / 4
    calories: 560,
    ingredients: ["300g de pâtes crues (penne ou rigatoni)", "200g de jambon en dés", "30g de beurre", "30g de farine", "400ml de lait", "80g de gruyère râpé", "Muscade", "Sel, poivre"],
    steps: [
      "Cuire les pâtes al dente, égoutter.",
      "Préparer la béchamel : faire fondre le beurre, ajouter la farine, verser le lait progressivement.",
      "Assaisonner avec sel, poivre et muscade.",
      "Mélanger les pâtes, le jambon et la béchamel.",
      "Verser dans un plat à gratin, couvrir de gruyère.",
      "Gratiner au four à 200°C pendant 20 minutes. Se réchauffe très bien."
    ]
  }
];
