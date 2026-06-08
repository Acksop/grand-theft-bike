import React from 'react';

interface ActIntroProps {
  act: number;
  title: string;
  description: string;
  objectives: string[];
  onClose: () => void;
  accentColor?: string;
  karma?: number;
}

export default function ActIntro({ 
  act, 
  title, 
  description, 
  objectives, 
  onClose, 
  accentColor = '#10b981',
  karma
}: ActIntroProps) {
  return (
    <button 
      className="absolute inset-0 z-50 flex items-center justify-center cursor-pointer block w-full h-full border-0 outline-none p-0 text-foreground"
      style={{
        background: 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #020617 100%)',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div className="max-w-xl text-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-1 bg-gradient-to-r from-transparent" style={{ backgroundImage: `linear-gradient(to right, transparent, ${accentColor})` }} />
            <h2 className="text-sm uppercase font-bold tracking-[0.8em]" style={{ color: accentColor }}>ACTE {act}</h2>
            <div className="w-16 h-1 bg-gradient-to-l from-transparent" style={{ backgroundImage: `linear-gradient(to left, transparent, ${accentColor})` }} />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight" 
              style={{ 
                background: `linear-gradient(135deg, ${accentColor} 0%, #059669 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: `0 0 60px ${accentColor}80`
              }}>
            {title}
          </h1>
          
          <div className="border-l-2 pl-6 my-8 text-left" style={{ borderColor: `${accentColor}80` }}>
            <p className="text-lg text-foreground/80 leading-relaxed mb-4 font-serif italic">
              "{description}"
            </p>
          </div>
          
          <div className="mt-10 space-y-3">
            {objectives.map((obj, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor, animationDelay: `${i * 0.5}s` }} />
                <span>{obj}</span>
              </div>
            ))}
          </div>

          {karma !== undefined && (
            <div className="mt-10 p-5 bg-opacity-10 border rounded-lg" style={{ backgroundColor: `${accentColor}1a`, borderColor: `${accentColor}4d` }}>
              <p className="text-xs font-mono mb-2" style={{ color: `${accentColor}cc` }}>STATUT DU KARMA</p>
              <p className="text-foreground text-sm">
                Ton karma actuel: <span className="font-bold" style={{ color: accentColor }}>{karma}</span>
              </p>
            </div>
          )}
          
          <div className="mt-12">
            <p className="text-xs font-mono uppercase tracking-[0.3em] animate-bounce" style={{ color: `${accentColor}99` }}>
              Clique pour commencer...
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
