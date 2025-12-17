import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAIExplanation } from "../../lib/api";

interface AIFeedbackProps {
  query: string;
  taskId: string;
  errorMessage?: string;
  isVisible: boolean;
}

export function AIFeedback({ query, taskId, errorMessage, isVisible }: AIFeedbackProps) {
  const { t } = useTranslation();
  const [explanation, setExplanation] = useState<string | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [concepts, setConcepts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isVisible) {
      setExplanation(null);
      setHints([]);
      setConcepts([]);
      setError(null);
      return;
    }

    const fetchAIFeedback = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Convert task string ID to numeric index
        const { tasksList } = await import("../../assets/tasks/tasks");
        const taskIndex = tasksList.findIndex(t => t.id === taskId);
        const numericTaskId = taskIndex >= 0 ? taskIndex + 1 : 1;

        console.log('🤖 Requesting AI explanation from Gemini...');
        console.log('Task ID:', taskId, '-> Numeric:', numericTaskId);
        const response = await getAIExplanation({
          query,
          task_id: numericTaskId,
          error_message: errorMessage,
        });

        console.log('✅ AI explanation received:', response);
        setExplanation(response.explanation);
        setHints(response.hints || []);
        setConcepts(response.suggested_concepts || []);
      } catch (err) {
        console.error('❌ Failed to get AI explanation:', err);
        setError(t('ai_feedback_error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAIFeedback();
  }, [isVisible, query, taskId, errorMessage, t]);

  if (!isVisible) return null;

  return (
    <div className="mb-4 p-5 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🤖</span>
        <h3 className="text-base font-bold text-purple-900 dark:text-purple-200">
          {t('ai_feedback_title')}
        </h3>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full" />
          <span className="text-sm">{t('ai_feedback_loading')}</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {!isLoading && !error && explanation && (
        <div className="space-y-4">
          {/* Main Explanation */}
          <div>
            <p className="text-sm text-purple-900 dark:text-purple-100 leading-relaxed">
              {explanation}
            </p>
          </div>

          {/* Hints Section */}
          {hints.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2">
                <span>💡</span> {t('ai_feedback_hints')}
              </h4>
              <ul className="space-y-2">
                {hints.map((hint, index) => (
                  <li
                    key={index}
                    className="text-sm text-purple-800 dark:text-purple-200 pl-4 border-l-2 border-purple-300 dark:border-purple-600"
                  >
                    {hint}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Concepts to Review */}
          {concepts.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2">
                <span>📚</span> {t('ai_feedback_concepts')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {concepts.map((concept, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs font-medium bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 rounded-full"
                  >
                    {concept}
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
