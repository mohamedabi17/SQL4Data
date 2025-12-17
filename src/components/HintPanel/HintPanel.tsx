import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Task } from "../../assets/tasks/tasks";
import { generateHints } from "../../utils/hintGenerator";

interface HintPanelProps {
  task: Task | null;
  onHintUsed: (level: number) => void;
  onShowSolution: () => void;
  currentHintLevel: number;
  solutionShown: boolean;
}

export function HintPanel({
  task,
  onHintUsed,
  onShowSolution,
  currentHintLevel,
  solutionShown,
}: HintPanelProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!task) return null;

  const hints = generateHints(task);
  const canShowMoreHints = currentHintLevel < hints.length;

  // Calculate current penalty percentage
  const currentPenalty = solutionShown ? 100 : (currentHintLevel > 0 ? hints[currentHintLevel - 1].penalty : 0);
  const xpMultiplier = solutionShown ? 0 : (100 - currentPenalty);

  const requestNextHint = () => {
    if (canShowMoreHints) {
      onHintUsed(currentHintLevel + 1);
    }
  };

  return (
    <div className="mb-4">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">💡</span>
          <span className="font-medium text-amber-800 dark:text-amber-200">
            {t("hints.title")}
          </span>
          {currentHintLevel > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-full">
              {currentHintLevel}/{hints.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Current XP Multiplier Badge */}
          {(currentHintLevel > 0 || solutionShown) && (
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${solutionShown
                ? "bg-rose-200 dark:bg-rose-800 text-rose-800 dark:text-rose-200"
                : "bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200"
              }`}>
              {solutionShown ? "0% XP" : `${xpMultiplier}% XP`}
            </span>
          )}
          <svg
            className={`w-5 h-5 text-amber-600 dark:text-amber-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="mt-2 p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg animate-scale-in">

          {/* Current XP Status Banner */}
          {(currentHintLevel > 0 || solutionShown) && (
            <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${solutionShown
                ? "bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800"
                : "bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800"
              }`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{solutionShown ? "⚠️" : "📉"}</span>
                <span className={`text-sm font-medium ${solutionShown ? "text-rose-700 dark:text-rose-300" : "text-amber-700 dark:text-amber-300"
                  }`}>
                  {solutionShown
                    ? t("hints.no_xp_warning")
                    : `${t("hints.penalty_info")}: -${currentPenalty}%`
                  }
                </span>
              </div>
              <span className={`text-2xl font-bold ${solutionShown ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"
                }`}>
                {xpMultiplier}% XP
              </span>
            </div>
          )}

          {/* Used Hints */}
          {currentHintLevel > 0 && (
            <div className="space-y-3 mb-4">
              {hints.slice(0, currentHintLevel).map((hint, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200/50 dark:border-amber-700/50"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold text-sm">#{index + 1}</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{hint.hint}</p>
                  </div>
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    -{hint.penalty}% XP
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Next Hint Button */}
            {canShowMoreHints && !solutionShown && (
              <button
                onClick={requestNextHint}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
              >
                <span>💡</span>
                <span>{t("hints.get_hint")}</span>
                <span className="text-xs opacity-75">(-{hints[currentHintLevel].penalty}% XP)</span>
              </button>
            )}

            {/* Show Solution Button */}
            {!solutionShown && (
              <button
                onClick={onShowSolution}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium transition-colors"
              >
                <span>👁️</span>
                <span>{t("hints.show_solution")}</span>
                <span className="text-xs opacity-75">(0 XP)</span>
              </button>
            )}

            {/* Solution Shown Indicator */}
            {solutionShown && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400">
                <span>✓</span>
                <span>{t("hints.solution_revealed")}</span>
              </div>
            )}
          </div>

          {/* Solution Display */}
          {solutionShown && (
            <div className="mt-4 p-4 rounded-lg bg-slate-900 dark:bg-slate-950 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-emerald-400">📝</span>
                <span className="text-sm font-medium text-emerald-400">{t("hints.solution")}</span>
              </div>
              <pre className="text-sm text-emerald-300 font-mono overflow-x-auto whitespace-pre-wrap">
                {task.referenceSql}
              </pre>
              <p className="mt-2 text-xs text-rose-400">
                ⚠️ {t("hints.no_xp_warning")}
              </p>
            </div>
          )}

          {/* XP Penalty Info */}
          {!solutionShown && (
            <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">{t("hints.penalty_info")}: </span>
                {t("hints.penalty_description")}
              </p>
              <div className="mt-2 flex gap-2">
                {hints.map((hint, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 text-xs rounded ${index < currentHintLevel
                        ? "bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200"
                        : "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400"
                      }`}
                  >
                    Hint {index + 1}: -{hint.penalty}%
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
