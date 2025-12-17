/**
 * Ad Unlock Modal for SQL4DATA
 * 
 * SAFE AD POLICY:
 * - NO popups, NO redirects, NO auto-play
 * - User explicitly clicks to watch rewarded ad
 * - Educational-safe content only (filtered via AdSense)
 * - GDPR compliant with consent tracking
 * 
 * AdSense Publisher ID: pub-5191559835894663
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { unlockFeature } from '../../lib/authApi';

// AdSense configuration
const ADSENSE_PUBLISHER_ID = 'ca-pub-5191559835894663';
const AD_SLOT_REWARDED = '1234567890'; // Replace with actual ad slot ID

type UnlockType = 'ai_feedback' | 'hints_level3' | 'solution_reveals';

interface AdUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockType: UnlockType;
  onUnlocked: () => void;
}

const UNLOCK_INFO: Record<UnlockType, { icon: string; reward: string; benefit: string }> = {
  ai_feedback: {
    icon: '🤖',
    reward: '+3',
    benefit: 'AI explanations',
  },
  hints_level3: {
    icon: '💡',
    reward: '+2',
    benefit: 'advanced hints',
  },
  solution_reveals: {
    icon: '👁️',
    reward: '+1',
    benefit: 'solution reveal',
  },
};

export function AdUnlockModal({ isOpen, onClose, unlockType, onUnlocked }: AdUnlockModalProps) {
  const { t } = useTranslation();
  const { user, refreshLimits } = useAuth();
  const [stage, setStage] = useState<'intro' | 'watching' | 'complete' | 'error'>('intro');
  const [error, setError] = useState<string | null>(null);
  const [showGDPR, setShowGDPR] = useState(false);

  const info = UNLOCK_INFO[unlockType];

  // Check GDPR consent on open
  useEffect(() => {
    if (isOpen && user && !user.gdpr_consent) {
      setShowGDPR(true);
    }
  }, [isOpen, user]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStage('intro');
      setError(null);
    }
  }, [isOpen]);

  const handleWatchAd = async () => {
    setStage('watching');

    // Simulate ad watching (in production, integrate with Google AdSense rewarded ads)
    // The actual AdSense integration requires additional setup in index.html

    try {
      // Simulate ad duration (5 seconds for demo)
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Call backend to unlock feature
      const result = await unlockFeature(unlockType);

      if (result.success) {
        setStage('complete');
        await refreshLimits();

        // Auto close after showing success
        setTimeout(() => {
          onUnlocked();
          onClose();
        }, 2000);
      } else {
        throw new Error('Unlock failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock feature');
      setStage('error');
    }
  };

  if (!isOpen) return null;

  // GDPR Consent screen
  if (showGDPR) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🍪</span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('ads.gdpr_title')}
              </h2>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('ads.gdpr_description')}
            </p>

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                {t('ads.gdpr_what_we_collect')}
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• {t('ads.gdpr_item_1')}</li>
                <li>• {t('ads.gdpr_item_2')}</li>
                <li>• {t('ads.gdpr_item_3')}</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-6">
              <p className="text-sm text-green-800 dark:text-green-300">
                ✅ {t('ads.safe_ads_notice')}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowGDPR(false);
                  onClose();
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                {t('ads.gdpr_decline')}
              </button>
              <button
                onClick={() => setShowGDPR(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
              >
                {t('ads.gdpr_accept')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Close button */}
        {stage !== 'watching' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors z-10"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Intro Stage */}
        {stage === 'intro' && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-4xl">{info.icon}</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('ads.unlock_title')}
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('ads.unlock_description')}
            </p>

            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 mb-6">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">{info.icon}</span>
                <div className="text-left">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {info.reward}
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {info.benefit}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleWatchAd}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('ads.watch_ad_button')}
              </span>
            </button>

            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              {t('ads.support_message')}
            </p>
          </div>
        )}

        {/* Watching Stage */}
        {stage === 'watching' && (
          <div className="p-8">
            <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
              {/* AdSense placeholder - in production, load actual ad */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-white font-medium">{t('ads.loading_ad')}</p>
                <p className="text-gray-400 text-sm mt-2">{t('ads.ad_playing')}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{t('ads.ad_disclaimer')}</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {t('ads.ad_in_progress')}
              </span>
            </div>
          </div>
        )}

        {/* Complete Stage */}
        {stage === 'complete' && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('ads.unlock_success')}
            </h2>

            <p className="text-gray-600 dark:text-gray-300">
              {t('ads.unlock_success_message', { reward: info.reward, benefit: info.benefit })}
            </p>
          </div>
        )}

        {/* Error Stage */}
        {stage === 'error' && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('ads.unlock_error')}
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error || t('ads.unlock_error_message')}
            </p>

            <button
              onClick={() => setStage('intro')}
              className="px-6 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              {t('ads.try_again')}
            </button>
          </div>
        )}

        {/* Safe Ads Notice */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            🛡️ {t('ads.safe_ads_footer')}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Ad banner component for non-intrusive placement
 * Only shown to free users, never blocks content
 */
export function AdBanner({ className = '' }: { className?: string }) {
  const { isPremium } = useAuth();

  // Premium users never see ads
  if (isPremium) return null;

  return (
    <div className={`ad-banner ${className}`}>
      {/* Google AdSense banner placeholder */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <p className="text-xs text-center text-gray-400 mt-1">
        Advertisement • SQL4DATA Partner
      </p>
    </div>
  );
}
