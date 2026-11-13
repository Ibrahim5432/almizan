import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  Pause,
  Play,
  Scale,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import {
  ArticleRecord,
  AuthorRecord,
  CategorySlug,
  EDITORIAL_SECTIONS,
  ServiceDataWidget,
  TagRecord,
} from '../core/types';
import { SiteConfig } from '../../config/site.config';
import { buildEditorialDisclosure, generateTypographicSvgDataUri } from '../core/pipeline';
import { LegalPageContent } from '../core/seed-data';
import { formatArabicDate, formatNumerals } from '../utils/formatters';
import { AdSlot } from './AdSenseAndConsent';

/**
 * معالجة مسارات الصور المحلية والخارجية لضمان عملها في كل من الخادم المحلي وصفحات GitHub Pages (/almizan/)
 */
export function resolvePublicImageUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('data:')) {
    return rawUrl;
  }
  const cleanRel = rawUrl.replace(/^\/+/, '');
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  return base ? `${base}/${cleanRel}` : `/${cleanRel}`;
}

// ============================================================================
// 1. بطاقة الخبر العصرية الفاخرة (مع صور فوتوغرافية فريدة 100% وفولباك مستقل لكل مقال)
// ============================================================================
export const EditorialCard: React.FC<{
  article: ArticleRecord;
  size?: 'large' | 'medium' | 'horizontal' | 'compact';
  rankNumber?: number;
  numeralSystem: 'western' | 'eastern';
  onOpenArticle: (article: ArticleRecord) => void;
  onOpenCategory: (slug: CategorySlug) => void;
}> = ({ article, size = 'medium', rankNumber, numeralSystem, onOpenArticle, onOpenCategory }) => {
  const isBreaking = article.type === 'breaking';

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (!target.dataset.fallbackApplied) {
      target.dataset.fallbackApplied = 'true';
      target.src = generateTypographicSvgDataUri({
        kicker: article.categoryName,
        headline: article.headline,
        siteName: 'ميزان الخبر',
        uniqueSeed: article.id,
      });
    }
  };

  if (size === 'compact') {
    return (
      <article className="py-3.5 border-b border-[#E4DDD0] dark:border-[#1D2824] last:border-b-0 group flex items-start gap-3.5">
        {typeof rankNumber === 'number' && (
          <span className="font-royal text-2xl font-bold text-[#B88E35] dark:text-[#D4AF5A] tabular-nums leading-none pt-0.5 shrink-0">
            0{formatNumerals(rankNumber, numeralSystem)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-[#525E59] dark:text-[#98A6A0] mb-1">
            {isBreaking && (
              <>
                <span className="font-bold text-[#9E2A2B] dark:text-[#E05252]">عاجل</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <button
              type="button"
              onClick={() => onOpenCategory(article.categorySlug)}
              className="font-bold text-[#0B1F19] dark:text-[#D4AF5A] hover:underline"
            >
              {article.categoryName}
            </button>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {formatNumerals(article.readingTimeMin, numeralSystem)} د قراءة
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums text-[#B88E35] dark:text-[#D4AF5A] font-semibold">
              {formatNumerals(article.sources.length, numeralSystem)} مصادر
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold font-display leading-snug text-[#0B1311] dark:text-[#F4F0E8] group-hover:text-[#B88E35] transition-colors">
            <button
              type="button"
              onClick={() => onOpenArticle(article)}
              className="text-start w-full"
            >
              {article.headline}
            </button>
          </h3>
        </div>
      </article>
    );
  }

  if (size === 'horizontal') {
    return (
      <article className="grid grid-cols-1 sm:grid-cols-12 gap-4 border border-[#E4DDD0] dark:border-[#1D2824] bg-white dark:bg-[#0E1513] p-4 transition-all hover:border-[#B88E35] items-center group">
        <div className="sm:col-span-5 aspect-[16/10] w-full overflow-hidden bg-[#0B1F19] border border-[#E4DDD0] dark:border-[#1D2824] relative">
          <img
            src={resolvePublicImageUrl(article.image.url)}
            alt={article.image.alt}
            width={1200}
            height={675}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={handleImgError}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="sm:col-span-7 flex flex-col justify-between space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#525E59] dark:text-[#98A6A0]">
            {isBreaking && (
              <>
                <span className="font-bold text-[#9E2A2B] dark:text-[#E05252]">عاجل</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <button
              type="button"
              onClick={() => onOpenCategory(article.categorySlug)}
              className="font-bold text-[#0B1F19] dark:text-[#D4AF5A] hover:underline"
            >
              {article.categoryName}
            </button>
            <span aria-hidden="true">·</span>
            <span>{formatArabicDate(article.publishedAt, numeralSystem)}</span>
          </div>
          <h3 className="text-base lg:text-lg font-extrabold font-display leading-snug text-[#0B1311] dark:text-[#F4F0E8] group-hover:text-[#B88E35] transition-colors">
            <button
              type="button"
              onClick={() => onOpenArticle(article)}
              className="text-start"
            >
              {article.headline}
            </button>
          </h3>
          <p className="text-xs text-[#525E59] dark:text-[#98A6A0] leading-relaxed">
            {article.dek}
          </p>
          <div className="pt-1 flex items-center justify-between text-[11px] text-[#525E59] dark:text-[#98A6A0]">
            <span className="font-medium">{article.authorName}</span>
            <span className="tabular-nums font-bold text-[#B88E35] dark:text-[#D4AF5A]">
              موثق من {formatNumerals(article.sources.length, numeralSystem)} مصادر رسمية
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col justify-between border border-[#E4DDD0] dark:border-[#1D2824] bg-white dark:bg-[#0E1513] p-5 transition-all hover:border-[#B88E35] group">
      <div>
        <div className="aspect-[16/10] w-full overflow-hidden bg-[#0B1F19] mb-4 border border-[#E4DDD0] dark:border-[#1D2824] relative">
          <img
            src={resolvePublicImageUrl(article.image.url)}
            alt={article.image.alt}
            width={1200}
            height={675}
            loading={size === 'large' ? 'eager' : 'lazy'}
            referrerPolicy="no-referrer"
            onError={handleImgError}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-3 py-1.5 flex items-center justify-between text-[10px] text-[#F4F0E8]">
            <span className="truncate">{article.image.credit}</span>
            <span className="text-[#D4AF5A] font-semibold shrink-0 ms-2">صورة حصرية مرخّصة</span>
          </div>
        </div>

        {/* سطر البيانات الوصفية النظيف */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#525E59] dark:text-[#98A6A0] mb-2">
          {isBreaking && (
            <>
              <span className="font-bold text-[#9E2A2B] dark:text-[#E05252]">عاجل</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <button
            type="button"
            onClick={() => onOpenCategory(article.categorySlug)}
            className="font-bold text-[#0B1F19] dark:text-[#D4AF5A] hover:underline"
          >
            {article.categoryName}
          </button>
          <span aria-hidden="true">·</span>
          <span>{formatArabicDate(article.publishedAt, numeralSystem)}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {formatNumerals(article.readingTimeMin, numeralSystem)} د قراءة
          </span>
        </div>

        <h3
          className={`${
            size === 'large' ? 'text-2xl lg:text-3xl' : 'text-lg lg:text-xl'
          } font-extrabold font-display leading-snug text-[#0B1311] dark:text-[#F4F0E8] mb-2.5 group-hover:text-[#B88E35] transition-colors`}
        >
          <button
            type="button"
            onClick={() => onOpenArticle(article)}
            className="text-start"
          >
            {article.headline}
          </button>
        </h3>

        <p className="text-sm text-[#525E59] dark:text-slate-300 leading-relaxed mb-4">
          {article.dek}
        </p>
      </div>

      <div className="pt-3 border-t border-[#E4DDD0] dark:border-[#1D2824] flex items-center justify-between text-xs text-[#525E59] dark:text-[#98A6A0]">
        <span className="font-medium">{article.authorName}</span>
        <span className="tabular-nums font-bold text-[#B88E35] dark:text-[#D4AF5A]">
          موثق من {formatNumerals(article.sources.length, numeralSystem)} مصادر رسمية
        </span>
      </div>
    </article>
  );
};

// ============================================================================
// 2. الصفحة الرئيسية (HomeView) — القالب العصري الفاخر (Modern Luxury Broadsheet)
// ============================================================================
export const HomeView: React.FC<{
  articles: ArticleRecord[];
  widgets: ServiceDataWidget[];
  siteConfig: SiteConfig;
  consentGranted: boolean;
  onOpenArticle: (article: ArticleRecord) => void;
  onOpenCategory: (slug: CategorySlug) => void;
  onOpenTag: (tagSlug: string) => void;
  onOpenEditorialTeam?: () => void;
  onSubscribe: (email: string) => Promise<string>;
}> = ({
  articles,
  widgets,
  siteConfig,
  consentGranted,
  onOpenArticle,
  onOpenCategory,
  onOpenEditorialTeam,
  onSubscribe,
}) => {
  const rawPublished = articles.filter((a) => a.status === 'published');
  // تصدّر أهم خبر سوري حديث لقصة الغلاف الرئيسية بما ينسجم مع التوزيع التحريري (50% لسوريا و40% للعرب)
  const firstSyriaIdx = rawPublished.findIndex((a) => a.categorySlug === 'syria');
  const firstSyriaOrArabIdx =
    firstSyriaIdx >= 0
      ? firstSyriaIdx
      : rawPublished.findIndex((a) => a.categorySlug === 'arab-world');
  const published =
    firstSyriaOrArabIdx > 0
      ? [
          rawPublished[firstSyriaOrArabIdx],
          ...rawPublished.slice(0, firstSyriaOrArabIdx),
          ...rawPublished.slice(firstSyriaOrArabIdx + 1),
        ]
      : rawPublished;

  const wireArticles = published.slice(0, 6);
  const leadStory = published[0];
  const spotlightColumnStories = published.slice(1, 4);
  const photoReportageStories = published.slice(4, 8);
  const mostReadStories = [...published].sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 5);
  const analysisStories = published.filter((a) => a.categorySlug === 'analysis' || a.type === 'explainer');

  const [wireIndex, setWireIndex] = useState(0);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<'all' | CategorySlug>('all');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);

  useEffect(() => {
    if (tickerPaused || wireArticles.length <= 1) return;
    const id = setInterval(() => {
      setWireIndex((prev) => (prev + 1) % wireArticles.length);
    }, 6000);
    return () => clearInterval(id);
  }, [tickerPaused, wireArticles.length]);

  const activeWireItem = wireArticles[wireIndex % Math.max(1, wireArticles.length)] || leadStory;

  const filteredDepartmentStories =
    selectedDeptFilter === 'all'
      ? published.slice(8, 22)
      : published.filter((a) => a.categorySlug === selectedDeptFilter);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    const msg = await onSubscribe(newsletterEmail);
    setNewsletterStatus(msg);
    setNewsletterEmail('');
  };

  return (
    <div className="space-y-14">
      {/* ====================================================================
          1. شريط البرقيات الفاخر (Sovereign News Wire)
      ==================================================================== */}
      {activeWireItem && (
        <section
          aria-label="شريط البرقيات الإخبارية الموثقة"
          className="border border-[#B88E35]/45 bg-[#081511] text-[#FAF8F4] px-4 py-3 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-extrabold text-[#D4AF5A] shrink-0">
              برقية العدد ({formatNumerals(wireIndex + 1, siteConfig.numeralSystem)}/{formatNumerals(wireArticles.length, siteConfig.numeralSystem)})
            </span>
            <span aria-hidden="true" className="text-[#B88E35]/50">|</span>
            <span className="text-xs text-[#E8E1D3] font-semibold shrink-0 hidden sm:inline">
              {activeWireItem.categoryName}
            </span>
            <span aria-hidden="true" className="text-[#B88E35]/50 hidden sm:inline">·</span>
            <button
              type="button"
              onClick={() => onOpenArticle(activeWireItem)}
              className="text-xs sm:text-sm font-bold text-white hover:text-[#D4AF5A] truncate text-start transition-colors"
            >
              {activeWireItem.headline}
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0 text-xs">
            <span className="hidden md:inline text-[#D4AF5A] tabular-nums me-2">
              {formatNumerals(activeWireItem.sources.length, siteConfig.numeralSystem)} مصادر رسمية
            </span>
            <button
              type="button"
              onClick={() =>
                setWireIndex((prev) => (prev - 1 + wireArticles.length) % wireArticles.length)
              }
              aria-label="الخبر السابق"
              className="p-1 border border-[#B88E35]/40 hover:border-[#D4AF5A] text-[#E8E1D3] hover:text-[#D4AF5A]"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTickerPaused((p) => !p)}
              aria-label={tickerPaused ? 'تشغيل شريط الأخبار' : 'إيقاف شريط الأخبار مؤقتًا'}
              className="p-1 border border-[#B88E35]/40 hover:border-[#D4AF5A] text-[#E8E1D3] hover:text-[#D4AF5A]"
            >
              {tickerPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setWireIndex((prev) => (prev + 1) % wireArticles.length)}
              aria-label="الخبر التالي"
              className="p-1 border border-[#B88E35]/40 hover:border-[#D4AF5A] text-[#E8E1D3] hover:text-[#D4AF5A]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* ====================================================================
          2. واجهة الغلاف الرئيسية (Curatorial 7/5 Asymmetric Showcase)
      ==================================================================== */}
      {leadStory && (
        <section aria-label="التغطية الرئيسية" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* القصة الرئيسية الكبرى (7 أعمدة) */}
          <article className="lg:col-span-7 border border-[#E4DDD0] dark:border-[#1D2824] bg-white dark:bg-[#0E1513] p-6 lg:p-8 flex flex-col justify-between group hover:border-[#B88E35] transition-colors">
            <div>
              <div className="aspect-[16/9] w-full overflow-hidden bg-[#0B1F19] mb-5 border border-[#E4DDD0] dark:border-[#1D2824] relative">
                <img
                  src={resolvePublicImageUrl(leadStory.image.url)}
                  alt={leadStory.image.alt}
                  width={1200}
                  height={675}
                  fetchPriority="high"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.fallbackApplied) {
                      target.dataset.fallbackApplied = 'true';
                      target.src = generateTypographicSvgDataUri({
                        kicker: leadStory.categoryName,
                        headline: leadStory.headline,
                        siteName: 'ميزان الخبر',
                        uniqueSeed: leadStory.id,
                      });
                    }
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#F4F0E8]">
                  <span>{leadStory.image.credit}</span>
                  <span className="text-[#D4AF5A] font-bold">
                    {leadStory.image.license}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-[#525E59] dark:text-[#98A6A0] mb-3">
                <span className="font-extrabold text-[#9E2A2B] dark:text-[#E05252]">قصة الغلاف الرئيسية</span>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => onOpenCategory(leadStory.categorySlug)}
                  className="font-bold text-[#0B1F19] dark:text-[#D4AF5A] hover:underline"
                >
                  {leadStory.categoryName}
                </button>
                <span aria-hidden="true">·</span>
                <span>{formatArabicDate(leadStory.publishedAt, siteConfig.numeralSystem)}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  زمن القراءة: {formatNumerals(leadStory.readingTimeMin, siteConfig.numeralSystem)} دقائق
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-bold text-[#B88E35] dark:text-[#D4AF5A]">
                  موثق من {formatNumerals(leadStory.sources.length, siteConfig.numeralSystem)} مصادر رسمية
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-royal leading-snug text-[#0B1311] dark:text-[#F4F0E8] mb-3.5 group-hover:text-[#B88E35] transition-colors">
                <button
                  type="button"
                  onClick={() => onOpenArticle(leadStory)}
                  className="text-start"
                >
                  {leadStory.headline}
                </button>
              </h1>

              <p className="text-base text-[#525E59] dark:text-slate-300 leading-relaxed mb-6">
                {leadStory.dek}
              </p>
            </div>

            {/* أبرز ما جاء في التقرير للخبر الرئيسي */}
            <div className="border-t border-[#E4DDD0] dark:border-[#1D2824] bg-[#FAF8F4] dark:bg-[#080C0B] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold text-[#0B1F19] dark:text-[#D4AF5A]">
                  خلاصة الوقائع المحققة:
                </p>
                <button
                  type="button"
                  onClick={() => onOpenArticle(leadStory)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B88E35] hover:underline"
                >
                  <span>قراءة التقرير الكامل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-[#525E59] dark:text-slate-300 list-disc ps-5">
                {leadStory.keyPoints.slice(0, 3).map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          </article>

          {/* عمود مختارات الصدارة المصوّرة (5 أعمدة) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            <div className="border-b border-[#E4DDD0] dark:border-[#1D2824] pb-2.5 flex items-center justify-between">
              <h2 className="text-lg font-bold font-royal text-[#0B1311] dark:text-[#F4F0E8]">
                مختارات الصدارة المصوّرة
              </h2>
              <span className="text-xs font-bold text-[#B88E35] dark:text-[#D4AF5A]">
                صور حصرية غير مكررة
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-between gap-4">
              {spotlightColumnStories.map((story) => (
                <EditorialCard
                  key={story.id}
                  article={story}
                  size="horizontal"
                  numeralSystem={siteConfig.numeralSystem}
                  onOpenArticle={onOpenArticle}
                  onOpenCategory={onOpenCategory}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          3. بانوراما التقارير المصوّرة (4-Column Visual Photo-Reportage Strip)
      ==================================================================== */}
      {photoReportageStories.length > 0 && (
        <section
          aria-label="بانوراما التقارير المصورة"
          className="border border-[#E4DDD0] dark:border-[#1D2824] bg-[#F3EFE6]/70 dark:bg-[#0E1513] py-8 px-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-[#E4DDD0] dark:border-[#1D2824]">
            <div>
              <span className="text-xs font-bold text-[#B88E35] dark:text-[#D4AF5A]">
                عدسة «ميزان الخبر» التوثيقية · أرشيف بصري مستقل لكل تقرير
              </span>
              <h2 className="text-2xl font-bold font-royal text-[#0B1311] dark:text-[#F4F0E8] mt-0.5">
                بانوراما الملفات السورية والعربية والاقتصادية المصوّرة
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => onOpenCategory('syria')}
                className="font-bold text-[#0B1F19] dark:text-slate-200 hover:text-[#B88E35]"
              >
                ملف سوريا
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => onOpenCategory('arab-world')}
                className="font-bold text-[#0B1F19] dark:text-slate-200 hover:text-[#B88E35]"
              >
                العالم العربي وتركيا
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => onOpenCategory('economy')}
                className="font-bold text-[#0B1F19] dark:text-slate-200 hover:text-[#B88E35]"
              >
                الاقتصاد والأسواق
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {photoReportageStories.map((item, idx) => (
              <article
                key={item.id}
                className="bg-white dark:bg-[#080C0B] border border-[#E4DDD0] dark:border-[#1D2824] p-4 flex flex-col justify-between group hover:border-[#B88E35] transition-colors"
              >
                <div>
                  <div className="aspect-[16/10] w-full overflow-hidden bg-[#0B1F19] mb-3 relative">
                    <img
                      src={resolvePublicImageUrl(item.image.url)}
                      alt={item.image.alt}
                      width={600}
                      height={375}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.fallbackApplied) {
                          target.dataset.fallbackApplied = 'true';
                          target.src = generateTypographicSvgDataUri({
                            kicker: item.categoryName,
                            headline: item.headline,
                            siteName: 'ميزان الخبر',
                            uniqueSeed: item.id,
                          });
                        }
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-2 start-2 bg-[#081511]/90 text-[#D4AF5A] px-2 py-0.5 text-[10px] font-bold">
                      0{formatNumerals(idx + 1, siteConfig.numeralSystem)} · {item.categoryName}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold font-display text-[#0B1311] dark:text-[#F4F0E8] leading-snug mb-2 group-hover:text-[#B88E35] transition-colors">
                    <button
                      type="button"
                      onClick={() => onOpenArticle(item)}
                      className="text-start"
                    >
                      {item.headline}
                    </button>
                  </h3>
                </div>
                <div className="pt-2.5 border-t border-[#E4DDD0]/70 dark:border-[#1D2824] flex items-center justify-between text-[10px] text-[#525E59] dark:text-[#98A6A0]">
                  <span>{item.authorName}</span>
                  <span className="font-bold text-[#B88E35] dark:text-[#D4AF5A]">
                    {formatNumerals(item.sources.length, siteConfig.numeralSystem)} مصادر رسمية
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ====================================================================
          4. الشبكة المزدوجة: تغطيات الأقسام التفاعلية (8 أعمدة) + الجناح الجانبي (4 أعمدة)
      ==================================================================== */}
      <section aria-label="أقسام الجريدة والمؤشرات" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* العمود الرئيسي (8 أعمدة): فلتر الأقسام الفوري + شبكة المجلة + ملفات التحليلات */}
        <div className="lg:col-span-8 space-y-10">
          <div className="space-y-6">
            <div className="border-b border-[#E4DDD0] dark:border-[#1D2824] pb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold font-royal text-[#0B1311] dark:text-[#F4F0E8]">
                تغطيات الأقسام المتخصصة
              </h2>

              {/* أزرار التصفية التفاعلية السريعة */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedDeptFilter('all')}
                  className={`px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    selectedDeptFilter === 'all'
                      ? 'bg-[#0B1F19] text-[#FAF8F4] dark:bg-[#D4AF5A] dark:text-[#080C0B]'
                      : 'bg-[#F3EFE6] dark:bg-[#0E1513] text-[#525E59] dark:text-slate-300 hover:text-[#B88E35]'
                  }`}
                >
                  جميع الأقسام
                </button>
                {EDITORIAL_SECTIONS.slice(0, 6).map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setSelectedDeptFilter(sec.slug)}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                      selectedDeptFilter === sec.slug
                        ? 'bg-[#0B1F19] text-[#FAF8F4] dark:bg-[#D4AF5A] dark:text-[#080C0B]'
                        : 'bg-[#F3EFE6] dark:bg-[#0E1513] text-[#525E59] dark:text-slate-300 hover:text-[#B88E35]'
                    }`}
                  >
                    {sec.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDepartmentStories.map((article) => (
                <EditorialCard
                  key={article.id}
                  article={article}
                  size="medium"
                  numeralSystem={siteConfig.numeralSystem}
                  onOpenArticle={onOpenArticle}
                  onOpenCategory={onOpenCategory}
                />
              ))}
            </div>
          </div>

          {/* قسم خاص: تحليلات وشروحات معمقة ("ماذا حدث ولماذا يهم") */}
          {analysisStories.length > 0 && (
            <div className="border border-[#E4DDD0] dark:border-[#1D2824] bg-[#F3EFE6]/60 dark:bg-[#0E1513] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E4DDD0] dark:border-[#1D2824] pb-4">
                <div>
                  <span className="text-xs font-extrabold text-[#B88E35] dark:text-[#D4AF5A]">
                    ملفات التعمق التحريري · ماذا حدث ولماذا يهم؟
                  </span>
                  <h2 className="text-2xl font-bold font-royal text-[#0B1311] dark:text-[#F4F0E8] mt-1">
                    قراءات تحليلية وشروحات موثقة للخلفيات والآثار
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenCategory('analysis')}
                  className="text-xs font-bold text-[#0B1F19] dark:text-[#D4AF5A] hover:underline flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <span>الأرشيف الكامل للتحليلات</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-4">
                {analysisStories.map((story) => (
                  <EditorialCard
                    key={story.id}
                    article={story}
                    size="horizontal"
                    numeralSystem={siteConfig.numeralSystem}
                    onOpenArticle={onOpenArticle}
                    onOpenCategory={onOpenCategory}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* العمود الجانبي الفاخر (4 أعمدة): بطاقة المدقق اللغوي + موجز اليوم + الأكثر قراءة + مؤشرات الأسواق */}
        <aside className="lg:col-span-4 space-y-6">
          {/* بطاقة وحدة التدقيق اللغوي والفلترة الذكية وفحص الصور (الأستاذ علام الكيلاني) */}
          <div className="border border-[#B88E35]/50 bg-white dark:bg-[#0E1513] p-5 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E4DDD0] dark:border-[#1D2824]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#B88E35] dark:text-[#D4AF5A] shrink-0" />
                <h2 className="text-base font-bold font-royal text-[#0B1311] dark:text-[#F4F0E8]">
                  مكتب التدقيق اللغوي والفحص البصري
                </h2>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                نشط 24/7
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <p className="font-bold text-[#0B1311] dark:text-[#D4AF5A]">
                المدقق اللغوي والمصحح العام: أ. علام الكيلاني
              </p>
              <p className="text-[#525E59] dark:text-[#98A6A0] leading-relaxed">
                يخضع كل خبر وارد من المصادر الـ 45 لفحص لغوي ونحوي صارم يمنع ظهور أي رموز برمجية أو عبارات أجنبية أو كلمات مقطوعة، مع ضمان تخصيص صورة فوتوغرافية فريدة لكل مقال دون أي تكرار.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E4DDD0] dark:border-[#1D2824] text-[11px]">
              <div className="bg-[#FAF8F4] dark:bg-[#080C0B] p-2.5 border border-[#E4DDD0] dark:border-[#1D2824]">
                <span className="block text-[#525E59] dark:text-[#98A6A0]">نقاء اللغة العربية</span>
                <strong className="text-sm font-bold text-[#0B1311] dark:text-[#D4AF5A] tabular-nums">100% فصحى سليمة</strong>
              </div>
              <div className="bg-[#FAF8F4] dark:bg-[#080C0B] p-2.5 border border-[#E4DDD0] dark:border-[#1D2824]">
                <span className="block text-[#525E59] dark:text-[#98A6A0]">تفرد الصور ({formatNumerals(published.length, siteConfig.numeralSystem)} صورة)</span>
                <strong className="text-sm font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">0 تكرار</strong>
              </div>
            </div>

            {onOpenEditorialTeam && (
              <button
                type="button"
                onClick={onOpenEditorialTeam}
                className="w-full pt-1 text-xs font-bold text-[#B88E35] dark:text-[#D4AF5A] hover:underline flex items-center justify-between"
              >
                <span>استعراض الكادر الصحفي وهيئة التدقيق</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* موجز اليوم (Daily Digest) */}
          <div className="border border-[#B88E35]/40 bg-[#081511] text-[#FAF8F4] p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#B88E35]/30">
              <h2 className="text-lg font-bold font-royal text-[#D4AF5A]">
                موجز «ميزان الخبر» اليومي
              </h2>
              <span className="text-xs text-[#E8E1D3] font-bold">خلاصة العدد</span>
            </div>
            <p className="text-xs text-[#E8E1D3]/85 leading-relaxed mb-3.5">
              أهم الأخبار العاجلة والتقارير المرصودة اليوم من 45 شبكة إخبارية ووكالة رسمية عبر 100 صحفي ومراسل (50% سوريا · 40% العرب وتركيا · 10% دولي وتخصصي):
            </p>
            <ol className="space-y-3 text-xs leading-relaxed">
              {published.slice(0, 5).map((item, idx) => (
                <li key={item.id} className="flex items-start gap-2.5 pb-2.5 border-b border-[#B88E35]/20 last:border-b-0 last:pb-0">
                  <span className="font-royal text-lg font-bold text-[#D4AF5A] tabular-nums shrink-0 leading-none">
                    0{formatNumerals(idx + 1, siteConfig.numeralSystem)}.
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenArticle(item)}
                    className="text-start text-white hover:text-[#D4AF5A] font-bold leading-snug"
                  >
                    {item.headline}
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* الأكثر قراءة وتوثيقًا */}
          <div className="border border-[#E4DDD0] dark:border-[#1D2824] bg-white dark:bg-[#0E1513] p-5">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E4DDD0] dark:border-[#1D2824]">
              <h2 className="text-lg font-bold font-royal text-[#0B1311] dark:text-[#F4F0E8]">
                الأكثر قراءة وتوثيقًا
              </h2>
              <span className="text-xs text-[#B88E35] font-bold">ترتيب القراء</span>
            </div>
            <div className="divide-y divide-[#E4DDD0] dark:divide-[#1D2824]">
              {mostReadStories.map((item, idx) => (
                <EditorialCard
                  key={item.id}
                  article={item}
                  size="compact"
                  rankNumber={idx + 1}
                  numeralSystem={siteConfig.numeralSystem}
                  onOpenArticle={onOpenArticle}
                  onOpenCategory={onOpenCategory}
                />
              ))}
            </div>
          </div>

          {/* Widgets البيانات الخدمية المرخّصة مع إسناد المصدر */}
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className="border border-[#E4DDD0] dark:border-[#1D2824] bg-white dark:bg-[#0E1513] p-5"
            >
              <div className="pb-2.5 mb-3 border-b border-[#E4DDD0] dark:border-[#1D2824]">
                <h3 className="text-base font-bold font-royal text-[#0B1F19] dark:text-[#D4AF5A]">
                  {widget.title}
                </h3>
                <p className="text-[11px] text-[#525E59] dark:text-[#98A6A0] mt-0.5">
                  المصدر:{' '}
                  <a
                    href={widget.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[#B88E35]"
                  >
                    {widget.sourceName}
                  </a>
                </p>
              </div>
              <div className="space-y-2">
                {widget.items.map((row, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 border-b border-[#E4DDD0]/40 dark:border-[#1D2824] last:border-b-0"
                  >
                    <span className="text-[#525E59] dark:text-slate-300 font-semibold">{row.label}</span>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <span className="font-bold text-[#0B1311] dark:text-[#F4F0E8]">
                        {formatNumerals(row.value, siteConfig.numeralSystem)}
                      </span>
                      <span
                        className={
                          row.trend === 'up'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : row.trend === 'down'
                              ? 'text-rose-700 dark:text-rose-400'
                              : 'text-slate-500'
                        }
                      >
                        {formatNumerals(row.change, siteConfig.numeralSystem)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-[#525E59] dark:text-[#98A6A0]">
                {widget.licenseNote} · آخر تحديث: {formatArabicDate(widget.updatedAt, siteConfig.numeralSystem)}
              </p>
            </div>
          ))}
        </aside>
      </section>

      {/* وحدة إعلانية اختيارية بين الكتل */}
      <AdSlot
        slotId="home-mid-leaderboard"
        format="horizontal"
        siteConfig={siteConfig}
        consentGranted={consentGranted}
      />

      {/* دعوة الاشتراك في النشرة البريدية اليومية */}
      <section
        aria-label="الاشتراك في النشرة البريدية"
        className="border border-[#B88E35]/50 bg-[#081511] text-[#FAF8F4] p-8"
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#D4AF5A]">نشرة «موجز ميزان الخبر» المسائية · مجانًا</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-royal">
              اشترك في الملخص اليومي للتقارير الموثقة بالمصادر الرسمية
            </h2>
            <p className="text-xs text-[#E8E1D3]/90 leading-relaxed max-w-2xl">
              رسالة واحدة مساء كل يوم تلخص أهم الأخبار السورية والعربية والاقتصادية والشروحات التي اجتازت التدقيق المصدري واللغوي تحت إشراف رئيس التحرير ({siteConfig.editorInChiefName}).
            </p>
          </div>
          <form onSubmit={handleNewsletterSubmit} className="w-full md:w-auto flex flex-col sm:flex-row gap-2 shrink-0">
            <label htmlFor="newsletter-email" className="sr-only">
              البريد الإلكتروني
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="أدخل بريدك الإلكتروني..."
              className="px-3.5 py-2.5 text-xs bg-[#050E0B] border border-[#B88E35]/50 text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D4AF5A] min-w-[240px]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-extrabold bg-[#D4AF5A] text-[#081511] hover:opacity-95 transition-opacity whitespace-nowrap shrink-0"
            >
              اشتراك وتأكيد البريد
            </button>
          </form>
        </div>
        {newsletterStatus && (
          <p className="max-w-4xl mx-auto mt-3 text-xs text-[#D4AF5A] font-bold" role="status">
            {newsletterStatus}
          </p>
        )}
      </section>
    </div>
  );
};

// ============================================================================
// 3. صفحة المقال الكاملة (ArticleDetailView)
// ============================================================================
export const ArticleDetailView: React.FC<{
  article: ArticleRecord;
  allArticles: ArticleRecord[];
  tags: TagRecord[];
  siteConfig: SiteConfig;
  consentGranted: boolean;
  onOpenArticle: (article: ArticleRecord) => void;
  onOpenCategory: (slug: CategorySlug) => void;
  onOpenTag: (tagSlug: string) => void;
  onOpenLegal: (slug: string) => void;
  onOpenAuthor: () => void;
  onSubmitCorrectionReport: (articleId: string, text: string, reporterEmail: string) => Promise<void>;
}> = ({
  article,
  allArticles,
  tags,
  siteConfig,
  consentGranted,
  onOpenArticle,
  onOpenCategory,
  onOpenTag,
  onOpenLegal,
  onOpenAuthor,
  onSubmitCorrectionReport,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [correctionNote, setCorrectionNote] = useState('');
  const [correctionEmail, setCorrectionEmail] = useState('');
  const [correctionSubmitted, setCorrectionSubmitted] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      setScrollProgress(Math.min(100, Math.round((window.scrollY / docHeight) * 100)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const publishedList = allArticles.filter((a) => a.status === 'published');
  const currentIndex = publishedList.findIndex((a) => a.id === article.id);
  const prevArticle = currentIndex > 0 ? publishedList[currentIndex - 1] : null;
  const nextArticle =
    currentIndex >= 0 && currentIndex < publishedList.length - 1 ? publishedList[currentIndex + 1] : null;

  const relatedArticles = publishedList
    .filter((a) => a.id !== article.id && (a.categorySlug === article.categorySlug || a.tags.some((t) => article.tags.includes(t))))
    .slice(0, 3);

  const disclosureText = buildEditorialDisclosure({
    reviewedBy: article.reviewedBy,
    publishModeUsed: article.publishModeUsed,
    sourcesCount: article.sources.length,
  });

  const handleCopyShareLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleCorrectionReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionNote.trim()) return;
    await onSubmitCorrectionReport(article.id, correctionNote, correctionEmail);
    setCorrectionSubmitted(true);
    setCorrectionNote('');
  };

  return (
    <article className="max-w-5xl mx-auto">
      {/* شريط تقدم القراءة */}
      <div
        aria-hidden="true"
        className="fixed top-0 inset-x-0 z-50 h-1 bg-transparent pointer-events-none"
      >
        <div
          className="h-full bg-[#B88E35] transition-transform duration-150 origin-right"
          style={{ transform: `scaleX(${scrollProgress / 100})` }}
        />
      </div>

      {/* مسار التنقل */}
      <nav aria-label="مسار الصفحة" className="flex items-center gap-2 text-xs text-[#525E59] dark:text-[#98A6A0] mb-6">
        <button type="button" onClick={() => onOpenCategory(article.categorySlug)} className="hover:text-[#B88E35]">
          الرئيسية
        </button>
        <span aria-hidden="true">/</span>
        <button
          type="button"
          onClick={() => onOpenCategory(article.categorySlug)}
          className="font-semibold text-[#B88E35] hover:underline"
        >
          {article.categoryName}
        </button>
        <span aria-hidden="true">/</span>
        <span className="truncate max-w-xs sm:max-w-md text-[#0B1311] dark:text-slate-300">{article.headline}</span>
      </nav>

      {/* ترويسة المقال */}
      <header className="mb-8 border-b border-[#E4DDD0] dark:border-[#1D2824] pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#525E59] dark:text-[#98A6A0] mb-3">
          {article.type === 'breaking' && (
            <>
              <span className="font-bold text-[#9E2A2B] dark:text-[#E05252]">عاجل</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span className="font-bold text-[#B88E35]">{article.categoryName}</span>
          <span aria-hidden="true">·</span>
          <span>
            {article.type === 'explainer'
              ? 'شرح معمق'
              : article.type === 'analysis'
                ? 'قراءة تحليلية'
                : 'تقرير إخباري'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            المصادر المرجعية: {formatNumerals(article.sources.length, siteConfig.numeralSystem)} مصادر معتمدة
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>مدقق لغويًا (أ. علام الكيلاني)</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display leading-tight text-[#0B1311] dark:text-[#F4F0E8] mb-4">
          {article.headline}
        </h1>

        <p className="text-base sm:text-lg text-[#525E59] dark:text-slate-300 leading-relaxed mb-6">
          {article.dek}
        </p>

        {/* سطر الكاتب والتاريخين وزمن القراءة والمشاركة النظيفة */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#E4DDD0] dark:border-[#1D2824] text-xs text-[#525E59] dark:text-[#98A6A0]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenAuthor}
              className="font-bold text-[#0B1311] dark:text-[#F4F0E8] hover:text-[#B88E35] underline decoration-[#B88E35]/50 underline-offset-4"
            >
              {article.authorName}
            </button>
            <span aria-hidden="true">·</span>
            <span>نُشر: {formatArabicDate(article.publishedAt, siteConfig.numeralSystem)}</span>
            {article.updatedAt !== article.publishedAt && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#B88E35]">
                  آخر تحديث: {formatArabicDate(article.updatedAt, siteConfig.numeralSystem)}
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Clock className="w-3.5 h-3.5 text-[#B88E35]" />
              {formatNumerals(article.readingTimeMin, siteConfig.numeralSystem)} دقائق قراءة ({formatNumerals(article.wordCount, siteConfig.numeralSystem)} كلمة)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E4DDD0] dark:border-[#1D2824] hover:border-[#B88E35] text-[#0B1311] dark:text-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              <Share2 className="w-3.5 h-3.5 text-[#B88E35]" />
              <span>{shareCopied ? 'تم نسخ الرابط' : 'مشاركة الرابط'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* الصورة الرئيسية (1200x675) مع التعليق والإسناد والترخيص */}
      <figure className="mb-8 border border-[#E4DDD0] dark:border-[#1D2824] bg-white dark:bg-[#0E1513]">
        <div className="aspect-[16/9] w-full overflow-hidden bg-[#0B1F19]">
          <img
            src={resolvePublicImageUrl(article.image.url)}
            alt={article.image.alt}
            width={1200}
            height={675}
            fetchPriority="high"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.fallbackApplied) {
                target.dataset.fallbackApplied = 'true';
                target.src = generateTypographicSvgDataUri({
                  kicker: article.categoryName,
                  headline: article.headline,
                  siteName: 'ميزان الخبر',
                  uniqueSeed: article.id,
                });
              }
            }}
            className="w-full h-full object-cover"
          />
        </div>
        <figcaption className="px-4 py-2.5 text-xs text-[#525E59] dark:text-[#98A6A0] flex flex-wrap items-center justify-between gap-2">
          <span>{article.image.caption}</span>
          <span className="font-mono text-[11px] text-[#B88E35] dark:text-[#D4AF5A]">
            {article.image.credit} ({article.image.license})
          </span>
        </figcaption>
      </figure>

      {/* تخطيط القراءة ذو العمودين غير المتماثلين (70% نص المقال / 30% مصادر وتوثيق) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-8">
          {/* صندوق أبرز النقاط (Key Points) */}
          {article.keyPoints.length > 0 && (
            <section
              aria-label="أبرز النقاط"
              className="border border-[#E4DDD0] dark:border-[#1D2824] bg-[#F3EFE6]/70 dark:bg-[#0E1513] p-5"
            >
              <h2 className="text-sm font-bold font-display text-[#0B1311] dark:text-[#F4F0E8] mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#B88E35]" />
                <span>أبرز ما جاء في التقرير</span>
              </h2>
              <ul className="space-y-2 text-sm text-[#0B1311] dark:text-slate-200 list-disc ps-5 leading-relaxed">
                {article.keyPoints.map((pt, idx) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>
            </section>
          )}

          {/* المتن الأساسي للمقال */}
          <div
            className="font-editorial article-prose text-[#0B1311] dark:text-[#F4F0E8] max-w-prose"
            dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
          />

          {/* وحدة إعلانية داخل المقال */}
          <AdSlot
            slotId="article-inline-1"
            format="in-article"
            siteConfig={siteConfig}
            sensitivityLevel={article.sensitivityLevel}
            consentGranted={consentGranted}
          />

          {/* فقرة الخلفية والسياق */}
          {article.backgroundSection && (
            <section
              aria-label="خلفية الخبر والسياق"
              className="border border-[#E4DDD0] dark:border-[#1D2824] bg-white dark:bg-[#0E1513] p-5"
            >
              <h2 className="text-base font-bold font-display text-[#0B1311] dark:text-[#F4F0E8] mb-2">
                الخلفية والسياق
              </h2>
              <p className="text-sm text-[#525E59] dark:text-slate-300 leading-relaxed">
                {article.backgroundSection}
              </p>
            </section>
          )}

          {/* فقرة "ماذا يعني ذلك؟" */}
          {article.analysisSection && (
            <section
              aria-label="قراءة تحليلية"
              className="border border-[#B88E35]/50 bg-[#F3EFE6]/80 dark:bg-[#0E1513] p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold font-display text-[#0B1311] dark:text-[#F4F0E8]">
                  ماذا يعني ذلك؟
                </h2>
                <span className="text-xs font-semibold text-[#B88E35]">
                  قراءة تحليلية (مفصولة عن الخبر)
                </span>
              </div>
              <p className="text-sm text-[#525E59] dark:text-slate-300 leading-relaxed">
                {article.analysisSection}
              </p>
            </section>
          )}

          {/* فقرة "ما التالي؟" */}
          {article.whatNextSection && (
            <section
              aria-label="المسار المتوقع"
              className="border border-[#E4DDD0] dark:border-[#1D2824] bg-white dark:bg-[#0E1513] p-5"
            >
              <h2 className="text-base font-bold font-display text-[#0B1311] dark:text-[#F4F0E8] mb-2">
                ما التالي؟ (المسار المتوقع)
              </h2>
              <p className="text-sm text-[#525E59] dark:text-slate-300 leading-relaxed">
                {article.whatNextSection}
              </p>
            </section>
          )}

          {/* صندوق التصحيحات العلنية */}
          {article.corrections.length > 0 && (
            <section
              aria-label="تصحيحات وتوضيحات علنية"
              className="border border-[#B88E35] bg-[#B88E35]/10 p-5 space-y-2"
            >
              <h2 className="text-sm font-bold font-display text-[#0B1311] dark:text-[#F4F0E8] flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#B88E35]" />
                <span>سجل التصحيحات والتوضيحات العلنية على هذا المقال</span>
              </h2>
              {article.corrections.map((c) => (
                <div key={c.id} className="text-xs text-[#0B1311] dark:text-slate-200 leading-relaxed">
                  <p>{c.text}</p>
                  <p className="text-[11px] text-[#525E59] mt-1">
                    راجعه وصوّبه: {c.correctedBy} ·{' '}
                    {formatArabicDate(c.publishedAt, siteConfig.numeralSystem)}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* ملاحظة المنهجية التحريرية والتدقيق اللغوي */}
          <section
            aria-label="المعايير التحريرية والمرجعيات"
            className="border border-[#E4DDD0] dark:border-[#1D2824] bg-[#F3EFE6]/90 dark:bg-[#0E1513] p-5 text-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0B1311] dark:text-[#F4F0E8] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#B88E35]" />
                <span>المعايير التحريرية والتدقيق اللغوي وتوثيق المصادر</span>
              </span>
              <button
                type="button"
                onClick={() => onOpenLegal('editorial-policy')}
                className="underline text-[#B88E35] hover:text-[#0B1311] dark:hover:text-white font-semibold"
              >
                السياسة التحريرية ومنهجية التدقيق
              </button>
            </div>
            <p className="text-[#525E59] dark:text-slate-300 leading-relaxed">{disclosureText}</p>
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#E4DDD0] dark:border-[#1D2824]">
              <span className="text-[#525E59] dark:text-[#98A6A0]">
                رئيس التحرير: {siteConfig.editorInChiefName} · المدقق اللغوي العام: أ. علام الكيلاني
              </span>
              <button
                type="button"
                onClick={() => setShowCorrectionForm((s) => !s)}
                className="underline text-[#0B1311] dark:text-slate-300 hover:text-[#B88E35]"
              >
                الإبلاغ عن ملاحظة أو تصويب تحريري
              </button>
            </div>

            {showCorrectionForm && (
              <form onSubmit={handleCorrectionReport} className="pt-3 space-y-2 border-t border-[#E4DDD0] dark:border-[#1D2824]">
                <label htmlFor="correction-note" className="block font-semibold">
                  ملاحظتك أو التصويب المقترح (مع ذكر المصدر المرجعي):
                </label>
                <textarea
                  id="correction-note"
                  required
                  rows={2}
                  value={correctionNote}
                  onChange={(e) => setCorrectionNote(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-[#080C0B] border border-[#E4DDD0] dark:border-[#1D2824]"
                  placeholder="اذكر المعلومة أو الرقم الذي يحتاج إلى مراجعة..."
                />
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="email"
                    value={correctionEmail}
                    onChange={(e) => setCorrectionEmail(e.target.value)}
                    placeholder="بريدك الإلكتروني (اختياري للمتابعة)"
                    className="px-2.5 py-1.5 bg-white dark:bg-[#080C0B] border border-[#E4DDD0] dark:border-[#1D2824]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#0B1F19] text-[#FAF8F4] dark:bg-[#D4AF5A] dark:text-[#080C0B] font-semibold"
                  >
                    إرسال لهيئة التحرير
                  </button>
                </div>
                {correctionSubmitted && (
                  <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                    شكرًا لك؛ تم تسجيل طلب التصويب لدى مكتب المدقق اللغوي العام.
                  </p>
                )}
              </form>
            )}
          </section>

          {/* الوسوم (Tags) */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="text-[#525E59] font-semibold">الموضوعات والوسوم:</span>
            {article.tags.map((tagName, idx) => {
              const matchedTag = tags.find((t) => t.name === tagName);
              const slug = matchedTag ? matchedTag.slug : tagName;
              return (
                <React.Fragment key={tagName}>
                  {idx > 0 && <span aria-hidden="true" className="text-slate-400">·</span>}
                  <button
                    type="button"
                    onClick={() => onOpenTag(slug)}
                    className="text-[#0B1311] dark:text-slate-200 hover:text-[#B88E35] underline decoration-[#E4DDD0] underline-offset-4"
                  >
                    {tagName}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* العمود الجانبي في صفحة المقال: المصادر الموثقة */}
        <aside className="lg:col-span-4 space-y-6">
          <section
            aria-label="المصادر الرسمية المسندة"
            className="border border-[#E4DDD0] dark:border-[#1D2824] bg-white dark:bg-[#0E1513] p-5"
          >
            <h2 className="text-sm font-bold font-display text-[#0B1311] dark:text-[#F4F0E8] pb-3 mb-3 border-b border-[#E4DDD0] dark:border-[#1D2824] flex items-center justify-between">
              <span>المصادر الأولية المعتمدة</span>
              <span className="font-mono text-xs text-[#B88E35]">
                {formatNumerals(article.sources.length, siteConfig.numeralSystem)} مصادر
              </span>
            </h2>
            <ul className="space-y-3 text-xs">
              {article.sources.map((src, idx) => (
                <li
                  key={idx}
                  className="pb-3 border-b border-[#E4DDD0]/60 dark:border-[#1D2824] last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#525E59] dark:text-[#98A6A0] mb-1">
                    <span className="font-semibold text-[#B88E35]">
                      المستوى {formatNumerals(src.tier, siteConfig.numeralSystem)} ({src.role === 'official' ? 'مصدر رسمي أولي' : 'مصدر مستقل'})
                    </span>
                  </div>
                  <p className="font-bold text-[#0B1311] dark:text-slate-200 mb-1">{src.publisher}</p>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#525E59] dark:text-slate-300 hover:text-[#B88E35] underline"
                  >
                    <span>{src.title}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {relatedArticles.length > 0 && (
            <section
              aria-label="تغطيات ذات صلة في نفس القسم"
              className="border border-[#E4DDD0] dark:border-[#1D2824] bg-[#F3EFE6]/60 dark:bg-[#0E1513] p-5"
            >
              <h2 className="text-sm font-bold font-display text-[#0B1311] dark:text-[#F4F0E8] pb-2.5 mb-3 border-b border-[#E4DDD0] dark:border-[#1D2824] flex items-center justify-between">
                <span>تغطيات ذات صلة في «{article.categoryName}»</span>
              </h2>
              <ul className="space-y-3 text-xs">
                {relatedArticles.map((rel) => (
                  <li
                    key={rel.id}
                    className="pb-2.5 border-b border-[#E4DDD0]/60 dark:border-[#1D2824] last:border-b-0 last:pb-0"
                  >
                    <button
                      type="button"
                      onClick={() => onOpenArticle(rel)}
                      className="text-start font-bold text-[#0B1311] dark:text-slate-200 hover:text-[#B88E35] leading-snug"
                    >
                      {rel.headline}
                    </button>
                    <p className="text-[11px] text-[#525E59] mt-1">
                      {formatArabicDate(rel.publishedAt, siteConfig.numeralSystem)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <AdSlot
            slotId="article-sidebar-rect"
            format="rectangle"
            siteConfig={siteConfig}
            sensitivityLevel={article.sensitivityLevel}
            consentGranted={consentGranted}
          />
        </aside>
      </div>

      {/* التنقل بين المقال السابق والتالي */}
      <nav
        aria-label="التنقل بين المقالات"
        className="mt-12 pt-6 border-t border-[#E4DDD0] dark:border-[#1D2824] grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {prevArticle ? (
          <button
            type="button"
            onClick={() => onOpenArticle(prevArticle)}
            className="p-4 border border-[#E4DDD0] dark:border-[#1D2824] bg-white dark:bg-[#0E1513] text-start hover:border-[#B88E35] transition-colors"
          >
            <span className="text-xs text-[#525E59] flex items-center gap-1 mb-1">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>التقرير السابق</span>
            </span>
            <p className="text-sm font-bold font-display text-[#0B1311] dark:text-[#F4F0E8] line-clamp-2">
              {prevArticle.headline}
            </p>
          </button>
        ) : (
          <div />
        )}
        {nextArticle && (
          <button
            type="button"
            onClick={() => onOpenArticle(nextArticle)}
            className="p-4 border border-[#E4DDD0] dark:border-[#1D2824] bg-white dark:bg-[#0E1513] text-start hover:border-[#B88E35] transition-colors"
          >
            <span className="text-xs text-[#525E59] flex items-center justify-end gap-1 mb-1">
              <span>التقرير التالي</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
            <p className="text-sm font-bold font-display text-[#0B1311] dark:text-[#F4F0E8] line-clamp-2">
              {nextArticle.headline}
            </p>
          </button>
        )}
      </nav>

      {/* مقالات ذات صلة */}
      {relatedArticles.length > 0 && (
        <section aria-label="تقارير ذات صلة" className="mt-12 pt-8 border-t border-[#E4DDD0] dark:border-[#1D2824]">
          <h2 className="text-xl font-bold font-display text-[#0B1311] dark:text-[#F4F0E8] mb-6">
            تقارير موثقة ذات صلة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((rel) => (
              <EditorialCard
                key={rel.id}
                article={rel}
                size="medium"
                numeralSystem={siteConfig.numeralSystem}
                onOpenArticle={onOpenArticle}
                onOpenCategory={onOpenCategory}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
};

// ============================================================================
// 4. صفحات الأقسام، الوسوم، البحث، والتصحيحات
// ============================================================================
export const CategoryArchiveView: React.FC<{
  categorySlug: CategorySlug;
  articles: ArticleRecord[];
  numeralSystem: 'western' | 'eastern';
  onOpenArticle: (article: ArticleRecord) => void;
  onOpenCategory: (slug: CategorySlug) => void;
}> = ({ categorySlug, articles, numeralSystem, onOpenArticle, onOpenCategory }) => {
  const section = EDITORIAL_SECTIONS.find((s) => s.slug === categorySlug) ?? EDITORIAL_SECTIONS[0];
  const filtered = articles.filter((a) => a.status === 'published' && a.categorySlug === categorySlug);

  const [page, setPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedArticles = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-8">
      <header className="border-b border-[#E4DDD0] dark:border-[#1D2824] pb-6">
        <span className="text-xs font-bold text-[#B88E35]">قسم تحريري متخصص</span>
        <h1 className="text-3xl font-extrabold font-display text-[#0B1311] dark:text-[#F4F0E8] mt-1">
          {section.name}
        </h1>
        <p className="text-sm text-[#525E59] dark:text-[#98A6A0] mt-2 max-w-2xl">
          {section.description}
        </p>
      </header>

      {pagedArticles.length === 0 ? (
        <div className="border border-[#E4DDD0] dark:border-[#1D2824] p-8 text-center text-sm text-[#525E59] dark:text-[#98A6A0]">
          لا توجد تقارير منشورة في هذا القسم حاليًا؛ الكمية تتبع الجودة المتاحة في المصادر الرسمية.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pagedArticles.map((art) => (
            <EditorialCard
              key={art.id}
              article={art}
              size="medium"
              numeralSystem={numeralSystem}
              onOpenArticle={onOpenArticle}
              onOpenCategory={onOpenCategory}
            />
          ))}
        </div>
      )}

      <nav aria-label="ترقيم صفحات القسم" className="flex items-center justify-between pt-6 border-t border-[#E4DDD0] dark:border-[#1D2824] text-xs">
        <span className="text-[#525E59] tabular-nums">
          صفحة {formatNumerals(page, numeralSystem)} من {formatNumerals(totalPages, numeralSystem)} (إجمالي {formatNumerals(filtered.length, numeralSystem)} تقارير)
        </span>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
            <a
              key={p}
              href={`/${categorySlug}?page=${p}`}
              onClick={(e) => {
                e.preventDefault();
                setPage(p);
              }}
              className={`px-3 py-1.5 border tabular-nums ${
                p === page
                  ? 'bg-[#0B1F19] text-[#FAF8F4] dark:bg-[#D4AF5A] dark:text-[#080C0B] border-transparent font-bold'
                  : 'border-[#E4DDD0] dark:border-[#1D2824] text-[#0B1311] dark:text-slate-300'
              }`}
            >
              {formatNumerals(p, numeralSystem)}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
};

export const TagArchiveView: React.FC<{
  tagSlugOrName: string;
  tags: TagRecord[];
  articles: ArticleRecord[];
  numeralSystem: 'western' | 'eastern';
  onOpenArticle: (article: ArticleRecord) => void;
  onOpenCategory: (slug: CategorySlug) => void;
}> = ({ tagSlugOrName, tags, articles, numeralSystem, onOpenArticle, onOpenCategory }) => {
  const tagObj = tags.find((t) => t.slug === tagSlugOrName || t.name === tagSlugOrName);
  const displayName = tagObj ? tagObj.name : tagSlugOrName;
  const matching = articles.filter(
    (a) => a.status === 'published' && a.tags.some((t) => t === displayName || t === tagSlugOrName)
  );
  const count = tagObj ? tagObj.articleCount : matching.length;

  return (
    <div className="space-y-8">
      <header className="border-b border-[#E4DDD0] dark:border-[#1D2824] pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#525E59] mb-2">
          <span>أرشيف الموضوعات والوسوم الموثقة</span>
          <span aria-hidden="true">·</span>
          <span>
            إجمالي التقارير المرتبطة: {formatNumerals(count, numeralSystem)} تقارير
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0B1311] dark:text-[#F4F0E8]">
          ملف: {displayName}
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matching.map((art) => (
          <EditorialCard
            key={art.id}
            article={art}
            size="medium"
            numeralSystem={numeralSystem}
            onOpenArticle={onOpenArticle}
            onOpenCategory={onOpenCategory}
          />
        ))}
      </div>
    </div>
  );
};

export const SearchView: React.FC<{
  initialQuery: string;
  articles: ArticleRecord[];
  numeralSystem: 'western' | 'eastern';
  onOpenArticle: (article: ArticleRecord) => void;
  onOpenCategory: (slug: CategorySlug) => void;
}> = ({ initialQuery, articles, numeralSystem, onOpenArticle, onOpenCategory }) => {
  const [query, setQuery] = useState(initialQuery);
  const normalizedQ = query.trim().toLowerCase();

  const results = articles.filter((a) => {
    if (a.status !== 'published') return false;
    if (!normalizedQ) return true;
    return (
      a.headline.toLowerCase().includes(normalizedQ) ||
      a.dek.toLowerCase().includes(normalizedQ) ||
      a.bodyMd.toLowerCase().includes(normalizedQ) ||
      a.tags.some((t) => t.toLowerCase().includes(normalizedQ))
    );
  });

  return (
    <div className="space-y-8">
      <header className="border-b border-[#E4DDD0] dark:border-[#1D2824] pb-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-[#525E59]">
          <span>البحث الفوري في الأرشيف الموثق</span>
          <span>إجمالي النتائج المطابقة: {formatNumerals(results.length, numeralSystem)}</span>
        </div>
        <h1 className="text-2xl font-extrabold font-display text-[#0B1311] dark:text-[#F4F0E8]">
          البحث في تقارير «ميزان الخبر»
        </h1>
        <div className="max-w-xl">
          <label htmlFor="archive-search-input" className="sr-only">
            ابحث في العناوين والمتن والوسوم
          </label>
          <input
            id="archive-search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن كلمة مفتاحية، محافظة سورية، دولة عربية، أو ملف اقتصادي..."
            className="w-full px-4 py-2.5 text-sm bg-white dark:bg-[#0E1513] border border-[#E4DDD0] dark:border-[#1D2824] text-[#0B1311] dark:text-[#F4F0E8]"
          />
        </div>
      </header>

      {results.length === 0 ? (
        <div className="border border-[#E4DDD0] dark:border-[#1D2824] p-8 text-center text-sm text-[#525E59] dark:text-[#98A6A0]">
          لم يتم العثور على تقارير مطابقة لعبارة البحث «{query}».
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((art) => (
            <EditorialCard
              key={art.id}
              article={art}
              size="medium"
              numeralSystem={numeralSystem}
              onOpenArticle={onOpenArticle}
              onOpenCategory={onOpenCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 5. صفحات الثقة، هيئة التحرير، سجل التصحيحات، والصفحات القانونية
// ============================================================================
export const CorrectionsLogView: React.FC<{
  articles: ArticleRecord[];
  numeralSystem: 'western' | 'eastern';
  onOpenArticle: (article: ArticleRecord) => void;
}> = ({ articles, numeralSystem, onOpenArticle }) => {
  const allCorrections = articles.flatMap((a) =>
    a.corrections.map((c) => ({ ...c, articleRef: a }))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="border-b border-[#E4DDD0] dark:border-[#1D2824] pb-6">
        <span className="text-xs font-bold text-[#B88E35]">الشفافية والمساءلة التحريرية</span>
        <h1 className="text-3xl font-extrabold font-display text-[#0B1311] dark:text-[#F4F0E8] mt-1">
          سجل التصحيحات والتوضيحات العلني
        </h1>
        <p className="text-sm text-[#525E59] dark:text-[#98A6A0] mt-2">
          تلتزم «ميزان الخبر» بنشر أي تصويب أو تحديث جوهري يطرأ على الأرقام أو الوقائع بشفافية كاملة تحت إشراف المدقق اللغوي والمصحح العام (أ. علام الكيلاني).
        </p>
      </header>

      <div className="space-y-4">
        {allCorrections.map((item) => (
          <div
            key={item.id}
            className="border border-[#E4DDD0] dark:border-[#1D2824] bg-white dark:bg-[#0E1513] p-5 space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between text-xs text-[#525E59]">
              <span>تاريخ التصويب: {formatArabicDate(item.publishedAt, numeralSystem)}</span>
              <span>المراجع: {item.correctedBy}</span>
            </div>
            <h2 className="text-base font-bold font-display text-[#0B1311] dark:text-[#F4F0E8]">
              <button
                type="button"
                onClick={() => onOpenArticle(item.articleRef)}
                className="hover:text-[#B88E35] text-start underline"
              >
                {item.articleHeadline}
              </button>
            </h2>
            <p className="text-sm text-[#525E59] dark:text-slate-300 leading-relaxed">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const EditorialTeamView: React.FC<{
  authors: AuthorRecord[];
  siteConfig: SiteConfig;
  onOpenAdminReadiness?: () => void;
}> = ({ authors, siteConfig }) => {
  const [unitFilter, setUnitFilter] = useState<'all' | 'syria' | 'arab_turkey' | 'other'>('all');

  const chiefEditor = authors.find((a) => a.id === 'chief-editor-ibrahim');
  const chiefProofreader = authors.find((a) => a.id === 'proofreader-allam');
  const syriaAuthors = authors.filter((a) => a.id.startsWith('jour-syria-'));
  const arabTurkeyAuthors = authors.filter((a) => a.id.startsWith('jour-arab-tr-'));
  const otherAuthors = authors.filter((a) => a.id.startsWith('jour-other-'));

  const displayedJournalists =
    unitFilter === 'syria'
      ? syriaAuthors
      : unitFilter === 'arab_turkey'
        ? arabTurkeyAuthors
        : unitFilter === 'other'
          ? otherAuthors
          : [...syriaAuthors, ...arabTurkeyAuthors, ...otherAuthors];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="border-b border-[#E4DDD0] dark:border-[#1D2824] pb-6">
        <span className="text-xs font-bold text-[#B88E35]">
          المسؤولية التحريرية والشفافية · رئيس التحرير + المدقق اللغوي العام + 100 صحفي ومراسل متخصص
        </span>
        <h1 className="text-3xl font-extrabold font-royal text-[#0B1311] dark:text-[#F4F0E8] mt-1">
          هيئة التحرير، وحدة التدقيق اللغوي، والكادر الصحفي (102 عضوًا)
        </h1>
        <p className="text-sm text-[#525E59] dark:text-[#98A6A0] mt-2 leading-relaxed">
          تعمل غرفة أخبار «{siteConfig.siteName}» تحت الإشراف المباشر لرئيس التحرير المسؤول ({siteConfig.editorInChiefName})، وبمراجعة لغوية وبصرية شاملة يقودها المدقق اللغوي والمصحح العام (أ. علام الكيلاني)، مع كادر يضم 100 صحفي ومراسل موزعين وفق الأولوية التحريرية: 50 صحفيًا للشأن السوري (50%)، و40 صحفيًا للعالم العربي وتركيا (40%)، و10 محررين للأقسام التخصصية والدولية (10%).
        </p>
      </header>

      {/* بطاقة القيادة التحريرية ووحدة التدقيق اللغوي والفلترة الذكية */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-[#E4DDD0] dark:border-[#1D2824] bg-white dark:bg-[#0E1513] p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#B88E35]">القيادة التحريرية العليا</span>
            <span className="px-2.5 py-1 bg-[#081511] text-[#D4AF5A] text-xs font-bold">
              المدير العام ورئيس التحرير
            </span>
          </div>
          <h2 className="text-xl font-bold font-royal text-[#0B1311] dark:text-[#F4F0E8]">
            {chiefEditor?.name || siteConfig.editorInChiefName}
          </h2>
          <p className="text-xs text-[#525E59] dark:text-slate-300 leading-relaxed">
            {chiefEditor?.bio || siteConfig.editorBio}
          </p>
          <div className="pt-2 border-t border-[#E4DDD0] dark:border-[#1D2824] text-xs text-[#525E59] dark:text-[#98A6A0] flex flex-wrap items-center justify-between gap-2">
            <span>المؤسسة: {siteConfig.publisherLegalName}</span>
            <a href={`mailto:${siteConfig.contactEmail}`} className="font-mono text-[#B88E35] underline">
              {siteConfig.contactEmail}
            </a>
          </div>
        </div>

        <div className="border border-[#B88E35]/60 bg-[#081511] text-[#FAF8F4] p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#D4AF5A] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>وحدة التدقيق اللغوي وإصلاح الأخطاء وفحص الصور</span>
            </span>
            <span className="px-2.5 py-1 bg-[#D4AF5A] text-[#081511] text-xs font-extrabold">
              موظف التدقيق المختص
            </span>
          </div>
          <h2 className="text-xl font-bold font-royal text-[#D4AF5A]">
            {chiefProofreader?.name || 'أ. علام الكيلاني'}
          </h2>
          <p className="text-xs text-[#E8E1D3]/90 leading-relaxed">
            {chiefProofreader?.bio ||
              'يتولى الأستاذ علام الكيلاني التدقيق اللغوي والنحوي الشامل لجميع المقالات قبل النشر، وتنقية النصوص من أي رموز برمجية أو عبارات أجنبية أو كلمات مقطوعة، وضمان تفرد الصور الفوتوغرافية بنسبة 100% ومنع تكرار أي صورة في الموقع.'}
          </p>
          <div className="pt-2 border-t border-[#B88E35]/30 text-xs text-[#D4AF5A] flex flex-wrap items-center justify-between gap-2">
            <span>الحالة: فحص آلي ولغوي مستمر 24/7</span>
            <span>نسبة تكرار الصور المسموحة: 0%</span>
          </div>
        </div>
      </section>

      {/* لوحة التوزيع الهيكلي للصحفيين (50% سوريا | 40% العرب وتركيا | 10% باقي الأقسام) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="border border-[#B88E35]/40 bg-[#081511] text-[#FAF8F4] p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#D4AF5A]">الوحدة الأولى · الأولوية القصوى</span>
            <span className="text-2xl font-extrabold font-royal text-[#D4AF5A]">50%</span>
          </div>
          <h3 className="text-lg font-bold font-royal">فريق الشأن السوري (50 صحفيًا)</h3>
          <p className="text-xs text-[#E8E1D3]/85 leading-relaxed">
            تغطية شاملة ومعمّقة لجميع المحافظات السورية الـ 14، والاقتصاد والمعيشة، وإعادة الإعمار، والطاقة والمياه، والمعابر الحدودية، والمرافئ، والجامعات.
          </p>
        </div>

        <div className="border border-[#E4DDD0] dark:border-[#1D2824] bg-white dark:bg-[#0E1513] p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#B88E35]">الوحدة الثانية · التغطية الإقليمية</span>
            <span className="text-2xl font-extrabold font-royal text-[#0B1F19] dark:text-[#D4AF5A]">40%</span>
          </div>
          <h3 className="text-lg font-bold font-royal text-[#0B1311] dark:text-[#F4F0E8]">
            فريق العالم العربي وتركيا (40 صحفيًا)
          </h3>
          <p className="text-xs text-[#525E59] dark:text-slate-300 leading-relaxed">
            مراسلون ومحررون متخصصون في الشأن التركي (أنقرة وإسطنبول وغازي عنتاب ومرسين) وجميع العواصم العربية في الخليج والمشرق ووادي النيل والمغرب العربي.
          </p>
        </div>

        <div className="border border-[#E4DDD0] dark:border-[#1D2824] bg-white dark:bg-[#0E1513] p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#B88E35]">الوحدة الثالثة · التغطية التخصصية</span>
            <span className="text-2xl font-extrabold font-royal text-[#0B1F19] dark:text-[#D4AF5A]">10%</span>
          </div>
          <h3 className="text-lg font-bold font-royal text-[#0B1311] dark:text-[#F4F0E8]">
            فريق الأقسام التخصصية والدولية (10 محررين)
          </h3>
          <p className="text-xs text-[#525E59] dark:text-slate-300 leading-relaxed">
            نخبة من المحررين المتخصصين في التكنولوجيا والذكاء الاصطناعي، والعلوم والصحة، والثقافة والتراث، والرياضة، والتحليلات الاستراتيجية، والاقتصاد الدولي.
          </p>
        </div>
      </section>

      {/* أزرار تصفية السجل الكامل للصحفيين הـ 100 */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4DDD0] dark:border-[#1D2824] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setUnitFilter('all')}
            className={`px-3.5 py-2 text-xs font-bold transition-colors ${
              unitFilter === 'all'
                ? 'bg-[#0B1F19] text-[#FAF8F4] dark:bg-[#D4AF5A] dark:text-[#080C0B]'
                : 'bg-[#F3EFE6] dark:bg-[#0E1513] text-[#525E59] dark:text-slate-300 hover:text-[#B88E35]'
            }`}
          >
            جميع الصحفيين ({syriaAuthors.length + arabTurkeyAuthors.length + otherAuthors.length})
          </button>
          <button
            type="button"
            onClick={() => setUnitFilter('syria')}
            className={`px-3.5 py-2 text-xs font-bold transition-colors ${
              unitFilter === 'syria'
                ? 'bg-[#0B1F19] text-[#FAF8F4] dark:bg-[#D4AF5A] dark:text-[#080C0B]'
                : 'bg-[#F3EFE6] dark:bg-[#0E1513] text-[#525E59] dark:text-slate-300 hover:text-[#B88E35]'
            }`}
          >
            صحفيو الشأن السوري ({syriaAuthors.length} — 50%)
          </button>
          <button
            type="button"
            onClick={() => setUnitFilter('arab_turkey')}
            className={`px-3.5 py-2 text-xs font-bold transition-colors ${
              unitFilter === 'arab_turkey'
                ? 'bg-[#0B1F19] text-[#FAF8F4] dark:bg-[#D4AF5A] dark:text-[#080C0B]'
                : 'bg-[#F3EFE6] dark:bg-[#0E1513] text-[#525E59] dark:text-slate-300 hover:text-[#B88E35]'
            }`}
          >
            صحفيو العرب وتركيا ({arabTurkeyAuthors.length} — 40%)
          </button>
          <button
            type="button"
            onClick={() => setUnitFilter('other')}
            className={`px-3.5 py-2 text-xs font-bold transition-colors ${
              unitFilter === 'other'
                ? 'bg-[#0B1F19] text-[#FAF8F4] dark:bg-[#D4AF5A] dark:text-[#080C0B]'
                : 'bg-[#F3EFE6] dark:bg-[#0E1513] text-[#525E59] dark:text-slate-300 hover:text-[#B88E35]'
            }`}
          >
            محررو الأقسام التخصصية ({otherAuthors.length} — 10%)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedJournalists.map((author, index) => (
          <div
            key={author.id}
            className="border border-[#E4DDD0] dark:border-[#1D2824] bg-white dark:bg-[#0E1513] p-5 space-y-2 flex flex-col justify-between hover:border-[#B88E35] transition-colors"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#B88E35]">{author.roleTitle}</span>
                <span className="text-[10px] font-mono text-[#525E59]">#{index + 1}</span>
              </div>
              <h3 className="text-lg font-bold font-display text-[#0B1311] dark:text-[#F4F0E8]">
                {author.name}
              </h3>
              <p className="text-xs text-[#525E59] dark:text-slate-300 leading-relaxed">{author.bio}</p>
            </div>
            <p className="pt-2 text-[11px] text-[#525E59] border-t border-[#E4DDD0]/60 dark:border-[#1D2824]">
              {author.credentials}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LegalTrustPageView: React.FC<{
  page: LegalPageContent;
  allPages: Record<string, LegalPageContent>;
  siteConfig: SiteConfig;
  onSelectPage: (slug: string) => void;
  onSubmitContactOrDmca: (payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
    type: 'contact' | 'dmca';
  }) => Promise<string>;
}> = ({ page, allPages, siteConfig, onSelectPage, onSubmitContactOrDmca }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitResponse, setSubmitResponse] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resMsg = await onSubmitContactOrDmca({
      name,
      email,
      subject,
      message,
      type: page.slug === 'dmca' ? 'dmca' : 'contact',
    });
    setSubmitResponse(resMsg);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <aside className="lg:col-span-4 border border-[#E4DDD0] dark:border-[#1D2824] bg-[#F3EFE6]/60 dark:bg-[#0E1513] p-5">
        <h2 className="text-sm font-bold font-display text-[#0B1311] dark:text-[#F4F0E8] pb-3 mb-3 border-b border-[#E4DDD0] dark:border-[#1D2824]">
          مركز الشفافية والسياسات القانونية
        </h2>
        <nav aria-label="صفحات السياسات والثقة" className="space-y-1.5 text-xs">
          {Object.values(allPages).map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => {
                setSubmitResponse(null);
                onSelectPage(p.slug);
              }}
              className={`w-full text-start px-3 py-2 transition-colors ${
                p.slug === page.slug
                  ? 'bg-[#0B1F19] text-[#FAF8F4] dark:bg-[#D4AF5A] dark:text-[#080C0B] font-bold'
                  : 'text-[#525E59] dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {p.titleAr}
            </button>
          ))}
        </nav>
      </aside>

      <div className="lg:col-span-8 border border-[#E4DDD0] dark:border-[#1D2824] bg-white dark:bg-[#0E1513] p-6 sm:p-8 space-y-6">
        <header className="border-b border-[#E4DDD0] dark:border-[#1D2824] pb-5">
          <span className="text-xs font-semibold text-[#B88E35]">
            وثيقة رسمية ملزمة · آخر تحديث: {page.lastUpdated}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0B1311] dark:text-[#F4F0E8] mt-1">
            {page.titleAr}
          </h1>
          <p className="text-sm text-[#525E59] dark:text-[#98A6A0] mt-2 leading-relaxed">
            {page.subtitleAr}
          </p>
        </header>

        {page.requiresPublisherIdentity && (
          <div className="p-4 border border-[#E4DDD0] dark:border-[#1D2824] bg-[#FAF8F4] dark:bg-[#080C0B] text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#0B1311] dark:text-[#F4F0E8]">
              <ShieldCheck className="w-4 h-4 text-[#B88E35]" />
              <span>البيانات الرسمية للمؤسسة الناشرة:</span>
            </div>
            <p className="text-[#525E59] dark:text-slate-300">
              المؤسسة: <strong>{siteConfig.publisherLegalName}</strong> · رئيس التحرير المسؤول:{' '}
              <strong>{siteConfig.editorInChiefName}</strong> · البريد الإلكتروني الرسمي:{' '}
              <a href={`mailto:${siteConfig.contactEmail}`} className="font-mono font-bold underline hover:text-[#B88E35]">
                {siteConfig.contactEmail}
              </a>
            </p>
          </div>
        )}

        <div className="space-y-6">
          {page.sections.map((sec, idx) => (
            <section key={idx} className="space-y-2.5">
              <h2 className="text-lg font-bold font-display text-[#0B1311] dark:text-[#F4F0E8]">
                {sec.heading}
              </h2>
              {sec.paragraphs.map((p, pIdx) => (
                <p
                  key={pIdx}
                  className="text-sm text-[#525E59] dark:text-slate-300 leading-relaxed"
                >
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        {(page.slug === 'contact' || page.slug === 'dmca') && (
          <form
            onSubmit={handleSubmit}
            className="pt-6 border-t border-[#E4DDD0] dark:border-[#1D2824] space-y-4 text-xs"
          >
            <h3 className="text-base font-bold font-display text-[#0B1311] dark:text-[#F4F0E8] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#B88E35]" />
              <span>
                {page.slug === 'dmca'
                  ? 'نموذج إشعار حقوق النشر وطلب الإزالة الرسمي'
                  : 'نموذج مراسلة هيئة التحرير'}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="legal-form-name" className="block font-semibold mb-1">
                  الاسم الكامل أو الجهة الممثلة
                </label>
                <input
                  id="legal-form-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F4] dark:bg-[#080C0B] border border-[#E4DDD0] dark:border-[#1D2824]"
                />
              </div>
              <div>
                <label htmlFor="legal-form-email" className="block font-semibold mb-1">
                  البريد الإلكتروني الرسمي للرد
                </label>
                <input
                  id="legal-form-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F4] dark:bg-[#080C0B] border border-[#E4DDD0] dark:border-[#1D2824]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="legal-form-subject" className="block font-semibold mb-1">
                {page.slug === 'dmca' ? 'الرابط المباشر للمادة محل الإشعار' : 'موضوع الرسالة'}
              </label>
              <input
                id="legal-form-subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F4] dark:bg-[#080C0B] border border-[#E4DDD0] dark:border-[#1D2824]"
              />
            </div>

            <div>
              <label htmlFor="legal-form-msg" className="block font-semibold mb-1">
                تفاصيل الرسالة والمستندات المرجعية
              </label>
              <textarea
                id="legal-form-msg"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F4] dark:bg-[#080C0B] border border-[#E4DDD0] dark:border-[#1D2824]"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#525E59]">
                تخضع جميع المراسلات لمراجعة مكتب التحرير المركزي والرد خلال 24 ساعة عمل
              </span>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0B1F19] text-[#FAF8F4] dark:bg-[#D4AF5A] dark:text-[#080C0B] font-bold"
              >
                إرسال الطلب رسميًا
              </button>
            </div>

            {submitResponse && (
              <p className="p-3 bg-emerald-900/10 border border-emerald-700/40 text-emerald-800 dark:text-emerald-300 font-medium">
                {submitResponse}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
