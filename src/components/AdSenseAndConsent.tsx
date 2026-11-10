import React, { useEffect, useState } from 'react';
import { SiteConfig } from '../../config/site.config';

export interface AdSlotProps {
  slotId: string;
  format?: 'horizontal' | 'rectangle' | 'in-article';
  siteConfig: SiteConfig;
  sensitivityLevel?: 'normal' | 'elevated' | 'high_no_ads';
  isRestrictedPage?: boolean;
  consentGranted: boolean;
}

/**
 * مكوّن <AdSlot /> الموحد:
 * - لا يُحمّل شيئًا على الإطلاق إذا كان ADS_ENABLED=false (الافتراضي قبل قبول ادسنس).
 * - يتعطّل تلقائيًا في الصفحات المحظورة (404، البحث الفارغ، الإدارة) وفي المقالات شديدة الحساسية (high_no_ads).
 * - عند التفعيل بعد القبول والموافقة، يحجز مساحة ثابتة (min-height) لمنع CLS ويحمل وسم "إعلان" واضحًا ومحايدًا.
 */
export const AdSlot: React.FC<AdSlotProps> = ({
  slotId,
  format = 'in-article',
  siteConfig,
  sensitivityLevel = 'normal',
  isRestrictedPage = false,
  consentGranted,
}) => {
  if (
    !siteConfig.adsEnabled ||
    !siteConfig.adsensePublisherId ||
    siteConfig.adsensePublisherId.includes('TODO') ||
    isRestrictedPage ||
    sensitivityLevel === 'high_no_ads'
  ) {
    return null;
  }

  const minHeightClass =
    format === 'horizontal'
      ? 'min-h-[96px]'
      : format === 'rectangle'
        ? 'min-h-[260px]'
        : 'min-h-[220px]';

  return (
    <aside
      aria-label="مساحة إعلانية"
      data-testid={`ad-slot-${slotId}`}
      className={`my-6 w-full border border-[#E2DACB] dark:border-[#1E293B] bg-[#F3EFE6]/60 dark:bg-[#111C33]/60 p-3 flex flex-col items-center justify-center ${minHeightClass}`}
    >
      <div className="w-full flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-2 pb-1 border-b border-[#E2DACB]/70 dark:border-[#1E293B]">
        <span>إعلان</span>
        <span className="font-mono text-[10px]">
          {consentGranted ? 'Google AdSense (Personalized/Contextual)' : 'إعلان سياقي غير مخصص (Non-Personalized)'}
        </span>
      </div>
      <div className="flex-1 w-full flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 font-mono">
        ca-{siteConfig.adsensePublisherId.replace(/^ca-/, '')} · Slot: {slotId}
      </div>
    </aside>
  );
};

export interface ConsentState {
  decided: boolean;
  analytics: boolean;
  advertising: boolean;
  regionMode: 'GDPR_TCF_KVKK';
  updatedAt: string;
}

const CONSENT_STORAGE_KEY = 'almizan_cmp_consent_v1';

export function loadConsentState(): ConsentState {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as ConsentState;
    }
  } catch {
    // ignore storage errors
  }
  return {
    decided: false,
    analytics: false,
    advertising: false,
    regionMode: 'GDPR_TCF_KVKK',
    updatedAt: new Date().toISOString(),
  };
}

export const ConsentBanner: React.FC<{
  enabled: boolean;
  consent: ConsentState;
  onUpdateConsent: (next: ConsentState) => void;
  onNavigateLegal: (slug: string) => void;
}> = ({ enabled, consent, onUpdateConsent, onNavigateLegal }) => {
  const [dismissedInSession, setDismissedInSession] = useState(false);

  useEffect(() => {
    if (consent.decided) {
      setDismissedInSession(true);
    }
  }, [consent.decided]);

  if (!enabled || consent.decided || dismissedInSession) {
    return null;
  }

  const handleChoice = (acceptAll: boolean) => {
    const next: ConsentState = {
      decided: true,
      analytics: acceptAll,
      advertising: acceptAll,
      regionMode: 'GDPR_TCF_KVKK',
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    setDismissedInSession(true);
    onUpdateConsent(next);
  };

  return (
    <section
      aria-label="إشعار الخصوصية وملفات تعريف الارتباط"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-[#E2DACB] dark:border-[#1E293B] bg-[#FAF7F2]/98 dark:bg-[#0B1220]/98 backdrop-blur px-4 py-3 shadow-lg"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl">
          <strong>إشعار الخصوصية وحماية البيانات (GDPR &amp; KVKK):</strong> نستخدم ملفات ارتباط تقنية ضرورية لتشغيل الموقع وحفظ تفضيلات القراءة. لا يتم تحميل أي سكربتات إعلانية أو تتبعية إلا بعد موافقتك الصريحة وفق إطار الشفافية والموافقة المعتمد. راجع{' '}
          <button
            type="button"
            onClick={() => onNavigateLegal('privacy')}
            className="underline text-[#B8892B] hover:text-[#0B1220] dark:hover:text-white font-medium"
          >
            سياسة الخصوصية
          </button>{' '}
          و{' '}
          <button
            type="button"
            onClick={() => onNavigateLegal('cookies')}
            className="underline text-[#B8892B] hover:text-[#0B1220] dark:hover:text-white font-medium"
          >
            سياسة ملفات الارتباط
          </button>
          .
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleChoice(false)}
            className="px-3 py-1.5 border border-[#0B1220]/30 dark:border-slate-600 text-[#0B1220] dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors whitespace-nowrap shrink-0 font-medium"
          >
            الضرورية فقط
          </button>
          <button
            type="button"
            onClick={() => handleChoice(true)}
            className="px-4 py-1.5 bg-[#0B1220] text-[#FAF7F2] dark:bg-[#B8892B] dark:text-[#0B1220] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 font-semibold"
          >
            موافقة وحفظ التفضيلات
          </button>
        </div>
      </div>
    </section>
  );
};
