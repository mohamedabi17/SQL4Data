import { useEffect, useState } from "react";
import { BADGES, Badge } from "../../store/reducers/gameReducer";

interface BadgeUnlockProps {
  badgeId: string;
  onComplete: () => void;
}

export function BadgeUnlock({ badgeId, onComplete }: BadgeUnlockProps) {
  const [visible, setVisible] = useState(true);
  const badge = BADGES.find(b => b.id === badgeId);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!badge) return null;

  return (
    <div
      className={`
        fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
        flex flex-col items-center gap-4 p-8 rounded-2xl
        bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-2xl
        transition-all duration-300
        ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
      `}
    >
      {/* Badge Icon */}
      <div className="text-7xl animate-bounce drop-shadow-lg">
        {badge.icon}
      </div>

      {/* Badge Info */}
      <div className="text-center">
        <p className="text-lg font-medium text-white/80 uppercase tracking-wider">Achievement Unlocked!</p>
        <p className="text-3xl font-bold mt-2">{badge.name}</p>
        <p className="text-white/80 mt-1">{badge.description}</p>
      </div>

      {/* Sparkle Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/60 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random()}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
