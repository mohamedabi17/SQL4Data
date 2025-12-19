import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { CloseIcon } from "../../assets/icons/CloseIcon";
import { Button } from "../Button/Button";

interface SubscriptionPageProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PlanCardProps {
  name: string;
  price: string;
  period: string;
  features: PlanFeature[];
  isPopular?: boolean;
  isPremium?: boolean;
  buttonText: string;
  onSelect: () => void;
  disabled?: boolean;
}

function PlanCard({
  name,
  price,
  period,
  features,
  isPopular,
  isPremium,
  buttonText,
  onSelect,
  disabled,
}: PlanCardProps) {
  return (
    <div
      className={`relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 ${isPopular
        ? 'border-[#442a65] dark:border-purple-500 shadow-xl shadow-[#442a65]/20'
        : 'border-gray-200 dark:border-slate-700'
        } ${isPremium ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10' : 'bg-white dark:bg-slate-900'}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 bg-gradient-to-r from-[#442a65] to-[#87888a] text-white text-[10px] sm:text-xs font-bold rounded-full whitespace-nowrap">
          Most Popular
        </div>
      )}

      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{name}</h3>
        <div className="mt-3 sm:mt-4">
          <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{price}</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">/{period}</span>
        </div>
      </div>

      <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className={`text-sm flex-shrink-0 ${feature.included ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}`}>
              {feature.included ? '✓' : '✗'}
            </span>
            <span className={`text-xs sm:text-sm ${feature.included
              ? 'text-gray-700 dark:text-gray-300'
              : 'text-gray-400 dark:text-gray-500 line-through'
              }`}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <Button
        variant={isPopular ? 'primary' : 'secondary'}
        size="medium"
        fill="fillContainer"
        onPress={onSelect}
        isDisabled={disabled}
      >
        {buttonText}
      </Button>
    </div>
  );
}

export function SubscriptionPage({ isOpen, onClose }: SubscriptionPageProps) {
  const { t } = useTranslation();
  const { isAuthenticated, isPremium, user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly'); // Default to yearly
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // €4.99 Micro-SaaS Pricing
  const monthlyPrice = 4.99;
  const yearlyPrice = 49.90;
  const yearlyMonthly = 4.15; // (49.90 / 12 = ~4.15)
  const yearlySavings = Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100); // ~17% = 2 months free

  const freePlanFeatures: PlanFeature[] = [
    { text: t('subscription.feature_basic_exercises'), included: true },
    { text: t('subscription.feature_limited_hints'), included: true },
    { text: t('subscription.feature_progress_tracking'), included: true },
    { text: t('subscription.feature_ai_feedback_free'), included: true }, // 3 per day
    { text: t('subscription.feature_unlimited_hints'), included: false },
    { text: t('subscription.feature_ai_feedback_premium'), included: false },
    { text: t('subscription.feature_solutions_access'), included: false },
    { text: t('subscription.feature_no_ads'), included: false },
    { text: t('subscription.feature_priority_support'), included: false },
  ];

  const premiumFeatures: PlanFeature[] = [
    { text: t('subscription.feature_basic_exercises'), included: true },
    { text: t('subscription.feature_all_exercises'), included: true },
    { text: t('subscription.feature_progress_tracking'), included: true },
    { text: t('subscription.feature_unlimited_hints'), included: true },
    { text: t('subscription.feature_ai_feedback_premium'), included: true }, // 50 per day
    { text: t('subscription.feature_solutions_access'), included: true },
    { text: t('subscription.feature_no_ads'), included: true },
    { text: t('subscription.feature_priority_support'), included: true },
    { text: t('subscription.feature_offline_access'), included: true },
  ];

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      onClose();
      return;
    }

    setIsProcessing(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';

      // Get user email from auth context
      if (!user?.email) {
        throw new Error('User email not found. Please log in again.');
      }

      // Use the existing /api/payment endpoint (deployed on Render)
      const response = await fetch(`${apiUrl}/api/payment/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          billing_cycle: billingCycle
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || 'Failed to create checkout session');
      }

      const data = await response.json();

      // Redirect to Stripe Checkout (deployed version returns 'url' field)
      if (data.url) {
        window.location.href = data.url;
      } else if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert(`Failed to start checkout: ${error instanceof Error ? error.message : 'Please try again'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl my-2 sm:my-8 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative p-3 sm:p-6 text-center border-b border-gray-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 mb-3 sm:mb-4 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full">
            <span className="text-sm">⭐</span>
            <span className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-400">
              {t('subscription.upgrade_to_premium')}
            </span>
          </div>

          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t('subscription.choose_plan')}
          </h2>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-4">
            {t('subscription.unlock_potential')}
          </p>

          {/* Billing Toggle */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
            <span className={`text-xs sm:text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
              {t('subscription.monthly')}
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-12 sm:w-14 h-6 sm:h-8 rounded-full transition-colors flex-shrink-0 ${billingCycle === 'yearly'
                ? 'bg-gradient-to-r from-[#442a65] to-[#87888a]'
                : 'bg-gray-200 dark:bg-slate-700'
                }`}
            >
              <div className={`absolute top-0.5 sm:top-1 w-5 sm:w-6 h-5 sm:h-6 bg-white rounded-full shadow-md transition-all duration-200 ${billingCycle === 'yearly' ? 'left-6 sm:left-7' : 'left-0.5 sm:left-1'
                }`} />
            </button>
            <span className={`text-xs sm:text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
              {t('subscription.yearly')}
            </span>
            {billingCycle === 'yearly' && (
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-xs font-bold rounded-full">
                {t('subscription.two_months_free')}
              </span>
            )}
          </div>
        </div>

        {/* Plans */}
        <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(100vh-200px)] sm:max-h-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
            {/* Free Plan */}
            <PlanCard
              name={t('subscription.free_plan')}
              price="€0"
              period={t('subscription.forever')}
              features={freePlanFeatures}
              buttonText={t('subscription.current_plan')}
              onSelect={() => { }}
              disabled={true}
            />

            {/* Premium Plan */}
            <PlanCard
              name={t('subscription.premium_plan')}
              price={billingCycle === 'yearly' ? `€${yearlyMonthly}` : `€${monthlyPrice}`}
              period={t('subscription.month')}
              features={premiumFeatures}
              isPopular={true}
              isPremium={true}
              buttonText={
                isPremium
                  ? t('subscription.current_plan')
                  : isProcessing
                    ? t('subscription.processing')
                    : t('subscription.get_premium')
              }
              onSelect={handleSubscribe}
              disabled={isPremium || isProcessing}
            />
          </div>

          {/* Yearly price note */}
          {billingCycle === 'yearly' && !isPremium && (
            <p className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <span className="line-through text-gray-400 mr-2">€{monthlyPrice}/mo</span>
              {t('subscription.billed_yearly', { price: yearlyPrice.toFixed(2) })}
              <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                ({t('subscription.save_two_months')})
              </span>
            </p>
          )}

          {/* Monthly price note */}
          {billingCycle === 'monthly' && !isPremium && (
            <p className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {t('subscription.billed_monthly', { price: monthlyPrice.toFixed(2) })}
            </p>
          )}

          {/* Features comparison for premium */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-xl bg-gradient-to-r from-[#442a65]/5 to-[#87888a]/5 dark:from-[#442a65]/10 dark:to-[#87888a]/10 border border-[#442a65]/20">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 text-center">
              {t('subscription.why_premium')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4">
                <span className="text-2xl sm:text-3xl mb-1 sm:mb-2 block">🚀</span>
                <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">{t('subscription.benefit_unlimited')}</h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('subscription.benefit_unlimited_desc')}
                </p>
              </div>
              <div className="text-center p-3 sm:p-4">
                <span className="text-2xl sm:text-3xl mb-1 sm:mb-2 block">🤖</span>
                <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">{t('subscription.benefit_ai')}</h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('subscription.benefit_ai_desc')}
                </p>
              </div>
              <div className="text-center p-3 sm:p-4">
                <span className="text-2xl sm:text-3xl mb-1 sm:mb-2 block">💡</span>
                <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">{t('subscription.benefit_solutions')}</h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('subscription.benefit_solutions_desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Money back guarantee */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <span className="mr-1 sm:mr-2">💯</span>
              {t('subscription.money_back_guarantee')}
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
