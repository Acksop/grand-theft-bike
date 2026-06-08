import React, { useEffect, useRef, useCallback, useState } from 'react';
import { GameState, InputState } from '../../game/types';
import Hud from '../ui/Hud';
import AudioController from './AudioController';
import { CharacterType } from '../../App';
import { getInitialGameState } from '../../game/constants';
import { handleInteraction, checkActTransition } from '../../game/missions/missionLogic';
import { useGameLoop } from '../../hooks/game/useGameLoop';

// Overlays
import ActIntro from './overlays/ActIntro';
import GameDialog from './overlays/GameDialog';
import EndingScreen from './overlays/EndingScreen';
import CreditsPopup from './overlays/CreditsPopup';

interface GameViewProps {
  character: CharacterType;
}

export default function GameView({ character }: GameViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [initialState] = useState<GameState>(() => getInitialGameState(character));

  // State for overlays
  const [dialog, setDialog] = useState<{ name: string; text: string } | null>(null);
  const [showAct2Intro, setShowAct2Intro] = useState(false);
  const [showAct3Intro, setShowAct3Intro] = useState(false);
  const [showAct4Intro, setShowAct4Intro] = useState(false);
  const [showAct5Intro, setShowAct5Intro] = useState(false);
  const [showAct6Intro, setShowAct6Intro] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showEnding, setShowEnding] = useState<{ type: string; title: string; text: string } | null>(null);
  
  const dialogTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Interaction and Act transition logic
  const onUpdate = useCallback((gs: GameState, inp: InputState) => {
    checkActTransition(gs, setShowAct2Intro, setShowAct3Intro);

    if (inp.action) {
      handleInteraction(
        gs, 
        character, 
        (d) => {
          setDialog(d);
          if (d) {
            clearTimeout(dialogTimeout.current);
            dialogTimeout.current = setTimeout(() => setDialog(null), 4000);
          }
        },
        setShowAct2Intro,
        setShowAct3Intro,
        setShowAct4Intro,
        setShowAct5Intro,
        setShowAct6Intro,
        setShowEnding
      );
      inp.action = false;
    }
  }, [character]);

  const { hudState } = useGameLoop(initialState, canvasRef, onUpdate);

  const resize = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: '#020617' }}>
      <canvas ref={canvasRef} className="pixel-art block" />
      <AudioController characterId={character.id} />
      
      <Hud state={hudState} />
      
      {/* Character badge */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 border border-primary/30 px-3 py-1 pixel-corners">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: character.color }} />
        <span className="text-[10px] uppercase font-bold tracking-widest text-primary">{character.name}</span>
      </div>

      <GameDialog dialog={dialog} />

      {showAct2Intro && (
        <ActIntro 
          act={2} 
          title="LA RÉSISTANCE" 
          description="Les élections approchent. Le chantier de l'éco-quartier tourne à plein régime. Les pelleteuses avalent nos terres une à une." 
          objectives={[
            'Va chercher des "munitions" chez Michel le maraîcher',
            'Sabote les machines du chantier',
            'Pirate l\'ordinateur du chef pour effacer les plans'
          ]}
          onClose={() => setShowAct2Intro(false)}
          accentColor="#10b981"
        />
      )}

      {showAct3Intro && (
        <ActIntro 
          act={3} 
          title="LES ÉLECTIONS" 
          description="C'est le jour J. Le promoteur affronte la liste écologiste. Ton karma déterminera l'issue de cette election..." 
          objectives={[
            'Rends-toi au bureau de vote (sud-ouest)',
            'Convaincs les électrices et électeurs indécis',
            'Fais pencher la balance pour ton camp !'
          ]}
          onClose={() => setShowAct3Intro(false)}
          accentColor="#fbbf24"
          karma={hudState.karma}
        />
      )}

      {showAct4Intro && (
        <ActIntro 
          act={4} 
          title="L'ATELIER RSE" 
          description="Après les élections, un ami vous invite à un atelier éco-responsable. Mais quelque chose ne va pas..." 
          objectives={[
            'Explorez la salle et collectez les gobelets',
            'Confrontez le formateur RSE',
            'Dénoncez l\'hypocrisie ou sabotez l\'atelier !'
          ]}
          onClose={() => setShowAct4Intro(false)}
          accentColor="#f43f5e"
        />
      )}

      {showAct5Intro && (
        <ActIntro 
          act={5} 
          title="LE CHANTIER ÉCOCIDE" 
          description="Le promoteur presente son 'eco-quartier'. 600 logements 'durables'. Les pelleteuses sont pretes. C'est maintenant ou jamais pour saboter la presentation !" 
          objectives={[
            'Lancez des patates bio sur les machines',
            'Graffez \'ZAD\' sur les murs et bannieres',
            'Piratez l\'ecran de presentation'
          ]}
          onClose={() => setShowAct5Intro(false)}
          accentColor="#ef4444"
        />
      )}

      {showAct6Intro && (
        <ActIntro 
          act={6} 
          title="LA FONTAINE GRANVELLE" 
          description="La secheresse frappe Besancon. La fontaine Granvelle gaspille l'eau precieuse pendant que Burger Fluo voisin pleure ses glacons. Detournez cette eau !" 
          objectives={[
            'Piratez la fontaine pour detourner le flux',
            'Arrosez le jardin communautaire',
            'Piratez l\'ecran du drive de Burger Fluo'
          ]}
          onClose={() => setShowAct6Intro(false)}
          accentColor="#3b82f6"
        />
      )}

      {showEnding && (
        <EndingScreen 
          ending={showEnding} 
          onShowCredits={() => setShowCredits(true)} 
        />
      )}

      {showCredits && (
        <CreditsPopup onClose={() => setShowCredits(false)} />
      )}
    </div>
  );
}
