import { z } from 'zod';

export const EDITORIAL_SECTIONS = [
  { id: 'syria', slug: 'syria', name: 'أخبار سوريا', description: 'تغطية شاملة وموثقة للشأن السوري، الاقتصاد والمعيشة، إعادة الإعمار، القرارات الخدمية، وأخبار المحافظات السورية.', lowRiskAllowed: true, dailyQuota: 4 },
  { id: 'arab-world', slug: 'arab-world', name: 'العالم العربي', description: 'متابعة التطورات السياسية والاقتصادية والدبلوماسية في الدول العربية والمشرق والخليج وشمال أفريقيا.', lowRiskAllowed: true, dailyQuota: 4 },
  { id: 'economy', slug: 'economy', name: 'اقتصاد ومعيشة', description: 'تقارير الأسواق والبنوك المركزية والتجارة والطاقة وأسعار السلع ومؤشرات التنمية الاقتصادية.', lowRiskAllowed: true, dailyQuota: 3 },
  { id: 'politics', slug: 'politics', name: 'سياسة ودوليات', description: 'تغطية الشؤون الدبلوماسية والعلاقات الدولية والسياسات العامة بموضوعية وتوثيق رسمي.', lowRiskAllowed: true, dailyQuota: 3 },
  { id: 'technology', slug: 'technology', name: 'تكنولوجيا', description: 'تطورات التقنية والبرمجيات والبنية الرقمية والأمن السيبراني والاتصالات.', lowRiskAllowed: true, dailyQuota: 2 },
  { id: 'science-health', slug: 'science-health', name: 'علوم وصحة', description: 'الأبحاث العلمية المحكّمة والفضاء والبيئة وتقارير المنظمات الصحية الرسمية.', lowRiskAllowed: true, dailyQuota: 2 },
  { id: 'culture-society', slug: 'culture-society', name: 'ثقافة ومجتمع', description: 'الحراك الثقافي والكتب والفنون والتعليم والتراث السوري والعربي.', lowRiskAllowed: true, dailyQuota: 2 },
  { id: 'sports', slug: 'sports', name: 'رياضة', description: 'نتائج البطولات العربية والسورية والدولية وإحصاءات المنافسات الرسمية.', lowRiskAllowed: true, dailyQuota: 2 },
  { id: 'analysis', slug: 'analysis', name: 'تحليلات وشروحات', description: 'قراءات معمقة وشروحات وملفات "ماذا حدث ولماذا يهم" لفهم خلفيات الأحداث السورية والعربية.', lowRiskAllowed: true, dailyQuota: 2 },
] as const;

export type EditorialSectionSlug = (typeof EDITORIAL_SECTIONS)[number]['slug'];

export const PublishModeSchema = z.enum(['review_all', 'hybrid', 'auto_low_risk']);
export type PublishMode = z.infer<typeof PublishModeSchema>;

export const ApprovalMethodSchema = z.enum([
  'email_magic_links',
  'telegram_bot',
  'ntfy_push',
  'direct_auto',
]);
export type ApprovalMethod = z.infer<typeof ApprovalMethodSchema>;

export interface SiteConfig {
  siteName: string;
  siteTagline: string;
  domain: string;
  primaryLanguage: 'ar';
  direction: 'rtl';
  secondaryLanguage: string | null;
  countryOrRegionFocus: string;
  timezone: string;
  publisherLegalName: string;
  editorInChiefName: string;
  editorBio: string;
  contactEmail: string;
  physicalAddressOrCity: string;
  brandPrimaryColor: string;
  brandAccentColor: string;
  brandPaperColor: string;
  brandUrgentColor: string;
  numeralSystem: 'western' | 'eastern';
  maxArticlesPerDay: number;
  publishMode: PublishMode;
  approvalMethod: ApprovalMethod;
  telegramBotToken: string;
  telegramChatId: string;
  ntfyTopic: string;
  monthlyLlmBudgetUsd: number;
  killSwitchActive: boolean;
  adsEnabled: boolean;
  adsensePublisherId: string;
  adsenseVerificationMode: 'meta' | 'snippet' | 'none';
  cmpEnabled: boolean;
  aiIllustrativeImagesEnabled: boolean;
  seedDemo: boolean;
  llmModels: {
    provider: string;
    fast: string;
    writer: string;
    verifier: string;
    embedding: string;
  };
}

const env = typeof process !== 'undefined' && process.env ? process.env : ({} as Record<string, string | undefined>);

export const defaultSiteConfig: SiteConfig = {
  siteName: 'ميزان الخبر',
  siteTagline: 'تغطية موثقة لأخبار سوريا والعالم العربي والاقتصاد بالمصادر الرسمية',
  domain: 'mizanalkhabar.com',
  primaryLanguage: 'ar',
  direction: 'rtl',
  secondaryLanguage: null,
  countryOrRegionFocus: 'سوريا والعالم العربي والشرق الأوسط',
  timezone: 'Asia/Damascus',
  publisherLegalName: 'ميزان الخبر',
  editorInChiefName: 'إبراهيم',
  editorBio:
    'رئيس التحرير المشرف على السياسة التحريرية والتدقيق المصدري في منصة ميزان الخبر.',
  contactEmail: 'ibo19944991@gmail.com',
  physicalAddressOrCity:
    'منصة إعلامية رقمية مستقلة — التواصل عبر البريد الإلكتروني الرسمي',
  brandPrimaryColor: '#0B1220',
  brandAccentColor: '#B8892B',
  brandPaperColor: '#FAF7F2',
  brandUrgentColor: '#C0392B',
  numeralSystem: 'western',
  maxArticlesPerDay: 24,
  publishMode: 'auto_low_risk',
  approvalMethod: 'direct_auto',
  telegramBotToken: '',
  telegramChatId: '',
  ntfyTopic: 'mizan-khabar-ibrahim-991',
  monthlyLlmBudgetUsd: 50,
  killSwitchActive: false,
  adsEnabled: false,
  adsensePublisherId: env.ADSENSE_PUBLISHER_ID || '',
  adsenseVerificationMode: (env.ADSENSE_VERIFICATION_MODE as 'meta' | 'snippet' | 'none') || 'meta',
  cmpEnabled: env.CMP_ENABLED !== 'false',
  aiIllustrativeImagesEnabled: env.AI_ILLUSTRATIVE_IMAGES_ENABLED === 'true',
  seedDemo: env.SEED_DEMO !== 'false',
  llmModels: {
    provider: env.LLM_PROVIDER || 'gemini',
    fast: env.LLM_MODEL_FAST || 'gemini-3.8-flash',
    writer: env.LLM_MODEL_WRITER || 'gemini-3.8-flash',
    verifier: env.LLM_MODEL_VERIFIER || 'gemini-3.8-flash',
    embedding: env.LLM_MODEL_EMBEDDING || 'gemini-embedding-2-preview',
  },
};
