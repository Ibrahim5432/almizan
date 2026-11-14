import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
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
import { buildEditorialDisclosure, curateMagazineArticlesOrder, generateTypographicSvgDataUri } from '../core/pipeline';
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

function handleArticleImageError(e: React.SyntheticEvent<HTMLImageElement>, article: ArticleRecord) {
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
}

// ============================================================================
// 1. بطاقة الخبر الصحفية الرفيعة (Architectural Broadsheet Card)
// ============================================================================
export const EditorialCard: React.FC<{
  article: ArticleRecord;
  size?: 'large' | 'medium' | 'horizontal' | 'compact' | 'column';
  rankNumber?: number;
  numeralSystem: 'western' | 'eastern';
  onOpenArticle: (article: ArticleRecord) => void;
  onOpenCategory: (slug: CategorySlug) => void;
}> = ({ article, size = 'medium', rankNumber, numeralSystem, onOpenArticle, onOpenCategory }) => {
  const isBreaking = article.type === 'breaking';

  if (size === 'compact') {
    return (
      <article className="py-3.5 border-b border-[#E2DDD3] dark:border-[#1F2724] last:border-b-0 group flex items-start gap-3.5">
        {typeof rankNumber === 'number' && (
          <span className="font-royal text-2xl font-bold text-[#9A7125] dark:text-[#D4AF5A] tabular-nums leading-none pt-0.5 shrink-0">
            {rankNumber < 10 ? '0' : ''}
            {formatNumerals(rankNumber, numeralSystem)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#5A5D5B] dark:text-[#9CA39F] mb-1">
            {isBreaking && (
              <>
                <span className="font-bold text-[#9B1C1C] dark:text-[#E05252]">عاجل</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <button
              type="button"
              onClick={() => onOpenCategory(article.categorySlug)}
              className="font-bold text-[#0F2922] dark:text-[#D4AF5A] hover:underline"
            >
              {article.categoryName}
            </button>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {formatNumerals(article.readingTimeMin, numeralSystem)} د قراءة
            </span>
          </div>
          <h3 className="text-sm sm:text-[15px] font-bold font-display leading-snug text-[#111312] dark:text-[#F3F0EA] group-hover:text-[#9A7125] dark:group-hover:text-[#D4AF5A] transition-colors">
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

  if (size === 'column') {
    return (
      <article className="pt-1 pb-2 flex flex-col justify-between space-y-2.5 group">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#5A5D5B] dark:text-[#9CA39F]">
            {isBreaking && (
              <>
                <span className="font-bold text-[#9B1C1C] dark:text-[#E05252]">عاجل</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <button
              type="button"
              onClick={() => onOpenCategory(article.categorySlug)}
              className="font-bold text-[#9A7125] dark:text-[#D4AF5A] hover:underline"
            >
              {article.categoryName}
            </button>
            <span aria-hidden="true">·</span>
            <span>{formatArabicDate(article.publishedAt, numeralSystem)}</span>
          </div>
          <h3 className="text-base font-bold font-display leading-snug text-[#111312] dark:text-[#F3F0EA] group-hover:text-[#9A7125] dark:group-hover:text-[#D4AF5A] transition-colors">
            <button
              type="button"
              onClick={() => onOpenArticle(article)}
              className="text-start"
            >
              {article.headline}
            </button>
          </h3>
          <p className="text-xs text-[#5A5D5B] dark:text-[#9CA39F] leading-relaxed line-clamp-3">
            {article.dek}
          </p>
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#5A5D5B] dark:text-[#9CA39F] pt-1">
          <span className="font-medium truncate">{article.authorName}</span>
          <span className="tabular-nums font-semibold text-[#0F2922] dark:text-[#D4AF5A] shrink-0 ms-2">
            {formatNumerals(article.sources.length, numeralSystem)} مصادر
          </span>
        </div>
      </article>
    );
  }

  if (size === 'horizontal') {
    return (
      <article className="grid grid-cols-1 sm:grid-cols-12 gap-4 border border-[#E2DDD3] dark:border-[#1F2724] bg-white dark:bg-[#111614] p-4 transition-colors hover:border-[#9A7125] dark:hover:border-[#D4AF5A] items-center group">
        <div className="sm:col-span-5 aspect-[16/10] w-full overflow-hidden bg-[#0F2922] border border-[#E2DDD3] dark:border-[#1F2724]">
          <img
            src={resolvePublicImageUrl(article.image.url)}
            alt={article.image.alt}
            width={1200}
            height={675}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => handleArticleImageError(e, article)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="sm:col-span-7 flex flex-col justify-between space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#5A5D5B] dark:text-[#9CA39F]">
            {isBreaking && (
              <>
                <span className="font-bold text-[#9B1C1C] dark:text-[#E05252]">عاجل</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <button
              type="button"
              onClick={() => onOpenCategory(article.categorySlug)}
              className="font-bold text-[#0F2922] dark:text-[#D4AF5A] hover:underline"
            >
              {article.categoryName}
            </button>
            <span aria-hidden="true">·</span>
            <span>{formatArabicDate(article.publishedAt, numeralSystem)}</span>
          </div>
          <h3 className="text-base lg:text-lg font-extrabold font-display leading-snug text-[#111312] dark:text-[#F3F0EA] group-hover:text-[#9A7125] dark:group-hover:text-[#D4AF5A] transition-colors">
            <button
              type="button"
              onClick={() => onOpenArticle(article)}
              className="text-start"
            >
              {article.headline}
            </button>
          </h3>
          <p className="text-xs text-[#5A5D5B] dark:text-[#9CA39F] leading-relaxed line-clamp-2">
            {article.dek}
          </p>
          <div className="pt-1 flex items-center justify-between text-[11px] text-[#5A5D5B] dark:text-[#9CA39F]">
            <span className="font-medium truncate">{article.authorName}</span>
            <span className="tabular-nums font-bold text-[#9A7125] dark:text-[#D4AF5A] shrink-0 ms-2">
              {formatNumerals(article.sources.length, numeralSystem)} مصادر رسمية
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col justify-between border border-[#E2DDD3] dark:border-[#1F2724] bg-white dark:bg-[#111614] p-5 transition-colors hover:border-[#9A7125] dark:hover:border-[#D4AF5A] group">
      <div>
        <div className="aspect-[16/10] w-full overflow-hidden bg-[#0F2922] mb-4 border border-[#E2DDD3] dark:border-[#1F2724]">
          <img
            src={resolvePublicImageUrl(article.image.url)}
            alt={article.image.alt}
            width={1200}
            height={675}
            loading={size === 'large' ? 'eager' : 'lazy'}
            referrerPolicy="no-referrer"
            onError={(e) => handleArticleImageError(e, article)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-[#5A5D5B] dark:text-[#9CA39F] mb-2">
          {isBreaking && (
            <>
              <span className="font-bold text-[#9B1C1C] dark:text-[#E05252]">عاجل</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <button
            type="button"
            onClick={() => onOpenCategory(article.categorySlug)}
            className="font-bold text-[#0F2922] dark:text-[#D4AF5A] hover:underline"
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
            size === 'large' ? 'text-2xl lg:text-3xl font-royal' : 'text-lg lg:text-xl font-display'
          } font-bold leading-snug text-[#111312] dark:text-[#F3F0EA] mb-2.5 group-hover:text-[#9A7125] dark:group-hover:text-[#D4AF5A] transition-colors`}
        >
          <button
            type="button"
            onClick={() => onOpenArticle(article)}
            className="text-start"
          >
            {article.headline}
          </button>
        </h3>

        <p className="text-sm text-[#5A5D5B] dark:text-[#C5C2BA] leading-relaxed mb-4 line-clamp-3">
          {article.dek}
        </p>
      </div>

      <div className="pt-3 border-t border-[#E2DDD3] dark:border-[#1F2724] flex items-center justify-between text-xs text-[#5A5D5B] dark:text-[#9CA39F]">
        <span className="font-medium truncate">{article.authorName}</span>
        <span className="tabular-nums font-bold text-[#9A7125] dark:text-[#D4AF5A] shrink-0 ms-2">
          {formatNumerals(article.sources.length, numeralSystem)} مصادر رسمية
        </span>
      </div>
    </article>
  );
};

// ============================================================================
// 2. الصفحة الرئيسية (HomeView) — تصميم المجلة الإخبارية السورية والعربية الحديثة
// مستوحى من أفضل عناصر «تلفزيون سوريا» و«زمان الوصل» و«حلب اليوم» بإشراف أ. مازن الدمشقي ود. حسام الشامي
// ============================================================================
export const HomeView: React.FC<{
  articles: ArticleRecord[];
  widgets?: ServiceDataWidget[];
  siteConfig: SiteConfig;
  consentGranted: boolean;
  onOpenArticle: (article: ArticleRecord) => void;
  onOpenCategory: (slug: CategorySlug) => void;
  onOpenTag: (tagSlug: string) => void;
  onOpenEditorialTeam?: () => void;
  onSubscribe: (email: string) => Promise<string>;
}> = ({
  articles,
  siteConfig,
  consentGranted,
  onOpenArticle,
  onOpenCategory,
  onSubscribe,
}) => {
  // ترتيب المجلة بإشراف أ. مازن الدمشقي (مدير الإخراج الفني والترتيب التحريري)
  const published = curateMagazineArticlesOrder(articles.filter((a) => a.status === 'published'));

  // توزيع غير متداخل للمقالات والصور عبر أقسام واجهة المجلة (صفر تكرار لأي مقال أو صورة)
  const usedIds = new Set<string>();
  const takeArticles = (count: number, predicate?: (a: ArticleRecord) => boolean): ArticleRecord[] => {
    const picked: ArticleRecord[] = [];
    for (const art of published) {
      if (picked.length >= count) break;
      if (usedIds.has(art.id)) continue;
      if (predicate && !predicate(art)) continue;
      picked.push(art);
      usedIds.add(art.id);
    }
    return picked;
  };

  // 1. ملف الغلاف الرئيسي (صدارة الشأن السوري)
  const leadStory = takeArticles(1, (a) => a.categorySlug === 'syria')[0] || takeArticles(1)[0];

  // 2. تقارير العدد المصورة في العمود الأوسط لواجهة المجلة (مقالان مصوران بارزان)
  const centerMagazineFeatures = takeArticles(
    2,
    (a) => a.categorySlug === 'syria' || a.categorySlug === 'arab-world' || a.categorySlug === 'economy'
  );

  // 3. مرصد المحافظات والمدن السورية (4 تقارير ميدانية وخدمية سورية)
  const syriaPrimary = takeArticles(4, (a) => a.categorySlug === 'syria');
  const syriaMonitorStories =
    syriaPrimary.length >= 4
      ? syriaPrimary
      : [...syriaPrimary, ...takeArticles(4 - syriaPrimary.length, (a) => a.categorySlug === 'economy' || a.categorySlug === 'arab-world')];

  // 4. ملفات خاصة وتحقيقات معمّقة (على خطى زمان الوصل — 3 ملفات استقصائية وتحليلية مصورة)
  const dossierPrimary = takeArticles(
    3,
    (a) => a.categorySlug === 'analysis' || a.type === 'explainer' || a.categorySlug === 'politics' || a.categorySlug === 'economy'
  );
  const specialDossiers =
    dossierPrimary.length >= 3
      ? dossierPrimary
      : [...dossierPrimary, ...takeArticles(3 - dossierPrimary.length)];

  // 5. المشهد العربي والإقليمي وتركيا (شبكة مجلية مصورة من 4 تقارير)
  const arabTurkeyMagazineGrid = takeArticles(
    4,
    (a) => a.categorySlug === 'arab-world' || a.categorySlug === 'economy' || a.categorySlug === 'politics' || a.categorySlug === 'syria'
  );

  // 6. الخط الزمني لآخر الأخبار («نبض الساعة» على طراز تلفزيون سوريا وحلب اليوم — 5 عناوين سريعة)
  const latestTimelineStories = takeArticles(5);

  // 7. بقية التقارير لبوابة الأقسام التخصصية
  const remainingExplorerStories = published.filter((a) => !usedIds.has(a.id));

  const wireTickerArticles = published.slice(0, 6);
  const mostReadStories = [...published].sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 6);

  const [wireIndex, setWireIndex] = useState(0);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [syriaGovFilter, setSyriaGovFilter] = useState<string>('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<'all' | CategorySlug>('all');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);

  useEffect(() => {
    if (tickerPaused || wireTickerArticles.length <= 1) return;
    const id = setInterval(() => {
      setWireIndex((prev) => (prev + 1) % wireTickerArticles.length);
    }, 6000);
    return () => clearInterval(id);
  }, [tickerPaused, wireTickerArticles.length]);

  const activeWireItem = wireTickerArticles[wireIndex % Math.max(1, wireTickerArticles.length)] || leadStory;

  // فلاتر مرصد المحافظات السورية (على غرار حلب اليوم وزمان الوصل)
  const SYRIA_GOVERNORATE_FILTERS: { id: string; label: string; pattern: RegExp | null }[] = [
    { id: 'all', label: 'كل المحافظات السورية', pattern: null },
    { id: 'damascus', label: 'دمشق وريفها', pattern: /(دمشق|عدرا|قاسيون|الغوطة|الفيجة)/ },
    { id: 'aleppo_north', label: 'حلب وإدلب والشمال', pattern: /(حلب|إدلب|الشيخ نجار|باب الهوى|الشمال)/ },
    { id: 'central', label: 'حمص وحماة والوسط', pattern: /(حمص|حماة|حسياء|سهل الغاب|العاصي)/ },
    { id: 'coast', label: 'اللاذقية وطرطوس والمرافئ', pattern: /(اللاذقية|طرطوس|الساحل|المرافئ|مرفأ)/ },
    { id: 'jazira', label: 'الجزيرة والفرات والشرق', pattern: /(الجزيرة|الفرات|دير الزور|الحسكة|الرقة|القمح)/ },
    { id: 'south', label: 'درعا والسويداء والجنوب', pattern: /(درعا|السويداء|حوران|نصيب|القنيطرة)/ },
  ];

  const allSyriaArticles = published.filter((a) => a.categorySlug === 'syria');
  const activeGovRule = SYRIA_GOVERNORATE_FILTERS.find((g) => g.id === syriaGovFilter);
  const filteredSyriaStories =
    !activeGovRule || !activeGovRule.pattern
      ? syriaMonitorStories
      : (() => {
          const matched = allSyriaArticles.filter((a) =>
            activeGovRule.pattern!.test(`${a.headline} ${a.dek} ${a.bodyMd}`)
          );
          return matched.length > 0 ? matched.slice(0, 4) : syriaMonitorStories;
        })();

  const allTabList =
    remainingExplorerStories.length >= 4
      ? remainingExplorerStories
      : published.slice(Math.min(10, Math.max(0, published.length - 6)));
  const evenAllTabList =
    allTabList.length > 2 && allTabList.length % 2 !== 0 ? allTabList.slice(0, -1) : allTabList;

  const filteredDepartmentStories =
    selectedDeptFilter === 'all'
      ? evenAllTabList
      : published.filter((a) => a.categorySlug === selectedDeptFilter).slice(0, 6);

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
          الطبقة 1: شريط البرقيات العاجلة (Live Breaking Ticker — Syria TV / Halab Today Style)
      ==================================================================== */}
      {activeWireItem && (
        <section
          aria-label="شريط البرقيات الإخبارية"
          className="border border-[#0B221C] dark:border-[#D4AF5A]/45 bg-[#0B221C] text-[#FAF9F6] px-4 py-2.5 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="bg-[#9B1C1C] text-white px-2.5 py-1 text-[11px] font-extrabold tracking-wide shrink-0">
              {activeWireItem.type === 'breaking' || activeWireItem.headline.includes('عاجل') ? 'عاجل' : 'نبض الساعة'}
            </span>
            <span className="text-xs text-[#D4AF5A] font-bold shrink-0 hidden sm:inline">
              {activeWireItem.categoryName}
            </span>
            <span aria-hidden="true" className="text-[#D4AF5A]/40 hidden sm:inline">·</span>
            <button
              type="button"
              onClick={() => onOpenArticle(activeWireItem)}
              className="text-xs sm:text-sm font-bold text-white hover:text-[#D4AF5A] truncate text-start transition-colors"
            >
              {activeWireItem.headline}
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-xs">
            <span className="hidden md:inline text-[#D4AF5A] tabular-nums me-2">
              {formatNumerals(wireIndex + 1, siteConfig.numeralSystem)}/{formatNumerals(wireTickerArticles.length, siteConfig.numeralSystem)}
            </span>
            <button
              type="button"
              onClick={() =>
                setWireIndex((prev) => (prev - 1 + wireTickerArticles.length) % wireTickerArticles.length)
              }
              aria-label="الخبر السابق"
              className="p-1 border border-[#D4AF5A]/35 hover:border-[#D4AF5A] text-[#E5DFD3] hover:text-[#D4AF5A] transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTickerPaused((p) => !p)}
              aria-label={tickerPaused ? 'تشغيل شريط الأخبار' : 'إيقاف شريط الأخبار مؤقتًا'}
              className="p-1 border border-[#D4AF5A]/35 hover:border-[#D4AF5A] text-[#E5DFD3] hover:text-[#D4AF5A] transition-colors"
            >
              {tickerPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setWireIndex((prev) => (prev + 1) % wireTickerArticles.length)}
              aria-label="الخبر التالي"
              className="p-1 border border-[#D4AF5A]/35 hover:border-[#D4AF5A] text-[#E5DFD3] hover:text-[#D4AF5A] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* ====================================================================
          الطبقة 2: واجهة المجلة البانورامية الكبرى (Syria TV & Zaman Al-Wasl Magazine Hero: 5 + 4 + 3)
      ==================================================================== */}
      {leadStory && (
        <section aria-label="واجهة المجلة الرئيسية" className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
          {/* الجناح الأيمن (5 أعمدة): قصة غلاف المجلة الكبرى */}
          <article className="lg:col-span-5 bg-white dark:bg-[#111715] border border-[#DED8CC] dark:border-[#1E2824] p-5 flex flex-col justify-between group hover:border-[#9A7125] dark:hover:border-[#D4AF5A] transition-colors">
            <div className="space-y-4">
              <figure className="space-y-2">
                <div className="aspect-[16/10] w-full overflow-hidden bg-[#0B221C] border border-[#DED8CC] dark:border-[#1E2824]">
                  <img
                    src={resolvePublicImageUrl(leadStory.image.url)}
                    alt={leadStory.image.alt}
                    width={1200}
                    height={750}
                    fetchPriority="high"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleArticleImageError(e, leadStory)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                </div>
                <figcaption className="flex items-center justify-between text-[11px] text-[#575B59] dark:text-[#9CA39F]">
                  <span className="truncate">{leadStory.image.caption}</span>
                </figcaption>
              </figure>

              <div className="flex flex-wrap items-center gap-2 text-xs text-[#575B59] dark:text-[#9CA39F]">
                <span className="font-extrabold text-[#9B1C1C] dark:text-[#E05A47]">ملف الغلاف الرئيسي</span>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => onOpenCategory(leadStory.categorySlug)}
                  className="font-bold text-[#0B221C] dark:text-[#D4AF5A] hover:underline"
                >
                  {leadStory.categoryName}
                </button>
                <span aria-hidden="true">·</span>
                <span>{formatArabicDate(leadStory.publishedAt, siteConfig.numeralSystem)}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-[2.1rem] font-bold font-royal leading-[1.3] text-[#141716] dark:text-[#F3F0EA] group-hover:text-[#9B1C1C] dark:group-hover:text-[#D4AF5A] transition-colors">
                <button
                  type="button"
                  onClick={() => onOpenArticle(leadStory)}
                  className="text-start"
                >
                  {leadStory.headline}
                </button>
              </h1>

              <p className="text-sm sm:text-[15px] text-[#575B59] dark:text-[#C5C2BA] leading-relaxed">
                {leadStory.dek}
              </p>

              {/* خلاصة الوقائع المحققة */}
              <div className="border-t border-[#DED8CC] dark:border-[#1E2824] pt-3.5 space-y-2">
                <span className="text-xs font-extrabold text-[#0B221C] dark:text-[#D4AF5A] block">
                  أبرز محاور التقرير الموثق:
                </span>
                <ul className="space-y-1.5 text-xs text-[#141716] dark:text-[#E5DFD3] list-disc ps-4 leading-relaxed">
                  {leadStory.keyPoints.slice(0, 3).map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#DED8CC] dark:border-[#1E2824] flex items-center justify-between text-xs text-[#575B59] dark:text-[#9CA39F]">
              <span className="font-semibold truncate">{leadStory.authorName}</span>
              <button
                type="button"
                onClick={() => onOpenArticle(leadStory)}
                className="inline-flex items-center gap-1.5 font-extrabold text-[#9B1C1C] dark:text-[#D4AF5A] hover:underline shrink-0 ms-2"
              >
                <span>قراءة الملف كاملًا</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>

          {/* الجناح الأوسط (4 أعمدة): تقارير العدد المصورة (Syria TV Magazine Stack) */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-6">
            {centerMagazineFeatures.map((feature) => (
              <article
                key={feature.id}
                className="flex-1 bg-white dark:bg-[#111715] border border-[#DED8CC] dark:border-[#1E2824] p-4 flex flex-col justify-between group hover:border-[#9A7125] dark:hover:border-[#D4AF5A] transition-colors"
              >
                <div className="space-y-3">
                  <div className="aspect-[16/9] w-full overflow-hidden bg-[#0B221C] border border-[#DED8CC] dark:border-[#1E2824]">
                    <img
                      src={resolvePublicImageUrl(feature.image.url)}
                      alt={feature.image.alt}
                      width={800}
                      height={450}
                      loading="eager"
                      referrerPolicy="no-referrer"
                      onError={(e) => handleArticleImageError(e, feature)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#575B59] dark:text-[#9CA39F]">
                    <button
                      type="button"
                      onClick={() => onOpenCategory(feature.categorySlug)}
                      className="font-extrabold text-[#9B1C1C] dark:text-[#D4AF5A] hover:underline"
                    >
                      {feature.categoryName}
                    </button>
                    <span className="tabular-nums">
                      {formatArabicDate(feature.publishedAt, siteConfig.numeralSystem)}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-extrabold font-display leading-snug text-[#141716] dark:text-[#F3F0EA] group-hover:text-[#9A7125] dark:group-hover:text-[#D4AF5A] transition-colors">
                    <button
                      type="button"
                      onClick={() => onOpenArticle(feature)}
                      className="text-start"
                    >
                      {feature.headline}
                    </button>
                  </h2>
                  <p className="text-xs text-[#575B59] dark:text-[#C5C2BA] leading-relaxed line-clamp-2">
                    {feature.dek}
                  </p>
                </div>
                <div className="pt-2.5 mt-3 border-t border-[#DED8CC] dark:border-[#1E2824] flex items-center justify-between text-[11px] text-[#575B59] dark:text-[#9CA39F]">
                  <span className="font-medium truncate">{feature.authorName}</span>
                  <span className="tabular-nums font-bold text-[#0B221C] dark:text-[#D4AF5A]">
                    {formatNumerals(feature.sources.length, siteConfig.numeralSystem)} مصادر
                  </span>
                </div>
              </article>
            ))}
          </div>

          {/* الجناح الأيسر (3 أعمدة): نبض الساعة — آخر الأخبار (Halab Today / Syria TV Live Timeline) */}
          <aside className="lg:col-span-3 bg-white dark:bg-[#111715] border border-[#DED8CC] dark:border-[#1E2824] p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b-2 border-[#9B1C1C] dark:border-[#D4AF5A] pb-2.5 flex items-center justify-between">
                <h2 className="text-base font-extrabold font-display text-[#141716] dark:text-[#F3F0EA]">
                  نبض الساعة · آخر الأخبار
                </h2>
                <span className="text-[11px] font-bold text-[#9B1C1C] dark:text-[#D4AF5A] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>محدّث</span>
                </span>
              </div>

              <div className="divide-y divide-[#DED8CC] dark:divide-[#1E2824]">
                {latestTimelineStories.map((wireItem) => (
                  <article key={wireItem.id} className="py-3.5 first:pt-1 last:pb-1 group space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#575B59] dark:text-[#9CA39F]">
                      <button
                        type="button"
                        onClick={() => onOpenCategory(wireItem.categorySlug)}
                        className="font-bold text-[#0B221C] dark:text-[#D4AF5A] hover:underline"
                      >
                        {wireItem.categoryName}
                      </button>
                      <span className="tabular-nums text-[10px]">
                        {formatArabicDate(wireItem.publishedAt, siteConfig.numeralSystem)}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold font-display leading-snug text-[#141716] dark:text-[#F3F0EA] group-hover:text-[#9B1C1C] dark:group-hover:text-[#D4AF5A] transition-colors">
                      <button
                        type="button"
                        onClick={() => onOpenArticle(wireItem)}
                        className="text-start"
                      >
                        {wireItem.headline}
                      </button>
                    </h3>
                  </article>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenCategory('syria')}
              className="mt-4 pt-3 border-t border-[#DED8CC] dark:border-[#1E2824] text-xs font-extrabold text-[#0B221C] dark:text-[#D4AF5A] hover:underline flex items-center justify-between w-full"
            >
              <span>استعراض جميع أخبار اليوم</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </aside>
        </section>
      )}

      {/* ====================================================================
          الطبقة 3: مرصد المحافظات والمدن السورية (Halab Today & Zaman Al-Wasl Governorate Monitor)
      ==================================================================== */}
      {filteredSyriaStories.length > 0 && (
        <section
          aria-label="مرصد المحافظات والمدن السورية"
          className="border-t-2 border-b border-[#0B221C] dark:border-[#D4AF5A]/60 bg-[#EFECE4]/80 dark:bg-[#111715] py-8 px-5 sm:px-7 space-y-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-[#DED8CC] dark:border-[#1E2824]">
            <div>
              <span className="text-xs font-extrabold text-[#9B1C1C] dark:text-[#D4AF5A]">
                الأولوية التحريرية الأولى (50%) · شبكة مراسلي المحافظات والملف الخدمي والمعيشي
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-royal text-[#141716] dark:text-[#F3F0EA] mt-1">
                ميدان سوريا · مرصد المحافظات والاقتصاد والإعمار
              </h2>
            </div>

            {/* أزرار التصفية التفاعلية حسب المحافظات والأقاليم السورية */}
            <div className="flex flex-wrap items-center gap-1.5">
              {SYRIA_GOVERNORATE_FILTERS.map((gov) => (
                <button
                  key={gov.id}
                  type="button"
                  onClick={() => setSyriaGovFilter(gov.id)}
                  className={`px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    syriaGovFilter === gov.id
                      ? 'bg-[#0B221C] text-[#FAF9F6] dark:bg-[#D4AF5A] dark:text-[#090D0C]'
                      : 'bg-white dark:bg-[#090D0C] text-[#3D423F] dark:text-[#C5C2BA] border border-[#DED8CC] dark:border-[#1E2824] hover:border-[#9A7125]'
                  }`}
                >
                  {gov.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* التقرير السوري الميداني الرئيسي */}
            {filteredSyriaStories[0] && (
              <article className="lg:col-span-5 bg-white dark:bg-[#090D0C] border border-[#DED8CC] dark:border-[#1E2824] p-5 flex flex-col justify-between group hover:border-[#9A7125] dark:hover:border-[#D4AF5A] transition-colors">
                <div>
                  <div className="aspect-[16/10] w-full overflow-hidden bg-[#0B221C] mb-4 border border-[#DED8CC] dark:border-[#1E2824]">
                    <img
                      src={resolvePublicImageUrl(filteredSyriaStories[0].image.url)}
                      alt={filteredSyriaStories[0].image.alt}
                      width={1000}
                      height={625}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => handleArticleImageError(e, filteredSyriaStories[0])}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#575B59] dark:text-[#9CA39F] mb-2">
                    <span className="font-extrabold text-[#9B1C1C] dark:text-[#E05A47]">تقرير ميداني خاص</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-bold text-[#0B221C] dark:text-[#D4AF5A]">
                      {filteredSyriaStories[0].categoryName}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{formatArabicDate(filteredSyriaStories[0].publishedAt, siteConfig.numeralSystem)}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-royal leading-snug text-[#141716] dark:text-[#F3F0EA] mb-2.5 group-hover:text-[#9A7125] dark:group-hover:text-[#D4AF5A] transition-colors">
                    <button
                      type="button"
                      onClick={() => onOpenArticle(filteredSyriaStories[0])}
                      className="text-start"
                    >
                      {filteredSyriaStories[0].headline}
                    </button>
                  </h3>
                  <p className="text-sm text-[#575B59] dark:text-[#C5C2BA] leading-relaxed mb-4">
                    {filteredSyriaStories[0].dek}
                  </p>
                </div>
                <div className="pt-3 mt-4 border-t border-[#DED8CC] dark:border-[#1E2824] flex items-center justify-between text-xs text-[#575B59] dark:text-[#9CA39F]">
                  <span className="font-medium">{filteredSyriaStories[0].authorName}</span>
                  <button
                    type="button"
                    onClick={() => onOpenArticle(filteredSyriaStories[0])}
                    className="inline-flex items-center gap-1 font-bold text-[#0B221C] dark:text-[#D4AF5A] hover:underline"
                  >
                    <span>التفاصيل الكاملة</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            )}

            {/* 3 تقارير سورية ميدانية مصورة على اليسار */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-4">
              {filteredSyriaStories.slice(1, 4).map((story) => (
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
          الطبقة 4: ملفات خاصة وتحقيقات معمّقة (Zaman Al-Wasl Investigative Magazine Spread)
      ==================================================================== */}
      {specialDossiers.length > 0 && (
        <section
          aria-label="ملفات خاصة وتحقيقات معمقة"
          className="bg-[#0B221C] text-[#FAF9F6] border border-[#9A7125]/50 p-6 sm:p-8 space-y-6"
        >
          <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-[#D4AF5A]/30">
            <div>
              <span className="text-xs font-extrabold text-[#D4AF5A]">
                صحافة المعمّق والاستقصاء · ماذا حدث ولماذا يهم؟
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-royal text-white mt-1">
                ملفات خاصة وقراءات استراتيجية
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onOpenCategory('analysis')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF5A] hover:underline whitespace-nowrap shrink-0"
            >
              <span>جميع الملفات والتحليلات</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specialDossiers.map((dossier, idx) => (
              <article
                key={dossier.id}
                className="bg-[#071612] border border-[#D4AF5A]/30 p-5 flex flex-col justify-between group hover:border-[#D4AF5A] transition-colors"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#D4AF5A]">
                      ملف 0{formatNumerals(idx + 1, siteConfig.numeralSystem)}
                    </span>
                    <span className="text-[#E5DFD3]/80">{dossier.categoryName}</span>
                  </div>
                  <div className="aspect-[16/10] w-full overflow-hidden bg-[#0B221C] border border-[#D4AF5A]/20">
                    <img
                      src={resolvePublicImageUrl(dossier.image.url)}
                      alt={dossier.image.alt}
                      width={800}
                      height={500}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => handleArticleImageError(e, dossier)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <h3 className="text-lg font-bold font-royal leading-snug text-white group-hover:text-[#D4AF5A] transition-colors">
                    <button
                      type="button"
                      onClick={() => onOpenArticle(dossier)}
                      className="text-start"
                    >
                      {dossier.headline}
                    </button>
                  </h3>
                  <p className="text-xs text-[#E5DFD3]/85 leading-relaxed line-clamp-3">
                    {dossier.dek}
                  </p>
                </div>
                <div className="pt-3 mt-4 border-t border-[#D4AF5A]/20 flex items-center justify-between text-[11px] text-[#E5DFD3]/80">
                  <span className="truncate">{dossier.authorName}</span>
                  <span className="text-[#D4AF5A] font-bold shrink-0 ms-2">
                    {formatNumerals(dossier.readingTimeMin, siteConfig.numeralSystem)} د قراءة
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ====================================================================
          الطبقة 5: المشهد العربي والإقليمي وتركيا (4-Column Visual Magazine Grid — 40%)
      ==================================================================== */}
      {arabTurkeyMagazineGrid.length > 0 && (
        <section aria-label="المشهد العربي والإقليمي وتركيا" className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4 pb-3 border-b-2 border-[#0B221C] dark:border-[#D4AF5A]">
            <div>
              <span className="text-xs font-extrabold text-[#9A7125] dark:text-[#D4AF5A]">
                التغطية الإقليمية (40%) · أنقرة والرياض والدوحة والقاهرة وعمّان وبغداد والمغرب العربي
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-royal text-[#141716] dark:text-[#F3F0EA] mt-0.5">
                المشهد العربي والإقليمي وتركيا
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onOpenCategory('arab-world')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B221C] dark:text-[#D4AF5A] hover:underline whitespace-nowrap shrink-0"
            >
              <span>أرشيف العالم العربي وتركيا</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {arabTurkeyMagazineGrid.map((art) => (
              <EditorialCard
                key={art.id}
                article={art}
                size="medium"
                numeralSystem={siteConfig.numeralSystem}
                onOpenArticle={onOpenArticle}
                onOpenCategory={onOpenCategory}
              />
            ))}
          </div>
        </section>
      )}

      {/* ====================================================================
          الطبقة 6: بوابة الأقسام التخصصية (8 أعمدة) + جناح «الأكثر قراءة وتداولًا» (4 أعمدة)
      ==================================================================== */}
      <section aria-label="تغطيات الأقسام والملفات المختارة" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="border-b-2 border-[#0B221C] dark:border-[#D4AF5A] pb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold font-royal text-[#141716] dark:text-[#F3F0EA]">
              أبواب المجلة التخصصية
            </h2>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedDeptFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  selectedDeptFilter === 'all'
                    ? 'bg-[#0B221C] text-[#FAF9F6] dark:bg-[#D4AF5A] dark:text-[#090D0C]'
                    : 'bg-[#EFECE4] dark:bg-[#111715] text-[#575B59] dark:text-[#C5C2BA] hover:text-[#9A7125]'
                }`}
              >
                جميع الأبواب
              </button>
              {EDITORIAL_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setSelectedDeptFilter(sec.slug)}
                  className={`px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    selectedDeptFilter === sec.slug
                      ? 'bg-[#0B221C] text-[#FAF9F6] dark:bg-[#D4AF5A] dark:text-[#090D0C]'
                      : 'bg-[#EFECE4] dark:bg-[#111715] text-[#575B59] dark:text-[#C5C2BA] hover:text-[#9A7125]'
                  }`}
                >
                  {sec.name}
                </button>
              ))}
            </div>
          </div>

          {filteredDepartmentStories.length === 0 ? (
            <div className="border border-[#DED8CC] dark:border-[#1E2824] bg-white dark:bg-[#111715] p-8 text-center text-sm text-[#575B59] dark:text-[#9CA39F]">
              لا توجد تقارير إضافية في هذا الباب حاليًا.
            </div>
          ) : (
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
          )}
        </div>

        {/* الجناح الجانبي للمجلة (4 أعمدة): الأكثر قراءة وتداولًا */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="border border-[#DED8CC] dark:border-[#1E2824] bg-white dark:bg-[#111715] p-5">
            <div className="flex items-center justify-between pb-3 mb-2 border-b-2 border-[#9B1C1C] dark:border-[#D4AF5A]">
              <h2 className="text-lg font-bold font-royal text-[#141716] dark:text-[#F3F0EA]">
                الأكثر قراءة وتداولًا
              </h2>
              <span className="text-xs text-[#9B1C1C] dark:text-[#D4AF5A] font-bold">ترتيب القراء</span>
            </div>
            <div className="divide-y divide-[#DED8CC] dark:divide-[#1E2824]">
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
        </aside>
      </section>

      {/* وحدة إعلانية متكاملة */}
      <AdSlot
        slotId="home-mid-leaderboard"
        format="horizontal"
        siteConfig={siteConfig}
        consentGranted={consentGranted}
      />

      {/* ====================================================================
          الطبقة 7: دعوة الاشتراك في النشرة البريدية اليومية
      ==================================================================== */}
      <section
        aria-label="الاشتراك في النشرة البريدية"
        className="border border-[#9A7125]/50 bg-[#0B221C] text-[#FAF9F6] p-8"
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#D4AF5A]">نشرة «موجز ميزان الخبر» المسائية · مجانًا</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-royal">
              اشترك في الملخص اليومي للتقارير السورية والعربية الموثقة
            </h2>
            <p className="text-xs text-[#E5DFD3]/90 leading-relaxed max-w-2xl">
              رسالة واحدة مساء كل يوم تلخص أهم الأخبار السورية والعربية والاقتصادية والتحقيقات الخاصة تحت إشراف رئيس التحرير المسؤول ({siteConfig.editorInChiefName}).
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
              className="px-3.5 py-2.5 text-xs bg-[#061410] border border-[#D4AF5A]/50 text-white placeholder:text-slate-400 focus:outline-none focus:border-[#D4AF5A] min-w-[240px]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-extrabold bg-[#D4AF5A] text-[#0B221C] hover:opacity-95 transition-opacity whitespace-nowrap shrink-0"
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
          className="h-full bg-[#9A7125] dark:bg-[#D4AF5A] transition-transform duration-150 origin-right"
          style={{ transform: `scaleX(${scrollProgress / 100})` }}
        />
      </div>

      {/* مسار التنقل */}
      <nav aria-label="مسار الصفحة" className="flex items-center gap-2 text-xs text-[#5A5D5B] dark:text-[#9CA39F] mb-6">
        <button type="button" onClick={() => onOpenCategory(article.categorySlug)} className="hover:text-[#9A7125]">
          الرئيسية
        </button>
        <span aria-hidden="true">/</span>
        <button
          type="button"
          onClick={() => onOpenCategory(article.categorySlug)}
          className="font-semibold text-[#9A7125] dark:text-[#D4AF5A] hover:underline"
        >
          {article.categoryName}
        </button>
        <span aria-hidden="true">/</span>
        <span className="truncate max-w-xs sm:max-w-md text-[#111312] dark:text-slate-300">{article.headline}</span>
      </nav>

      {/* ترويسة المقال */}
      <header className="mb-8 border-b border-[#E2DDD3] dark:border-[#1F2724] pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#5A5D5B] dark:text-[#9CA39F] mb-3">
          {article.type === 'breaking' && (
            <>
              <span className="font-bold text-[#9B1C1C] dark:text-[#E05252]">عاجل</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span className="font-bold text-[#9A7125] dark:text-[#D4AF5A]">{article.categoryName}</span>
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

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-royal leading-tight text-[#111312] dark:text-[#F3F0EA] mb-4">
          {article.headline}
        </h1>

        <p className="text-base sm:text-lg text-[#5A5D5B] dark:text-[#C5C2BA] leading-relaxed mb-6">
          {article.dek}
        </p>

        {/* سطر الكاتب والتاريخين وزمن القراءة والمشاركة النظيفة */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#E2DDD3] dark:border-[#1F2724] text-xs text-[#5A5D5B] dark:text-[#9CA39F]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenAuthor}
              className="font-bold text-[#111312] dark:text-[#F3F0EA] hover:text-[#9A7125] underline decoration-[#9A7125]/50 underline-offset-4"
            >
              {article.authorName}
            </button>
            <span aria-hidden="true">·</span>
            <span>نُشر: {formatArabicDate(article.publishedAt, siteConfig.numeralSystem)}</span>
            {article.updatedAt !== article.publishedAt && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#9A7125] dark:text-[#D4AF5A]">
                  آخر تحديث: {formatArabicDate(article.updatedAt, siteConfig.numeralSystem)}
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Clock className="w-3.5 h-3.5 text-[#9A7125] dark:text-[#D4AF5A]" />
              {formatNumerals(article.readingTimeMin, siteConfig.numeralSystem)} دقائق قراءة ({formatNumerals(article.wordCount, siteConfig.numeralSystem)} كلمة)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E2DDD3] dark:border-[#1F2724] hover:border-[#9A7125] text-[#111312] dark:text-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              <Share2 className="w-3.5 h-3.5 text-[#9A7125] dark:text-[#D4AF5A]" />
              <span>{shareCopied ? 'تم نسخ الرابط' : 'مشاركة الرابط'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* الصورة الرئيسية (1200x675) */}
      <figure className="mb-8 border border-[#E2DDD3] dark:border-[#1F2724] bg-white dark:bg-[#111614]">
        <div className="aspect-[16/9] w-full overflow-hidden bg-[#0F2922]">
          <img
            src={resolvePublicImageUrl(article.image.url)}
            alt={article.image.alt}
            width={1200}
            height={675}
            fetchPriority="high"
            referrerPolicy="no-referrer"
            onError={(e) => handleArticleImageError(e, article)}
            className="w-full h-full object-cover"
          />
        </div>
        <figcaption className="px-4 py-2.5 text-xs text-[#5A5D5B] dark:text-[#9CA39F] flex flex-wrap items-center justify-between gap-2">
          <span>{article.image.caption}</span>
          <span className="font-mono text-[11px] text-[#9A7125] dark:text-[#D4AF5A]">
            {article.image.credit}
          </span>
        </figcaption>
      </figure>

      {/* تخطيط القراءة ذو العمودين (70% نص المقال / 30% مصادر وتوثيق) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-8">
          {article.keyPoints.length > 0 && (
            <section
              aria-label="أبرز النقاط"
              className="border border-[#E2DDD3] dark:border-[#1F2724] bg-[#F2EFE9]/75 dark:bg-[#111614] p-5"
            >
              <h2 className="text-sm font-bold font-display text-[#111312] dark:text-[#F3F0EA] mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#9A7125] dark:text-[#D4AF5A]" />
                <span>أبرز ما جاء في التقرير</span>
              </h2>
              <ul className="space-y-2 text-sm text-[#111312] dark:text-slate-200 list-disc ps-5 leading-relaxed">
                {article.keyPoints.map((pt, idx) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>
            </section>
          )}

          <div
            className="font-editorial article-prose text-[#111312] dark:text-[#F3F0EA] max-w-prose"
            dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
          />

          <AdSlot
            slotId="article-inline-1"
            format="in-article"
            siteConfig={siteConfig}
            sensitivityLevel={article.sensitivityLevel}
            consentGranted={consentGranted}
          />

          {article.backgroundSection && (
            <section
              aria-label="خلفية الخبر والسياق"
              className="border border-[#E2DDD3] dark:border-[#1F2724] bg-white dark:bg-[#111614] p-5"
            >
              <h2 className="text-base font-bold font-display text-[#111312] dark:text-[#F3F0EA] mb-2">
                الخلفية والسياق
              </h2>
              <p className="text-sm text-[#5A5D5B] dark:text-slate-300 leading-relaxed">
                {article.backgroundSection}
              </p>
            </section>
          )}

          {article.analysisSection && (
            <section
              aria-label="قراءة تحليلية"
              className="border border-[#9A7125]/45 bg-[#F2EFE9]/80 dark:bg-[#111614] p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold font-display text-[#111312] dark:text-[#F3F0EA]">
                  ماذا يعني ذلك؟
                </h2>
                <span className="text-xs font-semibold text-[#9A7125] dark:text-[#D4AF5A]">
                  قراءة تحليلية (مفصولة عن الخبر)
                </span>
              </div>
              <p className="text-sm text-[#5A5D5B] dark:text-slate-300 leading-relaxed">
                {article.analysisSection}
              </p>
            </section>
          )}

          {article.whatNextSection && (
            <section
              aria-label="المسار المتوقع"
              className="border border-[#E2DDD3] dark:border-[#1F2724] bg-white dark:bg-[#111614] p-5"
            >
              <h2 className="text-base font-bold font-display text-[#111312] dark:text-[#F3F0EA] mb-2">
                ما التالي؟ (المسار المتوقع)
              </h2>
              <p className="text-sm text-[#5A5D5B] dark:text-slate-300 leading-relaxed">
                {article.whatNextSection}
              </p>
            </section>
          )}

          {article.corrections.length > 0 && (
            <section
              aria-label="تصحيحات وتوضيحات علنية"
              className="border border-[#9A7125] bg-[#9A7125]/10 p-5 space-y-2"
            >
              <h2 className="text-sm font-bold font-display text-[#111312] dark:text-[#F3F0EA] flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#9A7125] dark:text-[#D4AF5A]" />
                <span>سجل التصحيحات والتوضيحات العلنية على هذا المقال</span>
              </h2>
              {article.corrections.map((c) => (
                <div key={c.id} className="text-xs text-[#111312] dark:text-slate-200 leading-relaxed">
                  <p>{c.text}</p>
                  <p className="text-[11px] text-[#5A5D5B] dark:text-[#9CA39F] mt-1">
                    {formatArabicDate(c.publishedAt, siteConfig.numeralSystem)}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* ملاحظة المنهجية التحريرية وتوثيق المصادر */}
          <section
            aria-label="المعايير التحريرية والمرجعيات"
            className="border border-[#E2DDD3] dark:border-[#1F2724] bg-[#F2EFE9]/90 dark:bg-[#111614] p-5 text-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#111312] dark:text-[#F3F0EA] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#9A7125] dark:text-[#D4AF5A]" />
                <span>المعايير التحريرية وتوثيق المصادر</span>
              </span>
              <button
                type="button"
                onClick={() => onOpenLegal('editorial-policy')}
                className="underline text-[#9A7125] dark:text-[#D4AF5A] hover:text-[#111312] dark:hover:text-white font-semibold"
              >
                السياسة التحريرية والمعايير المهنية
              </button>
            </div>
            <p className="text-[#5A5D5B] dark:text-slate-300 leading-relaxed">{disclosureText}</p>
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#E2DDD3] dark:border-[#1F2724]">
              <span className="text-[#5A5D5B] dark:text-[#9CA39F]">
                رئيس التحرير المسؤول: {siteConfig.editorInChiefName} · المراقب اللغوي (كلمةً كلمةً): د. عبد الرحمن الحموي · مطابقة العنوان والمحتوى: د. حسام الشامي
              </span>
              <button
                type="button"
                onClick={() => setShowCorrectionForm((s) => !s)}
                className="underline text-[#111312] dark:text-slate-300 hover:text-[#9A7125]"
              >
                الإبلاغ عن ملاحظة أو تصويب تحريري
              </button>
            </div>

            {showCorrectionForm && (
              <form onSubmit={handleCorrectionReport} className="pt-3 space-y-2 border-t border-[#E2DDD3] dark:border-[#1F2724]">
                <label htmlFor="correction-note" className="block font-semibold">
                  ملاحظتك أو التصويب المقترح (مع ذكر المصدر المرجعي):
                </label>
                <textarea
                  id="correction-note"
                  required
                  rows={2}
                  value={correctionNote}
                  onChange={(e) => setCorrectionNote(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-[#0A0D0C] border border-[#E2DDD3] dark:border-[#1F2724]"
                  placeholder="اذكر المعلومة أو الرقم الذي يحتاج إلى مراجعة..."
                />
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="email"
                    value={correctionEmail}
                    onChange={(e) => setCorrectionEmail(e.target.value)}
                    placeholder="بريدك الإلكتروني (اختياري للمتابعة)"
                    className="px-2.5 py-1.5 bg-white dark:bg-[#0A0D0C] border border-[#E2DDD3] dark:border-[#1F2724]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#0F2922] text-[#FAF9F6] dark:bg-[#D4AF5A] dark:text-[#0A0D0C] font-semibold"
                  >
                    إرسال لهيئة التحرير
                  </button>
                </div>
                {correctionSubmitted && (
                  <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                    شكرًا لك؛ تم تسجيل الملاحظة وإحالتها إلى هيئة التحرير للمراجعة.
                  </p>
                )}
              </form>
            )}
          </section>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="text-[#5A5D5B] dark:text-[#9CA39F] font-semibold">الموضوعات والوسوم:</span>
            {article.tags.map((tagName, idx) => {
              const matchedTag = tags.find((t) => t.name === tagName);
              const slug = matchedTag ? matchedTag.slug : tagName;
              return (
                <React.Fragment key={tagName}>
                  {idx > 0 && <span aria-hidden="true" className="text-slate-400">·</span>}
                  <button
                    type="button"
                    onClick={() => onOpenTag(slug)}
                    className="text-[#111312] dark:text-slate-200 hover:text-[#9A7125] underline decoration-[#E2DDD3] underline-offset-4"
                  >
                    {tagName}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <section
            aria-label="المصادر الرسمية المسندة"
            className="border border-[#E2DDD3] dark:border-[#1F2724] bg-white dark:bg-[#111614] p-5"
          >
            <h2 className="text-sm font-bold font-display text-[#111312] dark:text-[#F3F0EA] pb-3 mb-3 border-b border-[#E2DDD3] dark:border-[#1F2724] flex items-center justify-between">
              <span>المصادر الأولية المعتمدة</span>
              <span className="font-mono text-xs text-[#9A7125] dark:text-[#D4AF5A]">
                {formatNumerals(article.sources.length, siteConfig.numeralSystem)} مصادر
              </span>
            </h2>
            <ul className="space-y-3 text-xs">
              {article.sources.map((src, idx) => (
                <li
                  key={idx}
                  className="pb-3 border-b border-[#E2DDD3]/60 dark:border-[#1F2724] last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#5A5D5B] dark:text-[#9CA39F] mb-1">
                    <span className="font-semibold text-[#9A7125] dark:text-[#D4AF5A]">
                      المستوى {formatNumerals(src.tier, siteConfig.numeralSystem)} ({src.role === 'official' ? 'مصدر رسمي أولي' : 'مصدر مستقل'})
                    </span>
                  </div>
                  <p className="font-bold text-[#111312] dark:text-slate-200 mb-1">{src.publisher}</p>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#5A5D5B] dark:text-slate-300 hover:text-[#9A7125] underline"
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
              className="border border-[#E2DDD3] dark:border-[#1F2724] bg-[#F2EFE9]/60 dark:bg-[#111614] p-5"
            >
              <h2 className="text-sm font-bold font-display text-[#111312] dark:text-[#F3F0EA] pb-2.5 mb-3 border-b border-[#E2DDD3] dark:border-[#1F2724]">
                تغطيات ذات صلة في «{article.categoryName}»
              </h2>
              <ul className="space-y-3 text-xs">
                {relatedArticles.map((rel) => (
                  <li
                    key={rel.id}
                    className="pb-2.5 border-b border-[#E2DDD3]/60 dark:border-[#1F2724] last:border-b-0 last:pb-0"
                  >
                    <button
                      type="button"
                      onClick={() => onOpenArticle(rel)}
                      className="text-start font-bold text-[#111312] dark:text-slate-200 hover:text-[#9A7125] leading-snug"
                    >
                      {rel.headline}
                    </button>
                    <p className="text-[11px] text-[#5A5D5B] dark:text-[#9CA39F] mt-1">
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

      <nav
        aria-label="التنقل بين المقالات"
        className="mt-12 pt-6 border-t border-[#E2DDD3] dark:border-[#1F2724] grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {prevArticle ? (
          <button
            type="button"
            onClick={() => onOpenArticle(prevArticle)}
            className="p-4 border border-[#E2DDD3] dark:border-[#1F2724] bg-white dark:bg-[#111614] text-start hover:border-[#9A7125] transition-colors"
          >
            <span className="text-xs text-[#5A5D5B] dark:text-[#9CA39F] flex items-center gap-1 mb-1">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>التقرير السابق</span>
            </span>
            <p className="text-sm font-bold font-display text-[#111312] dark:text-[#F3F0EA] line-clamp-2">
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
            className="p-4 border border-[#E2DDD3] dark:border-[#1F2724] bg-white dark:bg-[#111614] text-start hover:border-[#9A7125] transition-colors"
          >
            <span className="text-xs text-[#5A5D5B] dark:text-[#9CA39F] flex items-center justify-end gap-1 mb-1">
              <span>التقرير التالي</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
            <p className="text-sm font-bold font-display text-[#111312] dark:text-[#F3F0EA] line-clamp-2">
              {nextArticle.headline}
            </p>
          </button>
        )}
      </nav>

      {relatedArticles.length > 0 && (
        <section aria-label="تقارير ذات صلة" className="mt-12 pt-8 border-t border-[#E2DDD3] dark:border-[#1F2724]">
          <h2 className="text-xl font-bold font-display text-[#111312] dark:text-[#F3F0EA] mb-6">
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
      <header className="border-b-2 border-[#111312] dark:border-[#D4AF5A] pb-6">
        <span className="text-xs font-bold text-[#9A7125] dark:text-[#D4AF5A]">قسم تحريري متخصص</span>
        <h1 className="text-3xl sm:text-4xl font-bold font-royal text-[#111312] dark:text-[#F3F0EA] mt-1">
          {section.name}
        </h1>
        <p className="text-sm text-[#5A5D5B] dark:text-[#9CA39F] mt-2 max-w-2xl">
          {section.description}
        </p>
      </header>

      {pagedArticles.length === 0 ? (
        <div className="border border-[#E2DDD3] dark:border-[#1F2724] p-8 text-center text-sm text-[#5A5D5B] dark:text-[#9CA39F]">
          لا توجد تقارير منشورة في هذا القسم حاليًا.
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

      <nav aria-label="ترقيم صفحات القسم" className="flex items-center justify-between pt-6 border-t border-[#E2DDD3] dark:border-[#1F2724] text-xs">
        <span className="text-[#5A5D5B] dark:text-[#9CA39F] tabular-nums">
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
                  ? 'bg-[#0F2922] text-[#FAF9F6] dark:bg-[#D4AF5A] dark:text-[#0A0D0C] border-transparent font-bold'
                  : 'border-[#E2DDD3] dark:border-[#1F2724] text-[#111312] dark:text-slate-300'
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
      <header className="border-b-2 border-[#111312] dark:border-[#D4AF5A] pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#5A5D5B] dark:text-[#9CA39F] mb-2">
          <span>أرشيف الموضوعات والوسوم الموثقة</span>
          <span aria-hidden="true">·</span>
          <span>
            إجمالي التقارير المرتبطة: {formatNumerals(count, numeralSystem)} تقارير
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-royal text-[#111312] dark:text-[#F3F0EA]">
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
      <header className="border-b-2 border-[#111312] dark:border-[#D4AF5A] pb-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-[#5A5D5B] dark:text-[#9CA39F]">
          <span>البحث الفوري في الأرشيف الموثق</span>
          <span>إجمالي النتائج المطابقة: {formatNumerals(results.length, numeralSystem)}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-royal text-[#111312] dark:text-[#F3F0EA]">
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
            className="w-full px-4 py-2.5 text-sm bg-white dark:bg-[#111614] border border-[#E2DDD3] dark:border-[#1F2724] text-[#111312] dark:text-[#F3F0EA]"
          />
        </div>
      </header>

      {results.length === 0 ? (
        <div className="border border-[#E2DDD3] dark:border-[#1F2724] p-8 text-center text-sm text-[#5A5D5B] dark:text-[#9CA39F]">
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
      <header className="border-b-2 border-[#111312] dark:border-[#D4AF5A] pb-6">
        <span className="text-xs font-bold text-[#9A7125] dark:text-[#D4AF5A]">الشفافية والمساءلة التحريرية</span>
        <h1 className="text-3xl font-bold font-royal text-[#111312] dark:text-[#F3F0EA] mt-1">
          سجل التصحيحات والتوضيحات العلني
        </h1>
        <p className="text-sm text-[#5A5D5B] dark:text-[#9CA39F] mt-2">
          تلتزم «ميزان الخبر» بنشر أي تصويب أو تحديث جوهري يطرأ على الأرقام أو الوقائع بشفافية كاملة تحت إشراف هيئة التحرير المسؤولة.
        </p>
      </header>

      <div className="space-y-4">
        {allCorrections.map((item) => (
          <div
            key={item.id}
            className="border border-[#E2DDD3] dark:border-[#1F2724] bg-white dark:bg-[#111614] p-5 space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between text-xs text-[#5A5D5B] dark:text-[#9CA39F]">
              <span>تاريخ التصويب: {formatArabicDate(item.publishedAt, numeralSystem)}</span>
            </div>
            <h2 className="text-base font-bold font-display text-[#111312] dark:text-[#F3F0EA]">
              <button
                type="button"
                onClick={() => onOpenArticle(item.articleRef)}
                className="hover:text-[#9A7125] text-start underline"
              >
                {item.articleHeadline}
              </button>
            </h2>
            <p className="text-sm text-[#5A5D5B] dark:text-slate-300 leading-relaxed">
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
  const layoutDirector = authors.find((a) => a.id === 'layout-director-mazen');
  const alignmentInspector = authors.find((a) => a.id === 'alignment-inspector-hussam');
  const wordMonitor = authors.find((a) => a.id === 'word-monitor-abdulrahman');
  const proofreader = authors.find((a) => a.id === 'proofreader-allam');
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
      <header className="border-b-2 border-[#0B221C] dark:border-[#D4AF5A] pb-6">
        <span className="text-xs font-bold text-[#9A7125] dark:text-[#D4AF5A]">
          المسؤولية التحريرية والإخراج الفني ومراقبة المقالات كلمةً كلمةً · كادر من 100 صحفي ومراسل متخصص
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-royal text-[#141716] dark:text-[#F3F0EA] mt-1">
          هيئة التحرير والإخراج الفني والكادر الصحفي
        </h1>
        <p className="text-sm text-[#575B59] dark:text-[#9CA39F] mt-2 leading-relaxed">
          تعمل غرفة أخبار «{siteConfig.siteName}» تحت الإشراف المباشر لرئيس التحرير المسؤول ({siteConfig.editorInChiefName})، وبإشراف وحدة الإخراج الفني والتنسيق المجلي، ووحدة تتبع المقالات كلمةً كلمةً وفحص سلامة الجمل والمعنى، ووحدة فحص مطابقة العناوين والمحتوى والصور، مع كادر يضم 100 صحفي ومراسل موزعين وفق الأولوية التحريرية: 50 صحفيًا للشأن السوري (50%)، و40 صحفيًا للعالم العربي وتركيا (40%)، و10 محررين للأقسام التخصصية والدولية (10%).
        </p>
      </header>

      {/* بطاقة القيادة التحريرية العليا */}
      <section className="border border-[#DED8CC] dark:border-[#1E2824] bg-white dark:bg-[#111715] p-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-[#9A7125] dark:text-[#D4AF5A]">القيادة التحريرية العليا</span>
          <span className="px-2.5 py-1 bg-[#0B221C] text-[#D4AF5A] text-xs font-bold">
            المدير العام ورئيس التحرير
          </span>
        </div>
        <h2 className="text-2xl font-bold font-royal text-[#141716] dark:text-[#F3F0EA]">
          {chiefEditor?.name || siteConfig.editorInChiefName}
        </h2>
        <p className="text-sm text-[#575B59] dark:text-slate-300 leading-relaxed max-w-4xl">
          {chiefEditor?.bio || siteConfig.editorBio}
        </p>
        <div className="pt-3 border-t border-[#DED8CC] dark:border-[#1E2824] text-xs text-[#575B59] dark:text-[#9CA39F] flex flex-wrap items-center justify-between gap-2">
          <span>المؤسسة الناشرة: {siteConfig.publisherLegalName}</span>
          <a href={`mailto:${siteConfig.contactEmail}`} className="font-mono text-[#9A7125] dark:text-[#D4AF5A] underline">
            {siteConfig.contactEmail}
          </a>
        </div>
      </section>

      {/* وحدات الإخراج المجلي وتتبع الكلمات وفحص مطابقة العناوين والمحتوى */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {wordMonitor && (
          <div className="border-2 border-[#0B221C] dark:border-[#D4AF5A] bg-white dark:bg-[#111715] p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#9B1C1C] dark:text-[#D4AF5A]">
                وحدة تتبع المقالات كلمةً كلمةً وفحص الجمل والمعنى
              </span>
              <span className="text-xs font-bold text-[#0B221C] dark:text-[#D4AF5A]">رقابة لغوية صارمة</span>
            </div>
            <h3 className="text-xl font-bold font-royal text-[#141716] dark:text-[#F3F0EA]">
              {wordMonitor.name} — {wordMonitor.roleTitle}
            </h3>
            <p className="text-xs text-[#575B59] dark:text-slate-300 leading-relaxed">
              {wordMonitor.bio}
            </p>
            <p className="pt-2 border-t border-[#DED8CC] dark:border-[#1E2824] text-[11px] text-[#575B59] dark:text-[#9CA39F]">
              {wordMonitor.credentials}
            </p>
          </div>
        )}

        {alignmentInspector && (
          <div className="border border-[#DED8CC] dark:border-[#1E2824] bg-white dark:bg-[#111715] p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#0B221C] dark:text-[#D4AF5A]">
                وحدة فحص مطابقة العناوين والمحتوى والصور
              </span>
              <span className="text-xs font-bold text-[#9A7125] dark:text-[#D4AF5A]">مطابقة 100% بلا أخطاء</span>
            </div>
            <h3 className="text-xl font-bold font-royal text-[#141716] dark:text-[#F3F0EA]">
              {alignmentInspector.name} — {alignmentInspector.roleTitle}
            </h3>
            <p className="text-xs text-[#575B59] dark:text-slate-300 leading-relaxed">
              {alignmentInspector.bio}
            </p>
            <p className="pt-2 border-t border-[#DED8CC] dark:border-[#1E2824] text-[11px] text-[#575B59] dark:text-[#9CA39F]">
              {alignmentInspector.credentials}
            </p>
          </div>
        )}

        {layoutDirector && (
          <div className="border border-[#DED8CC] dark:border-[#1E2824] bg-white dark:bg-[#111715] p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#9B1C1C] dark:text-[#D4AF5A]">
                وحدة الترتيب والتنسيق والإخراج المجلي
              </span>
              <span className="text-xs font-bold text-[#0B221C] dark:text-[#D4AF5A]">إشراف فني وتحريري</span>
            </div>
            <h3 className="text-xl font-bold font-royal text-[#141716] dark:text-[#F3F0EA]">
              {layoutDirector.name} — {layoutDirector.roleTitle}
            </h3>
            <p className="text-xs text-[#575B59] dark:text-slate-300 leading-relaxed">
              {layoutDirector.bio}
            </p>
            <p className="pt-2 border-t border-[#DED8CC] dark:border-[#1E2824] text-[11px] text-[#575B59] dark:text-[#9CA39F]">
              {layoutDirector.credentials}
            </p>
          </div>
        )}

        {proofreader && (
          <div className="border border-[#DED8CC] dark:border-[#1E2824] bg-white dark:bg-[#111715] p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#0B221C] dark:text-[#D4AF5A]">
                وحدة التدقيق اللغوي والفلترة الذكية وفحص تفرد الصور
              </span>
              <span className="text-xs font-bold text-[#9A7125] dark:text-[#D4AF5A]">0 تكرار للصور</span>
            </div>
            <h3 className="text-xl font-bold font-royal text-[#141716] dark:text-[#F3F0EA]">
              {proofreader.name} — {proofreader.roleTitle}
            </h3>
            <p className="text-xs text-[#575B59] dark:text-slate-300 leading-relaxed">
              {proofreader.bio}
            </p>
            <p className="pt-2 border-t border-[#DED8CC] dark:border-[#1E2824] text-[11px] text-[#575B59] dark:text-[#9CA39F]">
              {proofreader.credentials}
            </p>
          </div>
        )}
      </section>

      {/* لوحة التوزيع الهيكلي للصحفيين (50% سوريا | 40% العرب وتركيا | 10% باقي الأقسام) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="border border-[#9A7125]/40 bg-[#0F2922] text-[#FAF9F6] p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#D4AF5A]">الوحدة الأولى · الأولوية القصوى</span>
            <span className="text-2xl font-extrabold font-royal text-[#D4AF5A]">50%</span>
          </div>
          <h3 className="text-lg font-bold font-royal">فريق الشأن السوري (50 صحفيًا)</h3>
          <p className="text-xs text-[#E5DFD3]/85 leading-relaxed">
            تغطية شاملة ومعمّقة لجميع المحافظات السورية الـ 14، والاقتصاد والمعيشة، وإعادة الإعمار، والطاقة والمياه، والمعابر الحدودية، والمرافئ، والجامعات.
          </p>
        </div>

        <div className="border border-[#E2DDD3] dark:border-[#1F2724] bg-white dark:bg-[#111614] p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#9A7125] dark:text-[#D4AF5A]">الوحدة الثانية · التغطية الإقليمية</span>
            <span className="text-2xl font-extrabold font-royal text-[#0F2922] dark:text-[#D4AF5A]">40%</span>
          </div>
          <h3 className="text-lg font-bold font-royal text-[#111312] dark:text-[#F3F0EA]">
            فريق العالم العربي وتركيا (40 صحفيًا)
          </h3>
          <p className="text-xs text-[#5A5D5B] dark:text-slate-300 leading-relaxed">
            مراسلون ومحررون متخصصون في الشأن التركي (أنقرة وإسطنبول وغازي عنتاب ومرسين) وجميع العواصم العربية في الخليج والمشرق ووادي النيل والمغرب العربي.
          </p>
        </div>

        <div className="border border-[#E2DDD3] dark:border-[#1F2724] bg-white dark:bg-[#111614] p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#9A7125] dark:text-[#D4AF5A]">الوحدة الثالثة · التغطية التخصصية</span>
            <span className="text-2xl font-extrabold font-royal text-[#0F2922] dark:text-[#D4AF5A]">10%</span>
          </div>
          <h3 className="text-lg font-bold font-royal text-[#111312] dark:text-[#F3F0EA]">
            فريق الأقسام التخصصية والدولية (10 محررين)
          </h3>
          <p className="text-xs text-[#5A5D5B] dark:text-slate-300 leading-relaxed">
            نخبة من المحررين المتخصصين في التكنولوجيا والذكاء الاصطناعي، والعلوم والصحة، والثقافة والتراث، والرياضة، والتحليلات الاستراتيجية، والاقتصاد الدولي.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2DDD3] dark:border-[#1F2724] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setUnitFilter('all')}
            className={`px-3.5 py-2 text-xs font-bold transition-colors ${
              unitFilter === 'all'
                ? 'bg-[#0F2922] text-[#FAF9F6] dark:bg-[#D4AF5A] dark:text-[#0A0D0C]'
                : 'bg-[#F2EFE9] dark:bg-[#111614] text-[#5A5D5B] dark:text-slate-300 hover:text-[#9A7125]'
            }`}
          >
            جميع الصحفيين ({syriaAuthors.length + arabTurkeyAuthors.length + otherAuthors.length})
          </button>
          <button
            type="button"
            onClick={() => setUnitFilter('syria')}
            className={`px-3.5 py-2 text-xs font-bold transition-colors ${
              unitFilter === 'syria'
                ? 'bg-[#0F2922] text-[#FAF9F6] dark:bg-[#D4AF5A] dark:text-[#0A0D0C]'
                : 'bg-[#F2EFE9] dark:bg-[#111614] text-[#5A5D5B] dark:text-slate-300 hover:text-[#9A7125]'
            }`}
          >
            صحفيو الشأن السوري ({syriaAuthors.length} — 50%)
          </button>
          <button
            type="button"
            onClick={() => setUnitFilter('arab_turkey')}
            className={`px-3.5 py-2 text-xs font-bold transition-colors ${
              unitFilter === 'arab_turkey'
                ? 'bg-[#0F2922] text-[#FAF9F6] dark:bg-[#D4AF5A] dark:text-[#0A0D0C]'
                : 'bg-[#F2EFE9] dark:bg-[#111614] text-[#5A5D5B] dark:text-slate-300 hover:text-[#9A7125]'
            }`}
          >
            صحفيو العرب وتركيا ({arabTurkeyAuthors.length} — 40%)
          </button>
          <button
            type="button"
            onClick={() => setUnitFilter('other')}
            className={`px-3.5 py-2 text-xs font-bold transition-colors ${
              unitFilter === 'other'
                ? 'bg-[#0F2922] text-[#FAF9F6] dark:bg-[#D4AF5A] dark:text-[#0A0D0C]'
                : 'bg-[#F2EFE9] dark:bg-[#111614] text-[#5A5D5B] dark:text-slate-300 hover:text-[#9A7125]'
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
            className="border border-[#E2DDD3] dark:border-[#1F2724] bg-white dark:bg-[#111614] p-5 space-y-2 flex flex-col justify-between hover:border-[#9A7125] transition-colors"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#9A7125] dark:text-[#D4AF5A]">{author.roleTitle}</span>
                <span className="text-[10px] font-mono text-[#5A5D5B] dark:text-[#9CA39F]">#{index + 1}</span>
              </div>
              <h3 className="text-lg font-bold font-display text-[#111312] dark:text-[#F3F0EA]">
                {author.name}
              </h3>
              <p className="text-xs text-[#5A5D5B] dark:text-slate-300 leading-relaxed">{author.bio}</p>
            </div>
            <p className="pt-2 text-[11px] text-[#5A5D5B] dark:text-[#9CA39F] border-t border-[#E2DDD3]/60 dark:border-[#1F2724]">
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
      <aside className="lg:col-span-4 border border-[#E2DDD3] dark:border-[#1F2724] bg-[#F2EFE9]/60 dark:bg-[#111614] p-5">
        <h2 className="text-sm font-bold font-display text-[#111312] dark:text-[#F3F0EA] pb-3 mb-3 border-b border-[#E2DDD3] dark:border-[#1F2724]">
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
                  ? 'bg-[#0F2922] text-[#FAF9F6] dark:bg-[#D4AF5A] dark:text-[#0A0D0C] font-bold'
                  : 'text-[#5A5D5B] dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {p.titleAr}
            </button>
          ))}
        </nav>
      </aside>

      <div className="lg:col-span-8 border border-[#E2DDD3] dark:border-[#1F2724] bg-white dark:bg-[#111614] p-6 sm:p-8 space-y-6">
        <header className="border-b border-[#E2DDD3] dark:border-[#1F2724] pb-5">
          <span className="text-xs font-semibold text-[#9A7125] dark:text-[#D4AF5A]">
            وثيقة رسمية ملزمة · آخر تحديث: {page.lastUpdated}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-royal text-[#111312] dark:text-[#F3F0EA] mt-1">
            {page.titleAr}
          </h1>
          <p className="text-sm text-[#5A5D5B] dark:text-[#9CA39F] mt-2 leading-relaxed">
            {page.subtitleAr}
          </p>
        </header>

        {page.requiresPublisherIdentity && (
          <div className="p-4 border border-[#E2DDD3] dark:border-[#1F2724] bg-[#FAF9F6] dark:bg-[#0A0D0C] text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#111312] dark:text-[#F3F0EA]">
              <ShieldCheck className="w-4 h-4 text-[#9A7125] dark:text-[#D4AF5A]" />
              <span>البيانات الرسمية للمؤسسة الناشرة:</span>
            </div>
            <p className="text-[#5A5D5B] dark:text-slate-300">
              المؤسسة: <strong>{siteConfig.publisherLegalName}</strong> · رئيس التحرير المسؤول:{' '}
              <strong>{siteConfig.editorInChiefName}</strong> · البريد الإلكتروني الرسمي:{' '}
              <a href={`mailto:${siteConfig.contactEmail}`} className="font-mono font-bold underline hover:text-[#9A7125]">
                {siteConfig.contactEmail}
              </a>
            </p>
          </div>
        )}

        <div className="space-y-6">
          {page.sections.map((sec, idx) => (
            <section key={idx} className="space-y-2.5">
              <h2 className="text-lg font-bold font-display text-[#111312] dark:text-[#F3F0EA]">
                {sec.heading}
              </h2>
              {sec.paragraphs.map((p, pIdx) => (
                <p
                  key={pIdx}
                  className="text-sm text-[#5A5D5B] dark:text-slate-300 leading-relaxed"
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
            className="pt-6 border-t border-[#E2DDD3] dark:border-[#1F2724] space-y-4 text-xs"
          >
            <h3 className="text-base font-bold font-display text-[#111312] dark:text-[#F3F0EA] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#9A7125] dark:text-[#D4AF5A]" />
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
                  className="w-full px-3 py-2 bg-[#FAF9F6] dark:bg-[#0A0D0C] border border-[#E2DDD3] dark:border-[#1F2724]"
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
                  className="w-full px-3 py-2 bg-[#FAF9F6] dark:bg-[#0A0D0C] border border-[#E2DDD3] dark:border-[#1F2724]"
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
                className="w-full px-3 py-2 bg-[#FAF9F6] dark:bg-[#0A0D0C] border border-[#E2DDD3] dark:border-[#1F2724]"
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
                className="w-full px-3 py-2 bg-[#FAF9F6] dark:bg-[#0A0D0C] border border-[#E2DDD3] dark:border-[#1F2724]"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#5A5D5B] dark:text-[#9CA39F]">
                تخضع جميع المراسلات لمراجعة مكتب التحرير المركزي والرد خلال 24 ساعة عمل
              </span>
              <button
                type="submit"
                className="px-5 py-2 bg-[#0F2922] text-[#FAF9F6] dark:bg-[#D4AF5A] dark:text-[#0A0D0C] font-bold"
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
