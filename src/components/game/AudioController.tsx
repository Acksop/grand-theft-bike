import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioControllerProps {
  characterId: string;
}

const CHARACTER_MUSIC: Record<string, string> = {
  leo: 'https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FUZQ9Vyz8TgXm8l5Oq425336AyOB3%2FGTA_BikeLeo_Boucle_1__cbfac6bb.mp3?alt=media&token=da2cdae5-087f-4e02-9455-59b64ef2de38',
  sarah: 'https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FUZQ9Vyz8TgXm8l5Oq425336AyOB3%2FGTA_Bike_Boucle1__9e300b5c.mp3?alt=media&token=86d8c0e7-34c2-4aa7-ab82-9420b7e74852',
  marc: 'https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FUZQ9Vyz8TgXm8l5Oq425336AyOB3%2FGTA_Bike_Marc_Boucle_1__f9f86290.mp3?alt=media&token=5e51583e-8d8f-45ee-bb3c-b6e59eef1609',
};

export default function AudioController({ characterId }: AudioControllerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = CHARACTER_MUSIC[characterId] || '';
      audioRef.current.load();
      if (isPlaying && !isMuted) {
        audioRef.current.play().catch(err => console.log('Audio playback blocked:', err));
      }
    }
  }, [characterId]);

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMuted = !isMuted;
      setIsMuted(nextMuted);
      audioRef.current.muted = nextMuted;
      
      // If we are unmuting and not playing, try to play
      if (!nextMuted && !isPlaying) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.log('Audio playback blocked:', err));
      }
    }
  };

  // Initial play on mount or interaction
  useEffect(() => {
    const startAudio = () => {
      if (audioRef.current && !isPlaying && !isMuted) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            window.removeEventListener('click', startAudio);
            window.removeEventListener('keydown', startAudio);
          })
          .catch(err => console.log('Audio playback still blocked:', err));
      }
    };

    window.addEventListener('click', startAudio);
    window.addEventListener('keydown', startAudio);

    return () => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('keydown', startAudio);
    };
  }, [isPlaying, isMuted]);

  return (
    <div className="absolute bottom-4 right-4 z-[100] flex items-center gap-2 pointer-events-auto">
      <button
        onClick={toggleMute}
        className="p-3 bg-slate-900/80 border border-primary/30 rounded-full hover:bg-primary/20 transition-all text-primary shadow-lg backdrop-blur-sm"
        title={isMuted ? "Réactiver le son" : "Couper le son"}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
      <audio
        ref={audioRef}
        loop
        muted={isMuted}
        style={{ display: 'none' }}
      />
    </div>
  );
}
