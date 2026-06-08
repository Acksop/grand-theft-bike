import { GameState } from '../types';
import { CharacterType } from '../../App';

export const handleInteraction = (
  gs: GameState, 
  character: CharacterType, 
  setDialog: (dialog: { name: string; text: string } | null) => void,
  setShowAct2Intro: (v: boolean) => void,
  setShowAct3Intro: (v: boolean) => void,
  setShowAct4Intro: (v: boolean) => void,
  setShowAct5Intro: (v: boolean) => void,
  setShowAct6Intro: (v: boolean) => void,
  setShowEnding: (v: { type: string; title: string; text: string } | null) => void
) => {
  const now = Date.now();
  if (!gs.lastInteractionTime || now - gs.lastInteractionTime > 500) {
    for (const ent of gs.entities) {
      const dx = ent.pos.x - gs.player.pos.x;
      const dy = ent.pos.y - gs.player.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 60 && ent.meta?.dialog) {
        gs.lastInteractionTime = now;

        // Act 1 Logic
        if (gs.act === 1) {
          if (ent.id === 'camille' && gs.missionStatus === 'pending') {
            gs.missionStatus = 'active';
            gs.missionData.flyersToDistribute = 5;
            setDialog({ name: ent.meta.name, text: "Tiens, prends ces 5 tracts. Distribue-les aux gens dans le centre-ville (à l'ouest) !" });
          } else if (gs.missionStatus === 'active' && gs.missionData.flyersToDistribute > 0) {
            if (!gs.missionData.targetNPCs.includes(ent.id) && ent.id !== 'camille' && ent.id !== 'zadiste1') {
              gs.missionData.targetNPCs.push(ent.id);
              gs.missionData.flyersToDistribute--;
              gs.missionData.flyersDistributed++;
              gs.karma += 5;
              setDialog({ name: ent.meta.name, text: "Ah, merci ! Je vais lire ça." });
              if (gs.missionData.flyersDistributed >= 3) {
                gs.missionStatus = 'completed';
                setDialog({ name: "Mission accomplie", text: "Tu as sensibilisé assez de gens ! Retourne voir Camille." });
              }
            } else {
              setDialog({ name: ent.meta.name, text: ent.meta.dialog });
            }
          } else if (ent.id === 'camille' && gs.missionStatus === 'completed') {
             setDialog({ name: 'Camille', text: `Super boulot ${character.name} ! On commence à se faire entendre. Prépare-toi pour la Suite...` });
             gs.karma += 10;
          } else {
            setDialog({ name: ent.meta.name, text: ent.meta.dialog });
          }
        }
        
        // Act 2 Logic
        else if (gs.act === 2) {
          if (ent.id === 'maraicher' && !gs.missionData.hasPotatoes && gs.missionStatus === 'pending') {
            gs.missionStatus = 'active';
            gs.missionData.hasPotatoes = true;
            setDialog({ name: ent.meta.name, text: "Tiens, une poche de patates bio ! On les a boostées au purin d'ortie, ce sont de vraies 'techno-patates' maintenant. Parfait pour gripper les rouages du progrès !" });
          } else if (ent.id.startsWith('machine') && gs.missionData.hasPotatoes && gs.missionStatus === 'active') {
            if (ent.health > 0) {
              ent.health = 0;
              gs.missionData.machinesSabotaged++;
              gs.karma += 15;
              setDialog({ name: ent.meta.name, text: "BOUM ! Une machine de moins ! L'obsolescence programmée, mais en version accélérée." });
              if (gs.missionData.machinesSabotaged >= gs.missionData.machinesTotal) {
                gs.missionStatus = 'completed';
                setDialog({ name: "CHANTIER SABOTÉ !", text: "Les travailleurs rentrent chez eux. Va annoncer la nouvelle aux Vaîtes !" });
              }
            } else {
              setDialog({ name: ent.meta.name, text: "Cette machine est déjà hors service. Inutile de gaspiller de la nourriture." });
            }
          } else if (ent.id === 'container-pc' && gs.missionData.computerHacked === false && gs.missionData.machinesSabotaged >= 3) {
            gs.missionData.computerHacked = true;
            gs.karma += 20;
            setDialog({ name: 'PIRATAGE', text: "BOOM! J'ai supprimé les plans du chantier ! On verra s'ils peuvent construire sans leur guide digital." });
            if (gs.missionData.machinesSabotaged >= 3 && gs.missionData.computerHacked) {
              gs.missionStatus = 'completed';
              setDialog({ name: 'MISSION COMPLÈTE!', text: 'Le chantier est paralysé ! Retourne aux Vaîtes pour fêter ça !' });
            }
          } else if (ent.id === 'chef-chantier') {
            setDialog({ name: ent.meta.name, text: "Le planning est sacré ! Ce béton est 'disruptif', il sèche en 2 minutes. On n'a pas le temps pour vos états d'âme environnementaux !" });
          } else if (ent.id === 'maraicher') {
            setDialog({ name: ent.meta.name, text: "Ils veulent transformer mes champs en showroom pour voitures électriques... C'est pas ça qu'on mange !" });
          } else {
            setDialog({ name: ent.meta.name, text: ent.meta.dialog });
          }
        }

        // Act 3 Logic
        else if (gs.act === 3) {
          if (ent.id === 'urne' && !gs.missionData.hasVoted) {
            gs.missionStatus = 'active';
            gs.missionData.hasVoted = true;
            
            if (gs.karma >= 30) {
              gs.missionData.finalChoice = 'eco';
              gs.karma += 50;
            } else {
              gs.missionData.finalChoice = 'boycott';
            }
            
            setTimeout(() => {
              gs.act = 4;
              gs.missionId = 'rse-workshop';
              gs.missionStatus = 'pending';
              gs.isOnBike = false;
              gs.missionData = {
                ...gs.missionData,
                cupsCollected: 0,
                cupsTotal: 5,
                hasCoffeeAccepted: false,
                workshopSabotaged: false,
                hasTrophy: false,
                workshopChoice: null,
                targetNPCs: []
              };
              gs.player.pos = { x: 1500, y: 800 };
              gs.entities = [
                { id: 'formateur-rse', type: 'npc', pos: { x: 1550, y: 750 }, vel: { x: 0, y: 0 }, angle: 0, size: 18, color: '#0ea5e9', health: 100, maxHealth: 100, meta: { name: 'Formateur RSE', dialog: 'Bienvenue à notre atelier "Greenwashing as a Service". On va apprendre à transformer un désastre écologique en opportunité marketing !' }},
                { id: 'participant1', type: 'npc', pos: { x: 1400, y: 800 }, vel: { x: 0, y: 0 }, angle: 0, size: 16, color: '#a855f7', health: 100, maxHealth: 100, meta: { name: 'Responsable RH', dialog: 'C\'est vrai que les gobelets sont jetables, mais on compense avec des formations !' }},
                { id: 'participant2', type: 'npc', pos: { x: 1450, y: 850 }, vel: { x: 0, y: 0 }, angle: 0, size: 15, color: '#f97316', health: 100, maxHealth: 100, meta: { name: 'Cadre', dialog: 'Je trouve ca un peu hypocrite moi aussi...' }},
                { id: 'participant3', type: 'npc', pos: { x: 1600, y: 800 }, vel: { x: 0, y: 0 }, angle: 0, size: 16, color: '#14b8a6', health: 100, maxHealth: 100, meta: { name: 'Stagiaire', dialog: 'C\'est mon troisieme atelier RSE cette semaine. On ne fait que parler...' }},
                { id: 'machine-cafe', type: 'prop', pos: { x: 1500, y: 700 }, vel: { x: 0, y: 0 }, angle: 0, size: 25, color: '#78716c', health: 100, maxHealth: 100, meta: { name: 'Machine a cafe', dialog: 'Une machine a cafe pro. Vous voulez un cafe ?' }},
                { id: 'gobelet1', type: 'prop', pos: { x: 1350, y: 780 }, vel: { x: 0, y: 0 }, angle: 0, size: 8, color: '#fef3c7', health: 100, maxHealth: 100, meta: { name: 'Gobelet', dialog: 'Un gobelet jetable. "eco-concu" selon l\'etiquette.' }},
                { id: 'gobelet2', type: 'prop', pos: { x: 1650, y: 820 }, vel: { x: 0, y: 0 }, angle: 0, size: 8, color: '#fef3c7', health: 100, maxHealth: 100, meta: { name: 'Gobelet', dialog: 'Encore un gobelet.' }},
                { id: 'gobelet3', type: 'prop', pos: { x: 1420, y: 900 }, vel: { x: 0, y: 0 }, angle: 0, size: 8, color: '#fef3c7', health: 100, maxHealth: 100, meta: { name: 'Gobelet', dialog: 'Celui-ci est a moitie vide.' }},
                { id: 'gobelet4', type: 'prop', pos: { x: 1580, y: 880 }, vel: { x: 0, y: 0 }, angle: 0, size: 8, color: '#fef3c7', health: 100, maxHealth: 100, meta: { name: 'Gobelet', dialog: 'Un gobelet abandonne. Symbole de l\'eco-hypocrisie.' }},
                { id: 'gobelet5', type: 'prop', pos: { x: 1500, y: 920 }, vel: { x: 0, y: 0 }, angle: 0, size: 8, color: '#fef3c7', health: 100, maxHealth: 100, meta: { name: 'Gobelet', dialog: 'Le dernier gobelet. Prenez-le comme trophee !' }},
              ];
              setShowAct4Intro(true);
            }, 1500);
            setDialog({ name: 'VOTE ENREGISTRÉ', text: 'Après les élections, direction un atelier RSE suspect...' });
          } else if ((ent.id === 'electeur1' || ent.id === 'electeur2') && !gs.missionData.targetNPCs.includes(ent.id) && !gs.missionData.hasVoted) {
            gs.missionData.targetNPCs.push(ent.id);
            gs.missionData.votesGathered++;
            gs.karma += 10;
            if (gs.karma > 30) gs.karma = 30;
            setDialog({ name: ent.meta.name, text: "Tu m'as convaincu ! Je voterai vert !" });
          } else {
            setDialog({ name: ent.meta.name, text: ent.meta.dialog });
          }
        }

        // Act 4 Logic
        else if (gs.act === 4) {
          if (ent.id.startsWith('gobelet') && !gs.missionData.targetNPCs.includes(ent.id)) {
            gs.missionData.targetNPCs.push(ent.id);
            gs.missionData.cupsCollected++;
            gs.karma += 3;
            setDialog({ name: 'TROPHÉE', text: 'Un gobelet de plus ! Preuve de l\'éco-hypocrisie.' });
            if (gs.missionData.cupsCollected >= gs.missionData.cupsTotal) {
              gs.missionData.hasTrophy = true;
            }
          } else if (ent.id === 'machine-cafe' && !gs.missionData.hasCoffeeAccepted) {
            gs.missionData.hasCoffeeAccepted = true;
            gs.karma -= 10;
            gs.missionData.workshopChoice = 'accept';
            setDialog({ name: 'Machine à café', text: '*Sirop amer* Vous acceptez le café. -10 karma. L\'éco-hypocrisie vous gagne...' });
          } else if (ent.id === 'formateur-rse') {
            if (gs.missionStatus === 'pending') {
              gs.missionStatus = 'active';
              setDialog({ name: ent.meta.name, text: 'Alors, que pensez-vous de notre atelier eco-responsable ? On a même une application pour calculer son empreinte carbone en temps réel !' });
            } else if (gs.missionStatus === 'active' && gs.missionData.workshopChoice === null) {
              gs.missionData.workshopChoice = 'denounce';
              gs.karma += 25;
              setDialog({ name: 'DÉNONCIATION', text: '"UN DÉTAIL ? HYPOCRISIE ! Vous servez du café dans des gobelets jetables en vantant l\'éco-responsabilité ! C\'est du greenwashing pur !" *Les participants réagissent*' });
            } else {
              setDialog({ name: ent.meta.name, text: ent.meta.dialog });
            }
          } else if ((ent.id === 'participant3' || ent.id === 'formateur-rse') && gs.missionStatus === 'active' && (gs.missionData.hasTrophy || gs.missionData.workshopChoice !== null)) {
            gs.missionStatus = 'completed';
            setTimeout(() => {
              setShowAct5Intro(true);
              gs.act = 5;
              gs.missionStatus = 'pending';
              gs.isOnBike = true;
              gs.missionData = {
                ...gs.missionData,
                projectilesThrown: 0,
                targetsHit: 0,
                hasPotatoesForAct5: true,
                graffitiDone: 0,
                graffitiTotal: 3,
                screenHacked: false,
                vehiclesSabotaged: 0,
                vehiclesTotal: 3,
                presentationSabotaged: false,
                finalAct5Choice: null,
              };
              gs.player.pos = { x: 400, y: 500 };
              gs.entities = [
                { id: 'promoteur', type: 'npc', pos: { x: 400, y: 200 }, vel: { x: 0, y: 0 }, angle: 0, size: 24, color: '#1e3a5f', health: 100, maxHealth: 100, meta: { name: 'M. Gros-Portefeuille', dialog: 'Mesdames et messieurs, cet eco-quartier est une revolution durable ! 600 logements, tram, panneaux solaires...', type: 'promoter' }},
                { id: 'ingenieur1', type: 'npc', pos: { x: 300, y: 250 }, vel: { x: 0, y: 0 }, angle: 0, size: 20, color: '#64748b', health: 100, maxHealth: 100, meta: { name: 'Ingenieur 1', dialog: 'Les calculs sont faits, ca tient debout. C\'est tout ce qui compte.', type: 'engineer' }},
                { id: 'pelleteuse1', type: 'prop', pos: { x: 150, y: 350 }, vel: { x: 0, y: 0 }, angle: 0, size: 40, color: '#f59e0b', health: 100, maxHealth: 100, meta: { name: 'Pelleteuse', dialog: 'Une pelleteuse... symbolique du demolisseur.', type: 'vehicle', sabotaged: false }},
                { id: 'ecran-pres', type: 'prop', pos: { x: 400, y: 150 }, vel: { x: 0, y: 0 }, angle: 0, size: 60, color: '#3b82f6', health: 100, maxHealth: 100, meta: { name: 'Ecran de presentation', dialog: 'Un ecran affichant les plans de l\'eco-quartier. hackable !', type: 'screen', hacked: false }},
                { id: 'mur1', type: 'prop', pos: { x: 100, y: 300 }, vel: { x: 0, y: 0 }, angle: 0, size: 30, color: '#4b5563', health: 100, maxHealth: 100, meta: { name: 'Mur', dialog: 'Un mur parfait pour un tag ZAD ! Appuyez sur ESPACE pour graffer.', type: 'graffiti-spot', graffed: false }},
                { id: 'caisse-patates', type: 'prop', pos: { x: 700, y: 500 }, vel: { x: 0, y: 0 }, angle: 0, size: 25, color: '#84cc16', health: 100, maxHealth: 100, meta: { name: 'Caisse de patates', dialog: 'Des patates bio ! Vos munitions pour le sabotage ! Appuyez sur ESPACE pour lancer.', type: 'ammo', ammo: 10 }},
                { id: 'camille-act5', type: 'npc', pos: { x: 400, y: 570 }, vel: { x: 0, y: 0 }, angle: 0, size: 16, color: '#ec4899', health: 100, maxHealth: 100, meta: { name: 'Camille', dialog: 'On est la ! Toute la ZAD est derriere toi. C\'est le moment de tout donner !', type: 'ally', spoken: false }},
              ];
              gs.worldSize = { x: 800, y: 600 };
            }, 2000);
          } else {
            setDialog({ name: ent.meta.name, text: ent.meta.dialog });
          }
        }

        // Act 5 Logic
        else if (gs.act === 5) {
          if (ent.id === 'promoteur' && gs.missionStatus === 'pending') {
            gs.missionStatus = 'active';
            setDialog({ name: character.name, text: '"Durable mon cul ! Vous betonnez mes patates !"' });
          } else if (ent.id === 'caisse-patates') {
            gs.missionData.hasPotatoesForAct5 = true;
            setDialog({ name: 'Caisse de patates', text: 'Vous prenez des patates bio. Appuyez sur ESPACE pres d\'une cible pour lancer !' });
          } else if (ent.meta.type === 'vehicle' && gs.missionData.hasPotatoesForAct5 && !ent.meta.sabotaged) {
            ent.meta.sabotaged = true;
            gs.missionData.targetsHit++;
            gs.missionData.vehiclesSabotaged++;
            gs.karma += 15;
            gs.missionData.presentationSabotaged = true;
            gs.missionData.finalAct5Choice = 'patate';
            ent.color = '#1f2937';
            setDialog({ name: 'SABOTAGE !', text: '*PATATE BIO !* Elle explose sur la machine ! Le promoteur hurle ! +15 karma' });
          } else if (ent.id === 'camille-act5') {
            if (gs.missionStatus === 'active' && gs.missionData.presentationSabotaged) {
              gs.missionStatus = 'completed';
              setTimeout(() => {
                gs.act = 6;
                gs.missionId = 'fontaine';
                gs.missionStatus = 'pending';
                gs.player.pos = { x: 500, y: 1800 };
                setShowAct6Intro(true);
                gs.entities = [
                  { id: 'fontaine', type: 'prop', pos: { x: 500, y: 1700 }, vel: { x: 0, y: 0 }, angle: 0, size: 60, color: '#3b82f6', health: 100, maxHealth: 100, meta: { name: 'Fontaine High-Tech', dialog: 'Une fontaine connectee qui brille... et gaspille des litres d\'eau en pleine secheresse.', type: 'fountain', hacked: false }},
                  { id: 'burger-fluo', type: 'prop', pos: { x: 700, y: 1750 }, vel: { x: 0, y: 0 }, angle: 0, size: 80, color: '#f472b6', health: 100, maxHealth: 100, meta: { name: 'Burger Fluo', dialog: 'Fast-food voisin. Ca sent la frite et le plastique.', type: 'restaurant' }},
                  { id: 'drive-ecran', type: 'prop', pos: { x: 750, y: 1850 }, vel: { x: 0, y: 0 }, angle: 0, size: 40, color: '#4ade80', health: 100, maxHealth: 100, meta: { name: 'Ecran Drive', dialog: 'L\'ecran de commande. On peut y lire : "PLUS DE GLACONS POUR VOS SODAS !"', type: 'drive-screen', hacked: false }},
                  { id: 'jardin-commu', type: 'prop', pos: { x: 300, y: 1850 }, vel: { x: 0, y: 0 }, angle: 0, size: 100, color: '#166534', health: 100, maxHealth: 100, meta: { name: 'Jardin Communautaire', dialog: 'Les plantes tirent la langue. Elles ont besoin d\'eau !', type: 'garden' }},
                  { id: 'manager-burger', type: 'npc', pos: { x: 650, y: 1780 }, vel: { x: 0, y: 0 }, angle: 0, size: 18, color: '#ef4444', health: 100, maxHealth: 100, meta: { name: 'Manager Fluo', dialog: 'C\'est la catastrophe ! Sans glaçons, les clients s\'en vont ! On veut de l\'eau ! Notre soda est trop chaud, c\'est anti-disruption !' }},
                  { id: 'zadiste-granvelle', type: 'npc', pos: { x: 450, y: 1750 }, vel: { x: 0, y: 0 }, angle: 0, size: 16, color: '#ec4899', health: 100, maxHealth: 100, meta: { name: 'Zadiste', dialog: 'Détourne cette eau vers le jardin ! C\'est un crime de la gacher ici.' }},
                  { id: 'verre1', type: 'prop', pos: { x: 550, y: 1720 }, vel: { x: 0, y: 0 }, angle: 0, size: 10, color: '#93c5fd', health: 100, maxHealth: 100, meta: { name: 'Verre d\'eau', type: 'glass' }},
                ];
                gs.worldSize = { x: 1000, y: 2000 };
              }, 4500);
            } else {
              setDialog({ name: ent.meta.name, text: ent.meta.dialog });
            }
          } else {
            setDialog({ name: ent.meta.name, text: ent.meta.dialog });
          }
        }

        // Act 6 Logic
        else if (gs.act === 6) {
          if (ent.meta?.type === 'glass' && !gs.missionData.targetNPCs.includes(ent.id)) {
            gs.missionData.targetNPCs.push(ent.id);
            gs.missionData.glassesCollected++;
            gs.player.meta.speedMultiplier = character.stats.speed * (1 - gs.missionData.glassesCollected * 0.05);
            gs.karma += 2;
            setDialog({ name: 'VERRE D\'EAU', text: 'Vous ramassez un verre d\'eau. C\'est lourd... mais précieux !' });
          } else if (ent.meta?.type === 'garden' && gs.missionData.glassesCollected > 0) {
            gs.karma += gs.missionData.glassesCollected * 5;
            setDialog({ name: 'JARDIN', text: `Vous arrosez les plantes. Elles vous remercient ! +${gs.missionData.glassesCollected * 5} Karma` });
            gs.missionData.glassesCollected = 0;
            gs.player.meta.speedMultiplier = character.stats.speed;
          } else if (ent.meta?.type === 'fountain' && !gs.missionData.fountainHacked) {
            gs.missionData.fountainHacked = true;
            gs.karma += 30;
            ent.color = '#10b981';
            setDialog({ name: 'PIRATAGE FONTAINE', text: 'HACK RÉUSSI ! Le débit est réduit. L\'eau est détournée vers le réseau maraîcher !' });
          } else if (ent.meta?.type === 'drive-screen' && !gs.missionData.driveHacked) {
            gs.missionData.driveHacked = true;
            gs.karma += 15;
            ent.color = '#ef4444';
            setDialog({ name: 'DRIVE HACK', text: 'Vous piratez l\'écran : "PAS D\'EAU, PAS DE GLAÇONS ! BUVEZ DE LA BOUE !" Le manager panique !' });
          } else if (ent.id === 'zadiste-granvelle' && gs.missionData.fountainHacked && gs.missionData.driveHacked) {
            gs.missionStatus = 'completed';
            const totalKarma = gs.karma;
            setTimeout(() => {
              if (totalKarma >= 120) {
                setShowEnding({
                  type: 'good',
                  title: 'LÉGENDE ÉCO-URBAINE',
                  text: 'Besançon est devenue la première ville 100% durable de France. Les Vaîtes sont un parc naturel, la fontaine Granvelle alimente les jardins, et le Burger Fluo sert des soupes bio. Vous êtes le héros que la ville attendait.'
                });
              } else if (totalKarma >= 60) {
                setShowEnding({
                  type: 'good',
                  title: 'VICTOIRE CITOYENNE',
                  text: 'Le projet d\'éco-quartier est annulé. La mairie a compris le message. La lutte continue, mais aujourd\'hui, on fête la victoire !'
                });
              } else {
                setShowEnding({
                  type: 'mixed',
                  title: 'UN FUTUR INCERTAIN',
                  text: 'Vous avez fait bouger les lignes, mais le béton gagne encore du terrain. La fontaine est réparée, le drive refonctionne... mais les graines de la résistance sont semées.'
                });
              }
            }, 3000);
          } else {
            setDialog({ name: ent.meta.name, text: ent.meta.dialog });
          }
        }

        gs.lastInteractionTime = now;
        break;
      }
    }
  }
};

