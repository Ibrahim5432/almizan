/**
 * منطق التدرج الآمن للإطلاق (Launch Ramp-Up Schedule)
 * يمنع إغراق الموقع بمئات المقالات دفعة واحدة (تجنبًا لشبهة Scaled Content Abuse)،
 * ويضمن بناء أرشيف عضوي تدريجي موثوق مع عدم إرجاع تواريخ النشر (No Backdating).
 */

export interface RampPhase {
  weekNumber: number;
  labelAr: string;
  maxArticlesPerDay: number;
  requiredPublishMode: 'review_all' | 'hybrid';
  minConfidenceThreshold: number;
  evergreenTargetPerWeek: number;
}

export const LAUNCH_RAMP_SCHEDULE: RampPhase[] = [
  {
    weekNumber: 1,
    labelAr: 'الأسبوع الأول: التأسيس والتحقق اليدوي الصارم',
    maxArticlesPerDay: 3,
    requiredPublishMode: 'review_all',
    minConfidenceThreshold: 0.92,
    evergreenTargetPerWeek: 2,
  },
  {
    weekNumber: 2,
    labelAr: 'الأسبوع الثاني: التوسع المتزن وبناء الشروحات',
    maxArticlesPerDay: 5,
    requiredPublishMode: 'review_all',
    minConfidenceThreshold: 0.90,
    evergreenTargetPerWeek: 3,
  },
  {
    weekNumber: 3,
    labelAr: 'الأسبوع الثالث: انتظام التغطية في الأقسام السبعة',
    maxArticlesPerDay: 8,
    requiredPublishMode: 'review_all',
    minConfidenceThreshold: 0.88,
    evergreenTargetPerWeek: 4,
  },
  {
    weekNumber: 4,
    labelAr: 'الأسبوع الرابع فما بعد: السعة التشغيلية القياسية',
    maxArticlesPerDay: 12,
    requiredPublishMode: 'hybrid',
    minConfidenceThreshold: 0.85,
    evergreenTargetPerWeek: 5,
  },
];

export function getEffectiveDailyCap(daysSinceLaunch: number, configuredMaxPerDay: number): {
  effectiveCap: number;
  activePhase: RampPhase;
} {
  const week = Math.max(1, Math.min(4, Math.ceil(Math.max(1, daysSinceLaunch) / 7)));
  const activePhase = LAUNCH_RAMP_SCHEDULE[week - 1] ?? LAUNCH_RAMP_SCHEDULE[3];
  return {
    effectiveCap: Math.min(configuredMaxPerDay, activePhase.maxArticlesPerDay),
    activePhase,
  };
}
