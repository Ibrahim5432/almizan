import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
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

// ============================================================================
// 1. بطاقة الخبر الملكية الفاخرة (مع صور توثيقية قانونية 100% وفولباك تلقائي)
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
      });
    }
  };

  if (size === 'compact') {
    return (
      <article className="py-3.5 border-b border-[#DED6C6] dark:border-[#1C2E27] last:border-b-0 group flex items-start gap-3.5">
        {typeof rankNumber === 'number' && (
          <span className="font-royal text-2xl font-bold text-[#B6862C] dark:text-[#D4A84F] tabular-nums leading-none pt-0.5 shrink-0">
            0{formatNumerals(rankNumber, numeralSystem)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-1">
            {isBreaking && (
              <>
                <span className="font-bold text-[#9E2A2B]">عاجل</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <button
              type="button"
              onClick={() => onOpenCategory(article.categorySlug)}
              className="font-bold text-[#09241D] dark:text-[#D4A84F] hover:underline"
            >
              {article.categoryName}
            </button>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {formatNumerals(article.readingTimeMin, numeralSystem)} د قراءة
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums text-[#B6862C] dark:text-[#D4A84F] font-semibold">
              {formatNumerals(article.sources.length, numeralSystem)} مصادر
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold font-display leading-snug text-[#0C1713] dark:text-[#F3EFE6] group-hover:text-[#B6862C] transition-colors">
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
      <article className="grid grid-cols-1 sm:grid-cols-12 gap-4 border border-[#DED6C6] dark:border-[#1C2E27] bg-white/80 dark:bg-[#0F1915] p-4 transition-all hover:border-[#B6862C] items-center group shadow-[0_2px_10px_rgba(9,36,29,0.03)]">
        <div className="sm:col-span-5 aspect-[16/10] w-full overflow-hidden bg-[#09241D] border border-[#DED6C6] dark:border-[#1C2E27] relative">
          <img
            src={article.image.url}
            alt={article.image.alt}
            width={1200}
            height={675}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={handleImgError}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-2.5 py-1 text-[10px] text-[#E5DEC9] truncate">
            {article.image.credit}
          </div>
        </div>
        <div className="sm:col-span-7 flex flex-col justify-between space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            {isBreaking && (
              <>
                <span className="font-bold text-[#9E2A2B]">عاجل</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <button
              type="button"
              onClick={() => onOpenCategory(article.categorySlug)}
              className="font-bold text-[#09241D] dark:text-[#D4A84F] hover:underline"
            >
              {article.categoryName}
            </button>
            <span aria-hidden="true">·</span>
            <span>{formatArabicDate(article.publishedAt, numeralSystem)}</span>
          </div>
          <h3 className="text-base lg:text-lg font-extrabold font-display leading-snug text-[#0C1713] dark:text-[#F3EFE6] group-hover:text-[#B6862C] transition-colors">
            <button
              type="button"
              onClick={() => onOpenArticle(article)}
              className="text-start"
            >
              {article.headline}
            </button>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
            {article.dek}
          </p>
          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{article.authorName}</span>
            <span className="tabular-nums font-bold text-[#B6862C] dark:text-[#D4A84F]">
              موثق من {formatNumerals(article.sources.length, numeralSystem)} مصادر رسمية
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col justify-between border border-[#DED6C6] dark:border-[#1C2E27] bg-white/85 dark:bg-[#0F1915] p-5 transition-all hover:border-[#B6862C] group shadow-[0_2px_12px_rgba(9,36,29,0.03)]">
      <div>
        <div className="aspect-[16/10] w-full overflow-hidden bg-[#09241D] mb-4 border border-[#DED6C6] dark:border-[#1C2E27] relative">
          <img
            src={article.image.url}
            alt={article.image.alt}
            width={1200}
            height={675}
            loading={size === 'large' ? 'eager' : 'lazy'}
            referrerPolicy="no-referrer"
            onError={handleImgError}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-3 py-1.5 flex items-center justify-between text-[10px] text-[#E5DEC9]">
            <span className="truncate">{article.image.credit}</span>
            <span className="text-[#D4A84F] font-semibold shrink-0 ms-2">ترخيص قانوني حر</span>
          </div>
        </div>

        {/* سطر البيانات الوصفية النظيف */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-2">
          {isBreaking && (
            <>
              <span className="font-bold text-[#9E2A2B]">عاجل</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <button
            type="button"
            onClick={() => onOpenCategory(article.categorySlug)}
            className="font-bold text-[#09241D] dark:text-[#D4A84F] hover:underline"
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
          } font-extrabold font-display leading-snug text-[#0C1713] dark:text-[#F3EFE6] mb-2.5 group-hover:text-[#B6862C] transition-colors`}
        >
          <button
            type="button"
            onClick={() => onOpenArticle(article)}
            className="text-start"
          >
            {article.headline}
          </button>
        </h3>

        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          {article.dek}
        </p>
      </div>

      <div className="pt-3 border-t border-[#DED6C6]/80 dark:border-[#1C2E27] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="font-medium">{article.authorName}</span>
        <span className="tabular-nums font-bold text-[#B6862C] dark:text-[#D4A84F]">
          موثق من {formatNumerals(article.sources.length, numeralSystem)} مصادر رسمية
        </span>
      </div>
    </article>
  );
};

// ============================================================================
// 2. الصفحة الرئيسية (HomeView) — القالب الملكي الدمشقي الفاخر (Royal Broadsheet)
// ============================================================================
export const HomeView: React.FC<{
  articles: ArticleRecord[];
  widgets: ServiceDataWidget[];
  siteConfig: SiteConfig;
  consentGranted: boolean;
  onOpenArticle: (article: ArticleRecord) => void;
  onOpenCategory: (slug: CategorySlug) => void;
  onOpenTag: (tagSlug: string) => void;
  onSubscribe: (email: string) => Promise<string>;
}> = ({
  articles,
  widgets,
  siteConfig,
  consentGranted,
  onOpenArticle,
  onOpenCategory,
  onSubscribe,
}) => {
  const published = articles.filter((a) => a.status === 'published');
  const wireArticles = published.slice(0, 6);
  const leadStory = published[0];
  const spotlightColumnStories = published.slice(1, 4);
  const photoReportageStories = published.slice(2, 6);
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
      ? published
      : published.filter((a) => a.categorySlug === selectedDeptFilter);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    const msg = await onSubscribe(newsletterEmail);
    setNewsletterStatus(msg);
    setNewsletterEmail('');
  };

  return (
    <div className="space-y-12">
      {/* ====================================================================
          1. شريط البرقيات الملكي (Royal Emerald & Gold News Wire)
      ==================================================================== */}
      {activeWireItem && (
        <section
          aria-label="شريط البرقيات الإخبارية الموثقة"
          className="border-y-2 border-x border-[#C89D42] bg-[#09241D] text-[#F9F6F0] px-4 py-2.5 flex items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-extrabold text-[#D4A84F] shrink-0">
              برقية العدد ({formatNumerals(wireIndex + 1, siteConfig.numeralSystem)}/{formatNumerals(wireArticles.length, siteConfig.numeralSystem)})
            </span>
            <span aria-hidden="true" className="text-[#C89D42]/50">|</span>
            <span className="text-xs text-[#E5DEC9] font-semibold shrink-0 hidden sm:inline">
              {activeWireItem.categoryName}
            </span>
            <span aria-hidden="true" className="text-[#C89D42]/50 hidden sm:inline">·</span>
            <button
              type="button"
              onClick={() => onOpenArticle(activeWireItem)}
              className="text-xs sm:text-sm font-bold text-white hover:text-[#D4A84F] truncate text-start transition-colors"
            >
              {activeWireItem.headline}
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0 text-xs">
            <span className="hidden md:inline text-[#D4A84F] tabular-nums me-2">
              {formatNumerals(activeWireItem.sources.length, siteConfig.numeralSystem)} مصادر رسمية
            </span>
            <button
              type="button"
              onClick={() =>
                setWireIndex((prev) => (prev - 1 + wireArticles.length) % wireArticles.length)
              }
              aria-label="الخبر السابق"
              className="p-1 border border-[#C89D42]/40 hover:border-[#D4A84F] text-[#E5DEC9] hover:text-[#D4A84F]"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTickerPaused((p) => !p)}
              aria-label={tickerPaused ? 'تشغيل شريط الأخبار' : 'إيقاف شريط الأخبار مؤقتًا'}
              className="p-1 border border-[#C89D42]/40 hover:border-[#D4A84F] text-[#E5DEC9] hover:text-[#D4A84F]"
            >
              {tickerPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setWireIndex((prev) => (prev + 1) % wireArticles.length)}
              aria-label="الخبر التالي"
              className="p-1 border border-[#C89D42]/40 hover:border-[#D4A84F] text-[#E5DEC9] hover:text-[#D4A84F]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* ====================================================================
          2. واجهة الغلاف الملكية (Royal Feature Cover — 7/5 Asymmetric Showcase)
      ==================================================================== */}
      {leadStory && (
        <section aria-label="التغطية الرئيسية" className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
          {/* القصة الرئيسية الكبرى (7 أعمدة — مع صورة فوتوغرافية قانونية مرخّصة) */}
          <article className="lg:col-span-7 border-2 border-[#09241D] dark:border-[#C89D42]/60 bg-white dark:bg-[#0F1915] p-6 lg:p-8 flex flex-col justify-between group shadow-[0_4px_20px_rgba(9,36,29,0.05)]">
            <div>
              <div className="aspect-[16/9] w-full overflow-hidden bg-[#09241D] mb-5 border border-[#DED6C6] dark:border-[#1C2E27] relative">
                <img
                  src={leadStory.image.url}
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
                      });
                    }
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                {/* شريط ترخيص الصورة القانوني أسفل الصورة الرئيسية */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#F3EFE6]">
                  <span>{leadStory.image.credit}</span>
                  <span className="text-[#D4A84F] font-bold">
                    {leadStory.image.license}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-3">
                <span className="font-extrabold text-[#9E2A2B]">قصة الغلاف الرئيسية</span>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => onOpenCategory(leadStory.categorySlug)}
                  className="font-bold text-[#09241D] dark:text-[#D4A84F] hover:underline"
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
                <span className="tabular-nums font-bold text-[#B6862C] dark:text-[#D4A84F]">
                  موثق من {formatNumerals(leadStory.sources.length, siteConfig.numeralSystem)} مصادر رسمية
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-royal leading-snug text-[#09241D] dark:text-[#F3EFE6] mb-3.5 group-hover:text-[#B6862C] transition-colors">
                <button
                  type="button"
                  onClick={() => onOpenArticle(leadStory)}
                  className="text-start"
                >
                  {leadStory.headline}
                </button>
              </h1>

              <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                {leadStory.dek}
              </p>
            </div>

            {/* أبرز ما جاء في التقرير للخبر الرئيسي */}
            <div className="border-t-2 border-[#09241D]/20 dark:border-[#C89D42]/30 bg-[#F9F6F0] dark:bg-[#080E0C] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold text-[#09241D] dark:text-[#D4A84F]">
                  أبرز ما جاء في التقرير:
                </p>
                <button
                  type="button"
                  onClick={() => onOpenArticle(leadStory)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B6862C] hover:underline"
                >
                  <span>قراءة التقرير الكامل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-disc ps-5">
                {leadStory.keyPoints.slice(0, 3).map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          </article>

          {/* عمود مختارات الصدارة المصوّرة (5 أعمدة — 3 بطاقات أفقية فاخرة بصور فوتوغرافية) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            <div className="border-b-4 border-double border-[#09241D] dark:border-[#C89D42] pb-2 flex items-center justify-between">
              <h2 className="text-lg font-bold font-royal text-[#09241D] dark:text-[#F3EFE6]">
                مختارات الصدارة المصوّرة
              </h2>
              <span className="text-xs font-bold text-[#B6862C] dark:text-[#D4A84F]">
                صور وتقارير مرخّصة
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
      <section
        aria-label="بانوراما التقارير المصورة"
        className="border-y-4 border-double border-[#09241D] dark:border-[#C89D42]/50 bg-[#F1ECE1] dark:bg-[#0F1915] py-7 px-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-[#DED6C6] dark:border-[#1C2E27]">
          <div>
            <span className="text-xs font-bold text-[#B6862C] dark:text-[#D4A84F]">
              عدسة «ميزان الخبر» التوثيقية · صور مرخّصة قانونيًا (CC0 / Open Media)
            </span>
            <h2 className="text-2xl font-bold font-royal text-[#09241D] dark:text-[#F3EFE6] mt-0.5">
              بانوراما الملفات السورية والعربية والاقتصادية المصوّرة
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => onOpenCategory('syria')}
              className="font-bold text-[#09241D] dark:text-slate-200 hover:text-[#B6862C]"
            >
              ملف سوريا
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onOpenCategory('arab-world')}
              className="font-bold text-[#09241D] dark:text-slate-200 hover:text-[#B6862C]"
            >
              العالم العربي
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onOpenCategory('economy')}
              className="font-bold text-[#09241D] dark:text-slate-200 hover:text-[#B6862C]"
            >
              الاقتصاد والأسواق
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {photoReportageStories.map((item, idx) => (
            <article
              key={item.id}
              className="bg-white dark:bg-[#080E0C] border border-[#DED6C6] dark:border-[#1C2E27] p-3.5 flex flex-col justify-between group hover:border-[#B6862C] transition-colors"
            >
              <div>
                <div className="aspect-[16/10] w-full overflow-hidden bg-[#09241D] mb-3 relative">
                  <img
                    src={item.image.url}
                    alt={item.image.alt}
                    width={600}
                    height={375}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-2 start-2 bg-[#09241D]/90 text-[#D4A84F] px-2 py-0.5 text-[10px] font-bold">
                    0{formatNumerals(idx + 1, siteConfig.numeralSystem)} · {item.categoryName}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold font-display text-[#0C1713] dark:text-[#F3EFE6] leading-snug mb-2 group-hover:text-[#B6862C] transition-colors">
                  <button
                    type="button"
                    onClick={() => onOpenArticle(item)}
                    className="text-start"
                  >
                    {item.headline}
                  </button>
                </h3>
              </div>
              <div className="pt-2 border-t border-[#DED6C6]/60 dark:border-[#1C2E27] flex items-center justify-between text-[10px] text-slate-500">
                <span>ترخيص مفتوح</span>
                <span className="font-bold text-[#B6862C] dark:text-[#D4A84F]">
                  {formatNumerals(item.sources.length, siteConfig.numeralSystem)} مصادر رسمية
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ====================================================================
          4. الشبكة المزدوجة: تغطيات الأقسام التفاعلية (8 أعمدة) + الجناح الجانبي (4 أعمدة)
      ==================================================================== */}
      <section aria-label="أقسام الجريدة والمؤشرات" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* العمود الرئيسي (8 أعمدة): فلتر الأقسام الفوري + شبكة المجلة + ملفات التحليلات */}
        <div className="lg:col-span-8 space-y-10">
          <div className="space-y-6">
            <div className="border-b-4 border-double border-[#09241D] dark:border-[#C89D42]/60 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold font-royal text-[#09241D] dark:text-[#F3EFE6]">
                تغطيات الأقسام المتخصصة
              </h2>

              {/* أزرار التصفية التفاعلية السريعة */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedDeptFilter('all')}
                  className={`px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    selectedDeptFilter === 'all'
                      ? 'bg-[#09241D] text-[#F9F6F0] dark:bg-[#D4A84F] dark:text-[#080E0C]'
                      : 'bg-[#F1ECE1] dark:bg-[#0F1915] text-slate-700 dark:text-slate-300 hover:text-[#B6862C]'
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
                        ? 'bg-[#09241D] text-[#F9F6F0] dark:bg-[#D4A84F] dark:text-[#080E0C]'
                        : 'bg-[#F1ECE1] dark:bg-[#0F1915] text-slate-700 dark:text-slate-300 hover:text-[#B6862C]'
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
            <div className="border-2 border-[#09241D] dark:border-[#C89D42]/50 bg-[#F1ECE1]/80 dark:bg-[#0F1915] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DED6C6] dark:border-[#1C2E27] pb-4">
                <div>
                  <span className="text-xs font-extrabold text-[#B6862C] dark:text-[#D4A84F]">
                    ملفات التعمق التحريري · ماذا حدث ولماذا يهم؟
                  </span>
                  <h2 className="text-2xl font-bold font-royal text-[#09241D] dark:text-[#F3EFE6] mt-1">
                    قراءات تحليلية وشروحات موثقة للخلفيات والآثار
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenCategory('analysis')}
                  className="text-xs font-bold text-[#09241D] dark:text-[#D4A84F] hover:underline flex items-center gap-1 whitespace-nowrap shrink-0"
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

        {/* العمود الجانبي الملكي (4 أعمدة): موجز اليوم + الأكثر قراءة + مؤشرات الأسواق والطقس */}
        <aside className="lg:col-span-4 space-y-6">
          {/* موجز اليوم (Daily Digest) */}
          <div className="border-2 border-[#09241D] dark:border-[#C89D42]/60 bg-[#09241D] text-[#F9F6F0] p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#C89D42]/40">
              <h2 className="text-lg font-bold font-royal text-[#D4A84F]">
                موجز «ميزان الخبر» اليومي
              </h2>
              <span className="text-xs text-[#E5DEC9] font-bold">خلاصة العدد</span>
            </div>
            <p className="text-xs text-[#E5DEC9]/85 leading-relaxed mb-3.5">
              أهم الأخبار العاجلة والتقارير المرصودة اليوم من 45 شبكة إخبارية ووكالة رسمية عبر 100 صحفي ومراسل (50% سوريا · 40% العرب وتركيا · 10% دولي وتخصصي):
            </p>
            <ol className="space-y-3 text-xs leading-relaxed">
              {published.slice(0, 5).map((item, idx) => (
                <li key={item.id} className="flex items-start gap-2.5 pb-2.5 border-b border-[#C89D42]/20 last:border-b-0 last:pb-0">
                  <span className="font-royal text-lg font-bold text-[#D4A84F] tabular-nums shrink-0 leading-none">
                    0{formatNumerals(idx + 1, siteConfig.numeralSystem)}.
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenArticle(item)}
                    className="text-start text-white hover:text-[#D4A84F] font-bold leading-snug"
                  >
                    {item.headline}
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* الأكثر قراءة وتوثيقًا */}
          <div className="border border-[#DED6C6] dark:border-[#1C2E27] bg-white/90 dark:bg-[#0F1915] p-5">
            <div className="flex items-center justify-between pb-3 mb-2 border-b-4 border-double border-[#09241D] dark:border-[#C89D42]">
              <h2 className="text-lg font-bold font-royal text-[#09241D] dark:text-[#F3EFE6]">
                الأكثر قراءة وتوثيقًا
              </h2>
              <span className="text-xs text-[#B6862C] font-bold">ترتيب القراء</span>
            </div>
            <div className="divide-y divide-[#DED6C6] dark:divide-[#1C2E27]">
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
              className="border border-[#DED6C6] dark:border-[#1C2E27] bg-white/90 dark:bg-[#0F1915] p-5"
            >
              <div className="pb-2.5 mb-3 border-b border-[#DED6C6] dark:border-[#1C2E27]">
                <h3 className="text-base font-bold font-royal text-[#09241D] dark:text-[#D4A84F]">
                  {widget.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  المصدر:{' '}
                  <a
                    href={widget.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[#B6862C]"
                  >
                    {widget.sourceName}
                  </a>
                </p>
              </div>
              <div className="space-y-2">
                {widget.items.map((row, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 border-b border-[#DED6C6]/40 dark:border-[#1C2E27] last:border-b-0"
                  >
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">{row.label}</span>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <span className="font-bold text-[#0C1713] dark:text-[#F3EFE6]">
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
              <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                {widget.licenseNote} · آخر تحديث: {formatArabicDate(widget.updatedAt, siteConfig.numeralSystem)}
              </p>
            </div>
          ))}
        </aside>
      </section>

      {/* وحدة إعلانية اختيارية بين الكتل (معطّلة تمامًا إذا ADS_ENABLED=false) */}
      <AdSlot
        slotId="home-mid-leaderboard"
        format="horizontal"
        siteConfig={siteConfig}
        consentGranted={consentGranted}
      />

      {/* دعوة الاشتراك في النشرة البريدية اليومية (Double Opt-In) */}
      <section
        aria-label="الاشتراك في النشرة البريدية"
        className="border-4 border-double border-[#C89D42] bg-[#09241D] text-[#F9F6F0] p-8"
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#D4A84F]">نشرة «موجز ميزان الخبر» المسائية · مجانًا</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-royal">
              اشترك في الملخص اليومي للتقارير الموثقة بالمصادر الرسمية
            </h2>
            <p className="text-xs text-[#E5DEC9]/90 leading-relaxed max-w-2xl">
              رسالة واحدة مساء كل يوم تلخص أهم الأخبار السورية والعربية والاقتصادية والشروحات التي اجتازت التدقيق المصدري تحت إشراف رئيس التحرير ({siteConfig.editorInChiefName}).
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
              placeholder="name@example.com"
              className="px-3.5 py-2.5 text-xs bg-[#061813] border border-[#C89D42]/50 text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D4A84F] min-w-[240px]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-extrabold bg-[#D4A84F] text-[#09241D] hover:opacity-95 transition-opacity whitespace-nowrap shrink-0"
            >
              اشتراك وتأكيد البريد
            </button>
          </form>
        </div>
        {newsletterStatus && (
          <p className="max-w-4xl mx-auto mt-3 text-xs text-[#D4A84F] font-bold" role="status">
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
          className="h-full bg-[#B8892B] transition-transform duration-150 origin-right"
          style={{ transform: `scaleX(${scrollProgress / 100})` }}
        />
      </div>

      {/* مسار التنقل (Breadcrumb) */}
      <nav aria-label="مسار الصفحة" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
        <button type="button" onClick={() => onOpenCategory(article.categorySlug)} className="hover:text-[#B8892B]">
          الرئيسية
        </button>
        <span aria-hidden="true">/</span>
        <button
          type="button"
          onClick={() => onOpenCategory(article.categorySlug)}
          className="font-semibold text-[#B8892B] hover:underline"
        >
          {article.categoryName}
        </button>
        <span aria-hidden="true">/</span>
        <span className="truncate max-w-xs sm:max-w-md text-slate-700 dark:text-slate-300">{article.headline}</span>
      </nav>

      {/* ترويسة المقال: Kicker، H1، Dek، وسطر الكاتب والتواريخ */}
      <header className="mb-8 border-b border-[#E2DACB] dark:border-[#1E293B] pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-3">
          {article.type === 'breaking' && (
            <>
              <span className="font-bold text-[#C0392B]">عاجل</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span className="font-bold text-[#B8892B]">{article.categoryName}</span>
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
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display leading-tight text-[#0B1220] dark:text-[#F3EFE6] mb-4">
          {article.headline}
        </h1>

        <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
          {article.dek}
        </p>

        {/* سطر الكاتب والتاريخين وزمن القراءة والمشاركة النظيفة */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#E2DACB]/60 dark:border-[#1E293B] text-xs text-slate-600 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenAuthor}
              className="font-bold text-[#0B1220] dark:text-[#F3EFE6] hover:text-[#B8892B] underline decoration-[#B8892B]/50 underline-offset-4"
            >
              {article.authorName}
            </button>
            <span aria-hidden="true">·</span>
            <span>نُشر: {formatArabicDate(article.publishedAt, siteConfig.numeralSystem)}</span>
            {article.updatedAt !== article.publishedAt && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#B8892B]">
                  آخر تحديث: {formatArabicDate(article.updatedAt, siteConfig.numeralSystem)}
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Clock className="w-3.5 h-3.5 text-[#B8892B]" />
              {formatNumerals(article.readingTimeMin, siteConfig.numeralSystem)} دقائق قراءة ({formatNumerals(article.wordCount, siteConfig.numeralSystem)} كلمة)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E2DACB] dark:border-slate-700 hover:border-[#B8892B] text-[#0B1220] dark:text-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              <Share2 className="w-3.5 h-3.5 text-[#B8892B]" />
              <span>{shareCopied ? 'تم نسخ الرابط' : 'مشاركة الرابط'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* الصورة الرئيسية (1200x675) مع التعليق والإسناد والترخيص */}
      <figure className="mb-8 border border-[#E2DACB] dark:border-[#1E293B] bg-[#F3EFE6]/50 dark:bg-[#111C33]">
        <div className="aspect-[16/9] w-full overflow-hidden bg-[#0B1220]">
          <img
            src={article.image.url}
            alt={article.image.alt}
            width={1200}
            height={675}
            fetchPriority="high"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <figcaption className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <span>{article.image.caption}</span>
          <span className="font-mono text-[11px]">
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
              className="border border-[#E2DACB] dark:border-[#1E293B] bg-[#F3EFE6]/70 dark:bg-[#111C33] p-5"
            >
              <h2 className="text-sm font-bold font-display text-[#0B1220] dark:text-[#F3EFE6] mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#B8892B]" />
                <span>أبرز ما جاء في التقرير</span>
              </h2>
              <ul className="space-y-2 text-sm text-slate-800 dark:text-slate-200 list-disc ps-5 leading-relaxed">
                {article.keyPoints.map((pt, idx) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>
            </section>
          )}

          {/* المتن الأساسي للمقال بخط Noto Naskh Arabic (19.5px، ارتفاع سطر 1.9) */}
          <div
            className="font-editorial article-prose text-[#0B1220] dark:text-[#F3EFE6] max-w-prose"
            dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
          />

          {/* وحدة إعلانية داخل المقال (معطّلة إذا ADS_ENABLED=false أو حساسية عالية) */}
          <AdSlot
            slotId="article-inline-1"
            format="in-article"
            siteConfig={siteConfig}
            sensitivityLevel={article.sensitivityLevel}
            consentGranted={consentGranted}
          />

          {/* فقرة الخلفية والسياق (إن وجدت) */}
          {article.backgroundSection && (
            <section
              aria-label="خلفية الخبر والسياق"
              className="border border-[#E2DACB] dark:border-[#1E293B] bg-[#FAF7F2] dark:bg-[#111C33]/80 p-5"
            >
              <h2 className="text-base font-bold font-display text-[#0B1220] dark:text-[#F3EFE6] mb-2">
                الخلفية والسياق
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {article.backgroundSection}
              </p>
            </section>
          )}

          {/* فقرة "ماذا يعني ذلك؟" موسومة صراحة بأنها قراءة تحليلية */}
          {article.analysisSection && (
            <section
              aria-label="قراءة تحليلية"
              className="border border-[#B8892B]/50 bg-[#F3EFE6]/80 dark:bg-[#111C33] p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold font-display text-[#0B1220] dark:text-[#F3EFE6]">
                  ماذا يعني ذلك؟
                </h2>
                <span className="text-xs font-semibold text-[#B8892B]">
                  قراءة تحليلية (مفصولة عن الخبر)
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {article.analysisSection}
              </p>
            </section>
          )}

          {/* فقرة "ما التالي؟" */}
          {article.whatNextSection && (
            <section
              aria-label="المسار المتوقع"
              className="border border-[#E2DACB] dark:border-[#1E293B] bg-[#FAF7F2] dark:bg-[#111C33]/60 p-5"
            >
              <h2 className="text-base font-bold font-display text-[#0B1220] dark:text-[#F3EFE6] mb-2">
                ما التالي؟ (المسار المتوقع)
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {article.whatNextSection}
              </p>
            </section>
          )}

          {/* صندوق التصحيحات العلنية (يظهر أسفل المقال عند وجود أي تصحيح) */}
          {article.corrections.length > 0 && (
            <section
              aria-label="تصحيحات وتوضيحات علنية"
              className="border border-[#B8892B] bg-[#B8892B]/10 p-5 space-y-2"
            >
              <h2 className="text-sm font-bold font-display text-[#0B1220] dark:text-[#F3EFE6] flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#B8892B]" />
                <span>سجل التصحيحات والتوضيحات العلنية على هذا المقال</span>
              </h2>
              {article.corrections.map((c) => (
                <div key={c.id} className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  <p>{c.text}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    راجعه وصوّبه: {c.correctedBy} ·{' '}
                    {formatArabicDate(c.publishedAt, siteConfig.numeralSystem)}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* ملاحظة المنهجية التحريرية والمرجعيات */}
          <section
            aria-label="المعايير التحريرية والمرجعيات"
            className="border border-[#E2DACB] dark:border-[#1E293B] bg-[#F3EFE6]/90 dark:bg-[#111C33] p-5 text-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0B1220] dark:text-[#F3EFE6] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#B8892B]" />
                <span>المعايير التحريرية وتوثيق المصادر</span>
              </span>
              <button
                type="button"
                onClick={() => onOpenLegal('editorial-policy')}
                className="underline text-[#B8892B] hover:text-[#0B1220] dark:hover:text-white font-semibold"
              >
                السياسة التحريرية ومنهجية التدقيق
              </button>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{disclosureText}</p>
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#E2DACB] dark:border-[#1E293B]">
              <span className="text-slate-500">
                إشراف تحريري: {siteConfig.editorInChiefName} · غرفة أخبار «{siteConfig.siteName}»
              </span>
              <button
                type="button"
                onClick={() => setShowCorrectionForm((s) => !s)}
                className="underline text-slate-700 dark:text-slate-300 hover:text-[#B8892B]"
              >
                الإبلاغ عن ملاحظة أو تصويب تحريري
              </button>
            </div>

            {showCorrectionForm && (
              <form onSubmit={handleCorrectionReport} className="pt-3 space-y-2 border-t border-[#E2DACB] dark:border-slate-800">
                <label htmlFor="correction-note" className="block font-semibold">
                  ملاحظتك أو التصويب المقترح (مع ذكر المصدر المرجعي):
                </label>
                <textarea
                  id="correction-note"
                  required
                  rows={2}
                  value={correctionNote}
                  onChange={(e) => setCorrectionNote(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-[#0B1220] border border-[#E2DACB] dark:border-slate-700"
                  placeholder="اذكر المعلومة أو الرقم الذي يحتاج إلى مراجعة..."
                />
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="email"
                    value={correctionEmail}
                    onChange={(e) => setCorrectionEmail(e.target.value)}
                    placeholder="بريدك الإلكتروني (اختياري للمتابعة)"
                    className="px-2.5 py-1.5 bg-white dark:bg-[#0B1220] border border-[#E2DACB] dark:border-slate-700"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#0B1220] text-[#FAF7F2] dark:bg-[#B8892B] dark:text-[#0B1220] font-semibold"
                  >
                    إرسال لهيئة التحرير
                  </button>
                </div>
                {correctionSubmitted && (
                  <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                    شكرًا لك؛ تم تسجيل طلب التصحيح في طابور المراجعة التحريرية.
                  </p>
                )}
              </form>
            )}
          </section>

          {/* الوسوم (Tags) */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="text-slate-500 font-semibold">الموضوعات والوسوم:</span>
            {article.tags.map((tagName, idx) => {
              const matchedTag = tags.find((t) => t.name === tagName);
              const slug = matchedTag ? matchedTag.slug : tagName;
              return (
                <React.Fragment key={tagName}>
                  {idx > 0 && <span aria-hidden="true" className="text-slate-400">·</span>}
                  <button
                    type="button"
                    onClick={() => onOpenTag(slug)}
                    className="text-[#0B1220] dark:text-slate-200 hover:text-[#B8892B] underline decoration-[#E2DACB] underline-offset-4"
                  >
                    {tagName}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* العمود الجانبي في صفحة المقال: المصادر الموثقة والادعاءات المفحوصة */}
        <aside className="lg:col-span-4 space-y-6">
          <section
            aria-label="المصادر الرسمية المسندة"
            className="border border-[#E2DACB] dark:border-[#1E293B] bg-[#FAF7F2] dark:bg-[#111C33] p-5"
          >
            <h2 className="text-sm font-bold font-display text-[#0B1220] dark:text-[#F3EFE6] pb-3 mb-3 border-b border-[#E2DACB] dark:border-[#1E293B] flex items-center justify-between">
              <span>المصادر الأولية المعتمدة</span>
              <span className="font-mono text-xs text-[#B8892B]">
                {formatNumerals(article.sources.length, siteConfig.numeralSystem)} مصادر
              </span>
            </h2>
            <ul className="space-y-3 text-xs">
              {article.sources.map((src, idx) => (
                <li
                  key={idx}
                  className="pb-3 border-b border-[#E2DACB]/60 dark:border-slate-800 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-semibold text-[#B8892B]">
                      المستوى {formatNumerals(src.tier, siteConfig.numeralSystem)} ({src.role === 'official' ? 'مصدر رسمي أولي' : 'مصدر مستقل'})
                    </span>
                  </div>
                  <p className="font-bold text-[#0B1220] dark:text-slate-200 mb-1">{src.publisher}</p>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-[#B8892B] underline"
                  >
                    <span>{src.title}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* قراءة سريعة في نفس القسم (بدل بطاقة الـ Verifier التقنية الداخلية) */}
          {relatedArticles.length > 0 && (
            <section
              aria-label="تغطيات ذات صلة في نفس القسم"
              className="border border-[#E2DACB] dark:border-[#1E293B] bg-[#F3EFE6]/60 dark:bg-[#111C33] p-5"
            >
              <h2 className="text-sm font-bold font-display text-[#0B1220] dark:text-[#F3EFE6] pb-2.5 mb-3 border-b border-[#E2DACB] dark:border-[#1E293B] flex items-center justify-between">
                <span>تغطيات ذات صلة في «{article.categoryName}»</span>
              </h2>
              <ul className="space-y-3 text-xs">
                {relatedArticles.map((rel) => (
                  <li
                    key={rel.id}
                    className="pb-2.5 border-b border-[#E2DACB]/60 dark:border-slate-800 last:border-b-0 last:pb-0"
                  >
                    <button
                      type="button"
                      onClick={() => onOpenArticle(rel)}
                      className="text-start font-bold text-[#0B1220] dark:text-slate-200 hover:text-[#B8892B] leading-snug"
                    >
                      {rel.headline}
                    </button>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {formatArabicDate(rel.publishedAt, siteConfig.numeralSystem)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* وحدة إعلانية في الشريط الجانبي (معطّلة افتراضيًا) */}
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
        className="mt-12 pt-6 border-t border-[#E2DACB] dark:border-[#1E293B] grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {prevArticle ? (
          <button
            type="button"
            onClick={() => onOpenArticle(prevArticle)}
            className="p-4 border border-[#E2DACB] dark:border-[#1E293B] text-start hover:border-[#B8892B] transition-colors"
          >
            <span className="text-xs text-slate-500 flex items-center gap-1 mb-1">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>التقرير السابق</span>
            </span>
            <p className="text-sm font-bold font-display text-[#0B1220] dark:text-[#F3EFE6] line-clamp-2">
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
            className="p-4 border border-[#E2DACB] dark:border-[#1E293B] text-start hover:border-[#B8892B] transition-colors"
          >
            <span className="text-xs text-slate-500 flex items-center justify-end gap-1 mb-1">
              <span>التقرير التالي</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
            <p className="text-sm font-bold font-display text-[#0B1220] dark:text-[#F3EFE6] line-clamp-2">
              {nextArticle.headline}
            </p>
          </button>
        )}
      </nav>

      {/* مقالات ذات صلة (الأكثر صلة) */}
      {relatedArticles.length > 0 && (
        <section aria-label="تقارير ذات صلة" className="mt-12 pt-8 border-t border-[#E2DACB] dark:border-[#1E293B]">
          <h2 className="text-xl font-bold font-display text-[#0B1220] dark:text-[#F3EFE6] mb-6">
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
// 4. صفحات الأقسام (CategoryArchiveView مع ترقيم صفحات حقيقي)، الوسوم، البحث، والتصحيحات
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
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedArticles = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-8">
      <header className="border-b border-[#E2DACB] dark:border-[#1E293B] pb-6">
        <span className="text-xs font-bold text-[#B8892B]">قسم تحريري متخصص</span>
        <h1 className="text-3xl font-extrabold font-display text-[#0B1220] dark:text-[#F3EFE6] mt-1">
          {section.name}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
          {section.description}
        </p>
      </header>

      {pagedArticles.length === 0 ? (
        <div className="border border-[#E2DACB] dark:border-[#1E293B] p-8 text-center text-sm text-slate-600 dark:text-slate-400">
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

      {/* ترقيم صفحات حقيقي بروابط قابلة للزحف */}
      <nav aria-label="ترقيم صفحات القسم" className="flex items-center justify-between pt-6 border-t border-[#E2DACB] dark:border-[#1E293B] text-xs">
        <span className="text-slate-500 tabular-nums">
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
                  ? 'bg-[#0B1220] text-[#FAF7F2] dark:bg-[#B8892B] dark:text-[#0B1220] border-transparent font-bold'
                  : 'border-[#E2DACB] dark:border-slate-700 text-slate-700 dark:text-slate-300'
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
  const isNoindex = count < 5;

  return (
    <div className="space-y-8">
      <header className="border-b border-[#E2DACB] dark:border-[#1E293B] pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
          <span>أرشيف الموضوعات والوسوم</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono">
            {isNoindex
              ? `noindex تلقائي (أقل من 5 مقالات: ${count} مقالات — حماية ضد الصفحات الرقيقة)`
              : `مفهرس في محركات البحث (${count} مقالات ≥ 5)`}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0B1220] dark:text-[#F3EFE6]">
          وسم: {displayName}
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
      <header className="border-b border-[#E2DACB] dark:border-[#1E293B] pb-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>البحث الفوري في الأرشيف الموثق</span>
          <span className="font-mono">robots: noindex, nofollow (حماية من فهرسة نتائج البحث الداخلي)</span>
        </div>
        <h1 className="text-2xl font-extrabold font-display text-[#0B1220] dark:text-[#F3EFE6]">
          البحث في تقارير «الميزان الإخباري»
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
            placeholder="ابحث عن كلمة مفتاحية، مؤسسة دولية، أو ملف اقتصادي..."
            className="w-full px-4 py-2.5 text-sm bg-white dark:bg-[#111C33] border border-[#E2DACB] dark:border-slate-700 text-[#0B1220] dark:text-[#F3EFE6]"
          />
        </div>
      </header>

      {results.length === 0 ? (
        <div className="border border-[#E2DACB] dark:border-[#1E293B] p-8 text-center text-sm text-slate-600 dark:text-slate-400">
          لم يتم العثور على تقارير مطابقة لعبارة البحث «{query}». (تُحجب الإعلانات تلقائيًا في صفحات البحث الفارغة).
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
// 5. صفحات الثقة، هيئة التحرير، سجل التصحيحات، والصفحات القانونية الـ 11
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
      <header className="border-b border-[#E2DACB] dark:border-[#1E293B] pb-6">
        <span className="text-xs font-bold text-[#B8892B]">الشفافية والمساءلة التحريرية</span>
        <h1 className="text-3xl font-extrabold font-display text-[#0B1220] dark:text-[#F3EFE6] mt-1">
          سجل التصحيحات والتوضيحات العلني
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          تلتزم «الميزان الإخباري» بنشر أي تصويب أو تحديث جوهري يطرأ على الأرقام أو الوقائع بشفافية كاملة دون حذف صامت.
        </p>
      </header>

      <div className="space-y-4">
        {allCorrections.map((item) => (
          <div
            key={item.id}
            className="border border-[#E2DACB] dark:border-[#1E293B] bg-[#FAF7F2] dark:bg-[#111C33] p-5 space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500">
              <span>تاريخ التصويب: {formatArabicDate(item.publishedAt, numeralSystem)}</span>
              <span>المراجع: {item.correctedBy}</span>
            </div>
            <h2 className="text-base font-bold font-display text-[#0B1220] dark:text-[#F3EFE6]">
              <button
                type="button"
                onClick={() => onOpenArticle(item.articleRef)}
                className="hover:text-[#B8892B] text-start underline"
              >
                {item.articleHeadline}
              </button>
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
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

  const chiefEditor = authors.find((a) => a.id === 'editor-ibrahim');
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
      <header className="border-b-4 border-double border-[#09241D] dark:border-[#C89D42]/60 pb-6">
        <span className="text-xs font-bold text-[#B8892B]">
          المسؤولية التحريرية والشفافية · 100 صحفي ومراسل متخصص · 45 مصدرًا معتمدًا
        </span>
        <h1 className="text-3xl font-extrabold font-royal text-[#0B1220] dark:text-[#F3EFE6] mt-1">
          هيئة التحرير والكادر الصحفي المتخصص (100 كاتب ومراسل)
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
          تعمل غرفة أخبار «{siteConfig.siteName}» تحت الإشراف المباشر لرئيس التحرير المسؤول ({siteConfig.editorInChiefName}) وبكادر يضم 100 صحفي ومراسل موزعين وفق الأولوية التحريرية: 50 صحفيًا للشأن السوري (50%)، و40 صحفيًا للعالم العربي وتركيا (40%)، و10 محررين للأقسام التخصصية والدولية (10%).
        </p>
      </header>

      {/* بطاقة الهوية الرسمية لرئيس التحرير والمؤسسة */}
      <section className="border-2 border-[#09241D] dark:border-[#C89D42]/60 bg-[#F3EFE6]/80 dark:bg-[#111C33] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold font-royal text-[#0B1220] dark:text-[#F3EFE6]">
            البطاقة التعريفية للمؤسسة ورئاسة التحرير
          </h2>
          {chiefEditor && (
            <span className="px-3 py-1 bg-[#09241D] text-[#D4A84F] text-xs font-bold">
              المدير العام ورئيس التحرير المسؤول: {siteConfig.editorInChiefName}
            </span>
          )}
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 border border-[#E2DACB] dark:border-slate-800 bg-[#FAF7F2] dark:bg-[#0B1220]">
            <dt className="text-slate-500 mb-1">المؤسسة الناشرة:</dt>
            <dd className="font-bold text-sm text-[#0B1220] dark:text-[#F3EFE6]">
              {siteConfig.publisherLegalName}
            </dd>
          </div>
          <div className="p-3.5 border border-[#E2DACB] dark:border-slate-800 bg-[#FAF7F2] dark:bg-[#0B1220]">
            <dt className="text-slate-500 mb-1">رئيس التحرير المسؤول:</dt>
            <dd className="font-bold text-sm text-[#0B1220] dark:text-[#F3EFE6]">
              {siteConfig.editorInChiefName}
            </dd>
          </div>
          <div className="p-3.5 border border-[#E2DACB] dark:border-slate-800 bg-[#FAF7F2] dark:bg-[#0B1220]">
            <dt className="text-slate-500 mb-1">البريد الإلكتروني الرسمي:</dt>
            <dd className="font-mono font-bold text-sm text-[#0B1220] dark:text-[#F3EFE6]">
              <a href={`mailto:${siteConfig.contactEmail}`} className="hover:text-[#B8892B] underline">
                {siteConfig.contactEmail}
              </a>
            </dd>
          </div>
          <div className="p-3.5 border border-[#E2DACB] dark:border-slate-800 bg-[#FAF7F2] dark:bg-[#0B1220] sm:col-span-3">
            <dt className="text-slate-500 mb-1">التوزيع التحريري المعتمد للكادر (100 صحفي) والمصادر (45 مصدرًا):</dt>
            <dd className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {siteConfig.editorBio} — يشرف على تنسيق العمل بين وحدات الرصد والتدقيق الواردة من 45 وكالة أنباء وشبكة إخبارية معتمدة، مع التركيز على الأخبار العاجلة والمهمة.
            </dd>
          </div>
        </dl>
      </section>

      {/* لوحة التوزيع الهيكلي للصحفيين (50% سوريا | 40% العرب وتركيا | 10% باقي الأقسام) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border-2 border-[#09241D] dark:border-[#C89D42]/60 bg-[#09241D] text-[#F9F6F0] p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#D4A84F]">الوحدة الأولى · الأولوية القصوى</span>
            <span className="text-2xl font-extrabold font-royal text-[#D4A84F]">50%</span>
          </div>
          <h3 className="text-lg font-bold font-royal">فريق الشأن السوري (50 صحفيًا)</h3>
          <p className="text-xs text-[#E5DEC9]/85 leading-relaxed">
            تغطية شاملة ومعمّقة لجميع المحافظات السورية الـ 14، والاقتصاد والمعيشة، وإعادة الإعمار، والطاقة والمياه، والمعابر الحدودية، والمرافئ، والجامعات.
          </p>
        </div>

        <div className="border-2 border-[#09241D] dark:border-[#C89D42]/60 bg-white dark:bg-[#111C33] p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#B8892B]">الوحدة الثانية · التغطية الإقليمية</span>
            <span className="text-2xl font-extrabold font-royal text-[#09241D] dark:text-[#D4A84F]">40%</span>
          </div>
          <h3 className="text-lg font-bold font-royal text-[#0B1220] dark:text-[#F3EFE6]">
            فريق العالم العربي وتركيا (40 صحفيًا)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            مراسلون ومحررون متخصصون في الشأن التركي (أنقرة وإسطنبول وغازي عنتاب ومرسين) وجميع العواصم العربية في الخليج والمشرق ووادي النيل والمغرب العربي.
          </p>
        </div>

        <div className="border border-[#E2DACB] dark:border-[#1E293B] bg-[#FAF7F2] dark:bg-[#0F1915] p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#B8892B]">الوحدة الثالثة · التغطية التخصصية</span>
            <span className="text-2xl font-extrabold font-royal text-[#09241D] dark:text-[#D4A84F]">10%</span>
          </div>
          <h3 className="text-lg font-bold font-royal text-[#0B1220] dark:text-[#F3EFE6]">
            فريق الأقسام التخصصية والدولية (10 محررين)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            نخبة من المحررين المتخصصين في التكنولوجيا والذكاء الاصطناعي، والعلوم والصحة، والثقافة والتراث، والرياضة، والتحليلات الاستراتيجية، والاقتصاد الدولي.
          </p>
        </div>
      </section>

      {/* أزرار تصفية السجل الكامل للصحفيين הـ 100 */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2DACB] dark:border-[#1E293B] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setUnitFilter('all')}
            className={`px-3.5 py-2 text-xs font-bold transition-colors ${
              unitFilter === 'all'
                ? 'bg-[#09241D] text-[#F9F6F0] dark:bg-[#D4A84F] dark:text-[#080E0C]'
                : 'bg-[#F1ECE1] dark:bg-[#111C33] text-slate-700 dark:text-slate-300 hover:text-[#B8892B]'
            }`}
          >
            جميع الصحفيين ({syriaAuthors.length + arabTurkeyAuthors.length + otherAuthors.length})
          </button>
          <button
            type="button"
            onClick={() => setUnitFilter('syria')}
            className={`px-3.5 py-2 text-xs font-bold transition-colors ${
              unitFilter === 'syria'
                ? 'bg-[#09241D] text-[#F9F6F0] dark:bg-[#D4A84F] dark:text-[#080E0C]'
                : 'bg-[#F1ECE1] dark:bg-[#111C33] text-slate-700 dark:text-slate-300 hover:text-[#B8892B]'
            }`}
          >
            صحفيو الشأن السوري ({syriaAuthors.length} — 50%)
          </button>
          <button
            type="button"
            onClick={() => setUnitFilter('arab_turkey')}
            className={`px-3.5 py-2 text-xs font-bold transition-colors ${
              unitFilter === 'arab_turkey'
                ? 'bg-[#09241D] text-[#F9F6F0] dark:bg-[#D4A84F] dark:text-[#080E0C]'
                : 'bg-[#F1ECE1] dark:bg-[#111C33] text-slate-700 dark:text-slate-300 hover:text-[#B8892B]'
            }`}
          >
            صحفيو العرب وتركيا ({arabTurkeyAuthors.length} — 40%)
          </button>
          <button
            type="button"
            onClick={() => setUnitFilter('other')}
            className={`px-3.5 py-2 text-xs font-bold transition-colors ${
              unitFilter === 'other'
                ? 'bg-[#09241D] text-[#F9F6F0] dark:bg-[#D4A84F] dark:text-[#080E0C]'
                : 'bg-[#F1ECE1] dark:bg-[#111C33] text-slate-700 dark:text-slate-300 hover:text-[#B8892B]'
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
            className="border border-[#E2DACB] dark:border-[#1E293B] bg-[#FAF7F2] dark:bg-[#111C33] p-5 space-y-2 flex flex-col justify-between hover:border-[#B8892B] transition-colors"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#B8892B]">{author.roleTitle}</span>
                <span className="text-[10px] font-mono text-slate-400">#{index + 1}</span>
              </div>
              <h3 className="text-lg font-bold font-display text-[#0B1220] dark:text-[#F3EFE6]">
                {author.name}
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{author.bio}</p>
            </div>
            <p className="pt-2 text-[11px] text-slate-500 border-t border-[#E2DACB]/60 dark:border-slate-800">
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
      {/* قائمة صفحات الثقة والقانون */}
      <aside className="lg:col-span-4 border border-[#E2DACB] dark:border-[#1E293B] bg-[#F3EFE6]/60 dark:bg-[#111C33] p-5">
        <h2 className="text-sm font-bold font-display text-[#0B1220] dark:text-[#F3EFE6] pb-3 mb-3 border-b border-[#E2DACB] dark:border-[#1E293B]">
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
                  ? 'bg-[#0B1220] text-[#FAF7F2] dark:bg-[#B8892B] dark:text-[#0B1220] font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {p.titleAr}
            </button>
          ))}
        </nav>
      </aside>

      {/* محتوى الصفحة القانونية */}
      <div className="lg:col-span-8 border border-[#E2DACB] dark:border-[#1E293B] bg-[#FAF7F2] dark:bg-[#111C33] p-6 sm:p-8 space-y-6">
        <header className="border-b border-[#E2DACB] dark:border-[#1E293B] pb-5">
          <span className="text-xs font-semibold text-[#B8892B]">
            وثيقة رسمية ملزمة · آخر تحديث: {page.lastUpdated}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0B1220] dark:text-[#F3EFE6] mt-1">
            {page.titleAr}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            {page.subtitleAr}
          </p>
        </header>

        {page.requiresPublisherIdentity && (
          <div className="p-4 border border-[#E2DACB] dark:border-slate-700 bg-[#F3EFE6]/70 dark:bg-[#0B1220] text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#0B1220] dark:text-[#F3EFE6]">
              <ShieldCheck className="w-4 h-4 text-[#B8892B]" />
              <span>البيانات الرسمية للمؤسسة الناشرة:</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300">
              المؤسسة: <strong>{siteConfig.publisherLegalName}</strong> · رئيس التحرير المسؤول:{' '}
              <strong>{siteConfig.editorInChiefName}</strong> · البريد الإلكتروني الرسمي:{' '}
              <a href={`mailto:${siteConfig.contactEmail}`} className="font-mono font-bold underline hover:text-[#B8892B]">
                {siteConfig.contactEmail}
              </a>
            </p>
          </div>
        )}

        <div className="space-y-6">
          {page.sections.map((sec, idx) => (
            <section key={idx} className="space-y-2.5">
              <h2 className="text-lg font-bold font-display text-[#0B1220] dark:text-[#F3EFE6]">
                {sec.heading}
              </h2>
              {sec.paragraphs.map((p, pIdx) => (
                <p
                  key={pIdx}
                  className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        {/* نموذج تفاعلي في صفحتي اتصل بنا وحقوق النشر (DMCA) */}
        {(page.slug === 'contact' || page.slug === 'dmca') && (
          <form
            onSubmit={handleSubmit}
            className="pt-6 border-t border-[#E2DACB] dark:border-[#1E293B] space-y-4 text-xs"
          >
            <h3 className="text-base font-bold font-display text-[#0B1220] dark:text-[#F3EFE6] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#B8892B]" />
              <span>
                {page.slug === 'dmca'
                  ? 'نموذج إشعار حقوق النشر وطلب الإزالة الرسمي (DMCA)'
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
                  className="w-full px-3 py-2 bg-white dark:bg-[#0B1220] border border-[#E2DACB] dark:border-slate-700"
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
                  className="w-full px-3 py-2 bg-white dark:bg-[#0B1220] border border-[#E2DACB] dark:border-slate-700"
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
                className="w-full px-3 py-2 bg-white dark:bg-[#0B1220] border border-[#E2DACB] dark:border-slate-700"
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
                className="w-full px-3 py-2 bg-white dark:bg-[#0B1220] border border-[#E2DACB] dark:border-slate-700"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                محمي ضد الرسائل المزعجة (Cloudflare Turnstile &amp; Rate Limiting)
              </span>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0B1220] text-[#FAF7F2] dark:bg-[#B8892B] dark:text-[#0B1220] font-bold"
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
