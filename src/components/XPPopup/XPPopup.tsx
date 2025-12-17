import { useEffect, useState } from "react";

interface XPPopupProps {
  xp: number;
  isFirstTry: boolean;
  streak: number;
  onComplete: () => void;
}

export function XPPopup({ xp, isFirstTry, streak, onComplete }: XPPopupProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 300);
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`
        fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
        flex flex-col items-center gap-4 p-8 rounded-2xl
        bg-gradient-to-br from-[#442a65] to-[#87888a] text-white shadow-2xl
        transition-all duration-300
        ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
      `}
    >
      {/* Success Icon */}
      <div className="text-6xl animate-bounce">🎉</div>

      {/* XP Earned */}
      <div className="text-center">
        <p className="text-lg font-medium text-white/80">Correct!</p>
        <p className="text-5xl font-bold animate-pulse">+{xp} XP</p>
      </div>

      {/* Bonuses */}
      <div className="flex flex-wrap justify-center gap-2">
        {isFirstTry && (
          <div className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium flex items-center gap-1">
            <span>⭐</span> First Try Bonus!
          </div>
        )}
        {streak > 1 && (
          <div className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium flex items-center gap-1">
            <span>🔥</span> {streak}x Streak!
          </div>
        )}
      </div>
    </div>
  );
}