export const checkActTransition = (
  gs: GameState,
  setShowAct2Intro: (v: boolean) => void,
  setShowAct3Intro: (v: boolean) => void
) => {
  if (gs.act === 1 && gs.missionStatus === 'completed' && gs.missionData.flyersDistributed >= 3) {
    gs.act = 2;
    gs.missionId = 'resistance';
    gs.missionStatus = 'pending';
    gs.missionData = {
      flyersToDistribute: 0,
      flyersDistributed: 0,
      targetNPCs: [],
      machinesSabotaged: 0,
      machinesTotal: 3,
      hasPotatoes: false,
      computerHacked: false
    };
    gs.entities.push(
      { id: 'machine1', type: 'prop', pos: { x: 2400, y: 2200 }, vel: { x: 0, y: 0 }, angle: 0, size: 24, color: '#f59e0b', health: 100, maxHealth: 100, meta: { name: 'Pelleteuse', dialog: 'Cette machine va détruire nos terres !' }},
      { id: 'machine2', type: 'prop', pos: { x: 2600, y: 2150 }, vel: { x: 0, y: 0 }, angle: 0, size: 22, color: '#f59e0b', health: 100, maxHealth: 100, meta: { name: 'Camion', dialog: 'Il transporte le béton !' }},
      { id: 'machine3', type: 'prop', pos: { x: 2500, y: 2300 }, vel: { x: 0, y: 0 }, angle: 0, size: 20, color: '#f59e0b', health: 100, maxHealth: 100, meta: { name: 'Nacelle', dialog: 'Pour construire plus haut, plus vite.' }},
      { id: 'chef-chantier', type: 'npc', pos: { x: 2350, y: 2050 }, vel: { x: 0, y: 0 }, angle: 0, size: 18, color: '#be123c', health: 100, maxHealth: 100, meta: { name: 'Chef Chantier', dialog: 'On a un deadline, bougez-vous !' }},
      { id: 'maraicher', type: 'npc', pos: { x: 2100, y: 1900 }, vel: { x: 0, y: 0 }, angle: 0, size: 14, color: '#84cc16', health: 100, maxHealth: 100, meta: { name: 'Michel (Maraîcher)', dialog: 'Regarde ce qu\'ils font à mes patates ! Viens, j\'ai des munitions pour toi.' }},
      { id: 'container-pc', type: 'prop', pos: { x: 2350, y: 2150 }, vel: { x: 0, y: 0 }, angle: 0, size: 30, color: '#1e293b', health: 100, maxHealth: 100, meta: { name: 'Ordinateur Chantier', dialog: 'Le PC du chef de chantier ! Je peux pirater les plans...' }}
    );
    setShowAct2Intro(true);
  }
  
  if (gs.act === 2 && gs.missionStatus === 'completed' && gs.missionData.machinesSabotaged >= 3 && gs.missionData.computerHacked) {
    gs.act = 3;
    gs.missionId = 'election';
    gs.missionStatus = 'pending';
    gs.missionData = {
      flyersToDistribute: 0,
      flyersDistributed: 0,
      targetNPCs: [],
      machinesSabotaged: 0,
      machinesTotal: 3,
      hasPotatoes: false,
      computerHacked: false,
      votesGathered: 0,
      votesNeeded: 5,
      hasVoted: false,
      finalChoice: null
    };
    gs.entities.push(
      { id: 'urne', type: 'prop', pos: { x: 500, y: 1800 }, vel: { x: 0, y: 0 }, angle: 0, size: 25, color: '#fbbf24', health: 100, maxHealth: 100, meta: { name: 'Urne Electronique', dialog: 'Cliquez pour voter pour le scrutin final !' }},
      { id: 'promoteur', type: 'npc', pos: { x: 700, y: 1750 }, vel: { x: 0, y: 0 }, angle: 0, size: 20, color: '#dc2626', health: 100, maxHealth: 100, meta: { name: 'Promoteur Immobilier', dialog: 'Mon éco-quartier va crear des emplois ! Vous êtes contre la croissance ?!' }},
      { id: 'elecopro', type: 'npc', pos: { x: 600, y: 1850 }, vel: { x: 0, y: 0 }, angle: 0, size: 18, color: '#16a34a', health: 100, maxHealth: 100, meta: { name: 'Liste Écologique', dialog: 'Votre aide a été précieuse. Le peuple Vaîte vous en remercie !' }},
      { id: 'electeur1', type: 'npc', pos: { x: 300, y: 1900 }, vel: { x: 0, y: 0 }, angle: 0, size: 15, color: '#64748b', health: 100, maxHealth: 100, meta: { name: 'Électeur', dialog: 'Hésitant entre les deux listes... Le verde OU le progrès ?' }}
    );
    setShowAct3Intro(true);
  }
};
