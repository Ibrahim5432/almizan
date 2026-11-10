import React, { useEffect, useState } from 'react';
import { Moon, Search, Sun } from 'lucide-react';
import {
  ArticleRecord,
  AuthorRecord,
  CategorySlug,
  EDITORIAL_SECTIONS,
  ServiceDataWidget,
  TagRecord,
} from './core/types';
import { defaultSiteConfig, SiteConfig } from '../config/site.config';
import {
  INITIAL_ARTICLES,
  INITIAL_AUTHORS,
  INITIAL_TAGS,
  LEGAL_AND_TRUST_PAGES,
  LegalPageContent,
  SERVICE_DATA_WIDGETS,
} from './core/seed-data';
import { getTodayHijriAndGregorian } from './utils/formatters';
import { ConsentBanner, ConsentState, loadConsentState } from './components/AdSenseAndConsent';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton';
import {
  ArticleDetailView,
  CategoryArchiveView,
  CorrectionsLogView,
  EditorialTeamView,
  HomeView,
  LegalTrustPageView,
  SearchView,
  TagArchiveView,
} from './components/PublicEditorialViews';

type ActiveRoute =
  | { view: 'home' }
  | { view: 'article'; articleId: string }
  | { view: 'category'; categorySlug: CategorySlug }
  | { view: 'tag'; tagSlug: string }
  | { view: 'search'; query: string }
  | { view: 'corrections' }
  | { view: 'editorial_team' }
  | { view: 'legal'; slug: string };

export function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [consent, setConsent] = useState<ConsentState>(() => loadConsentState());

  const [siteConfig, setSiteConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [articles, setArticles] = useState<ArticleRecord[]>(INITIAL_ARTICLES);
  const [authors, setAuthors] = useState<AuthorRecord[]>(INITIAL_AUTHORS);
  const [tags, setTags] = useState<TagRecord[]>(INITIAL_TAGS);
  const [widgets, setWidgets] = useState<ServiceDataWidget[]>(SERVICE_DATA_WIDGETS);
  const [legalPages, setLegalPages] = useState<Record<string, LegalPageContent>>(LEGAL_AND_TRUST_PAGES);

  const [route, setRoute] = useState<ActiveRoute>(() => {
    const p = window.location.pathname;
    if (p === '/corrections') return { view: 'corrections' };
    if (p === '/editorial-team') return { view: 'editorial_team' };
    if (p.startsWith('/legal/')) {
      const slug = p.replace('/legal/', '');
      return { view: 'legal', slug: slug || 'about' };
    }
    const matchedSection = EDITORIAL_SECTIONS.find((s) => `/${s.slug}` === p);
    if (matchedSection) {
      return { view: 'category', categorySlug: matchedSection.slug };
    }
    return { view: 'home' };
  });

  const [headerSearchInput, setHeaderSearchInput] = useState('');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const refreshNewsroomState = async () => {
    try {
      const res = await fetch('/api/newsroom/state');
      if (!res.ok) return;
      const data = await res.json();
      setSiteConfig(data.siteConfig);
      setArticles(data.articles);
      setAuthors(data.authors);
      setTags(data.tags);
      setWidgets(data.widgets);
      setLegalPages(data.legalPages);
    } catch {
      // fallback to initial state if offline
    }
  };

  useEffect(() => {
    refreshNewsroomState();
  }, []);

  // التحديث التلقائي الصامت في الخلفية دون أي لوحة تحكم أو تدخل بشري
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        await fetch('/api/newsroom/auto-fetch', { method: 'POST' });
        await refreshNewsroomState();
      } catch {
        // ignore background network errors
      }
    }, 10 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const navigateTo = (nextRoute: ActiveRoute, urlPath?: string) => {
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (urlPath) {
      try {
        window.history.pushState({}, '', urlPath);
      } catch {
        // ignore in sandboxed iframe
      }
    }
  };

  const todayDates = getTodayHijriAndGregorian(siteConfig.numeralSystem);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F6F0] text-[#0C1713] dark:bg-[#080E0C] dark:text-[#F3EFE6] transition-colors">
      {/* ====================================================================
          1. الشريط الإمبراطوري العلوي (Imperial Emerald Top Bar)
      ==================================================================== */}
      <div className="bg-[#09241D] text-[#F3EFE6] border-b border-[#C89D42]/40 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 text-[#E5DEC9]">
            <span className="font-bold text-[#D4A84F]">{todayDates.hijri}</span>
            <span aria-hidden="true" className="text-[#C89D42]/50">·</span>
            <span>{todayDates.gregorian}</span>
            <span aria-hidden="true" className="hidden md:inline text-[#C89D42]/50">·</span>
            <span className="hidden md:inline">
              رئيس التحرير المسؤول: <strong className="text-white">{siteConfig.editorInChiefName}</strong>
            </span>
            <span aria-hidden="true" className="hidden lg:inline text-[#C89D42]/50">·</span>
            <span className="hidden lg:inline text-[#D4A84F]">
              تغطية شاملة من 28 شبكة إخبارية عربية ووكالة رسمية · صور مرخّصة قانونيًا
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigateTo(
                  { view: 'search', query: headerSearchInput },
                  `/search?q=${encodeURIComponent(headerSearchInput)}`
                );
              }}
              className="flex items-center border border-[#C89D42]/40 bg-[#061813] text-white"
            >
              <label htmlFor="masthead-search" className="sr-only">
                ابحث في الأخبار
              </label>
              <input
                id="masthead-search"
                type="search"
                value={headerSearchInput}
                onChange={(e) => setHeaderSearchInput(e.target.value)}
                placeholder="ابحث في الأرشيف الموثق..."
                className="px-2.5 py-1 text-xs bg-transparent text-white placeholder:text-slate-400 focus:outline-none w-36 sm:w-48"
              />
              <button
                type="submit"
                aria-label="تنفيذ البحث"
                className="px-2 py-1 text-[#D4A84F] hover:text-white"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            <button
              type="button"
              onClick={async () => {
                const nextSys = siteConfig.numeralSystem === 'western' ? 'eastern' : 'western';
                setSiteConfig((prev) => ({ ...prev, numeralSystem: nextSys }));
                await fetch('/api/newsroom/settings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ numeralSystem: nextSys }),
                });
              }}
              className="px-2.5 py-1 border border-[#C89D42]/40 bg-[#061813] text-[#E5DEC9] hover:border-[#D4A84F] whitespace-nowrap shrink-0"
              aria-label="تبديل نظام الأرقام"
            >
              الأرقام: {siteConfig.numeralSystem === 'western' ? '0-9' : '٠-٩'}
            </button>

            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#C89D42]/40 bg-[#061813] text-[#E5DEC9] hover:border-[#D4A84F] whitespace-nowrap shrink-0"
              aria-label={darkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-[#D4A84F]" /> : <Moon className="w-3.5 h-3.5 text-[#D4A84F]" />}
              <span>{darkMode ? 'النهاري' : 'الليلي'}</span>
            </button>

            <PWAInstallButton />
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. الترويسة الملكية الفاخرة (Royal Broadsheet Centerpiece Masthead)
      ==================================================================== */}
      <header className="border-b-4 border-double border-[#09241D] dark:border-[#C89D42]/60 bg-[#F9F6F0] dark:bg-[#080E0C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* الجناح الأيمن للترويسة: بطاقة الإصدار والهوية */}
            <div className="hidden lg:flex lg:col-span-3 flex-col justify-between border-e border-[#DED6C6] dark:border-[#1C2E27] pe-5 space-y-1.5 text-xs">
              <span className="font-bold text-[#B6862C] dark:text-[#D4A84F] tracking-wide">
                الطبعة الرقمية الموثقة
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                تغطية يومية محققة لأخبار سوريا والعالم العربي والاقتصاد والأسواق الدولية.
              </p>
              <div className="pt-1 flex items-center gap-2 text-[11px] font-bold text-[#09241D] dark:text-[#D4A84F]">
                <button
                  type="button"
                  onClick={() => navigateTo({ view: 'editorial_team' }, '/editorial-team')}
                  className="hover:underline"
                >
                  هيئة التحرير ({siteConfig.editorInChiefName})
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => navigateTo({ view: 'corrections' }, '/corrections')}
                  className="hover:underline"
                >
                  سجل التصحيحات
                </button>
              </div>
            </div>

            {/* قلب الترويسة الملكي: اسم الصحيفة بخط الثلث/النسخ الفاخر (Amiri) */}
            <div className="lg:col-span-6 text-center space-y-2">
              <div className="inline-flex items-center gap-3 text-xs font-bold text-[#B6862C] dark:text-[#D4A84F]">
                <span className="w-8 h-[1px] bg-[#B6862C]/60" />
                <span>صحافة عربية مستقلة · دقة المصدر وأمانة الكلمة</span>
                <span className="w-8 h-[1px] bg-[#B6862C]/60" />
              </div>

              <div>
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo({ view: 'home' }, '/');
                  }}
                  className="inline-block text-4xl sm:text-5xl lg:text-6xl font-bold font-royal tracking-normal text-[#09241D] dark:text-[#F3EFE6] hover:opacity-90 transition-opacity"
                >
                  {siteConfig.siteName}
                </a>
              </div>

              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
                {siteConfig.siteTagline}
              </p>
            </div>

            {/* الجناح الأيسر للترويسة: ضمان الملكية الفكرية والمصادر */}
            <div className="hidden lg:flex lg:col-span-3 flex-col justify-between border-s border-[#DED6C6] dark:border-[#1C2E27] ps-5 space-y-1.5 text-xs">
              <span className="font-bold text-[#09241D] dark:text-[#D4A84F]">
                ميثاق المصادر والصور القانونية
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                جميع الأخبار والصور الفوتوغرافية مرخّصة قانونيًا (مشاع إبداعي / مصادر أممية مفتوحة) ومتوافقة مع معايير النشر الدولية.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => navigateTo({ view: 'category', categorySlug: 'analysis' }, '/analysis')}
                  className="inline-block px-3.5 py-1.5 text-xs font-bold bg-[#09241D] text-[#F9F6F0] dark:bg-[#D4A84F] dark:text-[#080E0C] hover:opacity-90 transition-opacity"
                >
                  ملفات وتحليلات اليوم
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* شريط الأقسام الملكي المزدوج */}
        <div className="border-t border-[#DED6C6] dark:border-[#1C2E27] bg-[#F1ECE1] dark:bg-[#0F1915]">
          <nav
            aria-label="التنقل الرئيسي والأقسام التحريرية"
            className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 overflow-x-auto py-2.5 text-xs sm:text-sm"
          >
            <div className="flex items-center gap-5 sm:gap-6">
              <button
                type="button"
                onClick={() => navigateTo({ view: 'home' }, '/')}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
                  route.view === 'home'
                    ? 'font-extrabold text-[#09241D] dark:text-[#D4A84F] border-b-2 border-[#B6862C]'
                    : 'font-bold text-slate-800 dark:text-slate-200 hover:text-[#B6862C]'
                }`}
              >
                الرئيسية
              </button>
              {EDITORIAL_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => navigateTo({ view: 'category', categorySlug: sec.slug }, `/${sec.slug}`)}
                  className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
                    route.view === 'category' && route.categorySlug === sec.slug
                      ? 'font-extrabold text-[#09241D] dark:text-[#D4A84F] border-b-2 border-[#B6862C]'
                      : 'font-bold text-slate-800 dark:text-slate-200 hover:text-[#B6862C]'
                  }`}
                >
                  {sec.name}
                </button>
              ))}
            </div>

            <div className="hidden xl:flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 shrink-0">
              <button
                type="button"
                onClick={() => navigateTo({ view: 'legal', slug: 'editorial-policy' }, '/legal/editorial-policy')}
                className="hover:text-[#B6862C] font-medium"
              >
                السياسة التحريرية
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => navigateTo({ view: 'corrections' }, '/corrections')}
                className="hover:text-[#B6862C] font-medium"
              >
                التصحيحات
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* ====================================================================
          Main Content Canvas (Royal Editorial Broadsheet & Magazine Theme)
      ==================================================================== */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-7 space-y-10">

        {/* عرض الصفحة النشطة */}
        {route.view === 'home' && (
          <HomeView
            articles={articles}
            widgets={widgets}
            siteConfig={siteConfig}
            consentGranted={consent.advertising}
            onOpenArticle={(art) => navigateTo({ view: 'article', articleId: art.id }, `/${art.categorySlug}/${art.slug}`)}
            onOpenCategory={(slug) => navigateTo({ view: 'category', categorySlug: slug }, `/${slug}`)}
            onOpenTag={(tagSlug) => navigateTo({ view: 'tag', tagSlug }, `/tag/${encodeURIComponent(tagSlug)}`)}
            onSubscribe={async (email) => {
              const res = await fetch('/api/newsroom/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
              });
              const data = await res.json();
              return data.message || data.error;
            }}
          />
        )}

        {route.view === 'article' && (() => {
          const targetArticle = articles.find((a) => a.id === route.articleId) ?? articles[0];
          if (!targetArticle) return null;
          return (
            <ArticleDetailView
              article={targetArticle}
              allArticles={articles}
              tags={tags}
              siteConfig={siteConfig}
              consentGranted={consent.advertising}
              onOpenArticle={(art) => navigateTo({ view: 'article', articleId: art.id }, `/${art.categorySlug}/${art.slug}`)}
              onOpenCategory={(slug) => navigateTo({ view: 'category', categorySlug: slug }, `/${slug}`)}
              onOpenTag={(tagSlug) => navigateTo({ view: 'tag', tagSlug }, `/tag/${encodeURIComponent(tagSlug)}`)}
              onOpenLegal={(slug) => navigateTo({ view: 'legal', slug }, `/legal/${slug}`)}
              onOpenAuthor={() => navigateTo({ view: 'editorial_team' }, '/editorial-team')}
              onSubmitCorrectionReport={async (articleId, text, reporterEmail) => {
                await fetch('/api/newsroom/contact', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: 'قارئ — بلاغ تصويب',
                    email: reporterEmail || 'reader@example.com',
                    subject: `تصويب مقترح للمقال ${articleId}`,
                    message: text,
                    type: 'correction',
                  }),
                });
                await refreshNewsroomState();
              }}
            />
          );
        })()}

        {route.view === 'category' && (
          <CategoryArchiveView
            categorySlug={route.categorySlug}
            articles={articles}
            numeralSystem={siteConfig.numeralSystem}
            onOpenArticle={(art) => navigateTo({ view: 'article', articleId: art.id }, `/${art.categorySlug}/${art.slug}`)}
            onOpenCategory={(slug) => navigateTo({ view: 'category', categorySlug: slug }, `/${slug}`)}
          />
        )}

        {route.view === 'tag' && (
          <TagArchiveView
            tagSlugOrName={route.tagSlug}
            tags={tags}
            articles={articles}
            numeralSystem={siteConfig.numeralSystem}
            onOpenArticle={(art) => navigateTo({ view: 'article', articleId: art.id }, `/${art.categorySlug}/${art.slug}`)}
            onOpenCategory={(slug) => navigateTo({ view: 'category', categorySlug: slug }, `/${slug}`)}
          />
        )}

        {route.view === 'search' && (
          <SearchView
            initialQuery={route.query}
            articles={articles}
            numeralSystem={siteConfig.numeralSystem}
            onOpenArticle={(art) => navigateTo({ view: 'article', articleId: art.id }, `/${art.categorySlug}/${art.slug}`)}
            onOpenCategory={(slug) => navigateTo({ view: 'category', categorySlug: slug }, `/${slug}`)}
          />
        )}

        {route.view === 'corrections' && (
          <CorrectionsLogView
            articles={articles}
            numeralSystem={siteConfig.numeralSystem}
            onOpenArticle={(art) => navigateTo({ view: 'article', articleId: art.id }, `/${art.categorySlug}/${art.slug}`)}
          />
        )}

        {route.view === 'editorial_team' && (
          <EditorialTeamView
            authors={authors}
            siteConfig={siteConfig}
          />
        )}

        {route.view === 'legal' && (() => {
          const page = legalPages[route.slug] ?? legalPages.about;
          return (
            <LegalTrustPageView
              page={page}
              allPages={legalPages}
              siteConfig={siteConfig}
              onSelectPage={(slug) => navigateTo({ view: 'legal', slug }, `/legal/${slug}`)}
              onSubmitContactOrDmca={async (payload) => {
                const res = await fetch('/api/newsroom/contact', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                });
                const data = await res.json();
                await refreshNewsroomState();
                return data.message || data.error;
              }}
            />
          );
        })()}
      </main>

      {/* ====================================================================
          التذييل التحريري الملكي الفاخر (بدون أي روابط إدارة داخلية)
      ==================================================================== */}
      <footer className="mt-20 border-t-4 border-double border-[#C89D42] bg-[#09241D] text-[#E5DEC9] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-3.5">
            <h2 className="text-3xl font-bold font-royal text-[#D4A84F]">
              {siteConfig.siteName}
            </h2>
            <p className="text-[#E5DEC9]/85 leading-relaxed">
              {siteConfig.siteTagline}. جميع التقارير مبنية على استخلاص الوقائع من مصادرها الرسمية والمرخّصة تحت إشراف رئيس التحرير ({siteConfig.editorInChiefName}).
            </p>
            <p className="text-xs font-medium text-white">
              التواصل الرسمي: <span className="font-mono text-[#D4A84F]">{siteConfig.contactEmail}</span>
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold font-display text-sm text-[#D4A84F]">الأقسام التحريرية</h3>
            <ul className="grid grid-cols-2 gap-2 text-[#E5DEC9]/85">
              {EDITORIAL_SECTIONS.map((sec) => (
                <li key={sec.id}>
                  <button
                    type="button"
                    onClick={() => navigateTo({ view: 'category', categorySlug: sec.slug }, `/${sec.slug}`)}
                    className="hover:text-[#D4A84F] transition-colors text-start"
                  >
                    {sec.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold font-display text-sm text-[#D4A84F]">
              الشفافية والسياسات التحريرية
            </h3>
            <ul className="space-y-2 text-[#E5DEC9]/85">
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'legal', slug: 'about' }, '/legal/about')} className="hover:text-[#D4A84F]">
                  من نحن والملكية والتمويل
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'editorial_team' }, '/editorial-team')} className="hover:text-[#D4A84F]">
                  هيئة التحرير ({siteConfig.editorInChiefName})
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'legal', slug: 'editorial-policy' }, '/legal/editorial-policy')} className="hover:text-[#D4A84F]">
                  السياسة التحريرية والمعايير
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'legal', slug: 'ai-disclosure' }, '/legal/ai-disclosure')} className="hover:text-[#D4A84F]">
                  سياسة استخدام الذكاء الاصطناعي
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'corrections' }, '/corrections')} className="hover:text-[#D4A84F]">
                  سياسة وسجل التصحيحات العلني
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'legal', slug: 'methodology' }, '/legal/methodology')} className="hover:text-[#D4A84F]">
                  منهجية جمع الأخبار والتحقق
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold font-display text-sm text-[#D4A84F]">
              الشؤون القانونية والخلاصات القياسية
            </h3>
            <ul className="space-y-2 text-[#E5DEC9]/85">
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'legal', slug: 'privacy' }, '/legal/privacy')} className="hover:text-[#D4A84F]">
                  سياسة الخصوصية (GDPR &amp; KVKK)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'legal', slug: 'cookies' }, '/legal/cookies')} className="hover:text-[#D4A84F]">
                  سياسة ملفات الارتباط (Cookies)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'legal', slug: 'terms' }, '/legal/terms')} className="hover:text-[#D4A84F]">
                  شروط الاستخدام وإفصاح الإعلانات
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'legal', slug: 'dmca' }, '/legal/dmca')} className="hover:text-[#D4A84F]">
                  إشعارات حقوق النشر وطلبات الإزالة (DMCA)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'legal', slug: 'contact' }, '/legal/contact')} className="hover:text-[#D4A84F]">
                  اتصل بنا
                </button>
              </li>
              <li className="pt-2 flex flex-wrap items-center gap-2 font-mono text-[11px] text-[#D4A84F]">
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                  sitemap.xml
                </a>
                <span>·</span>
                <a href="/news-sitemap.xml" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                  news-sitemap.xml
                </a>
                <span>·</span>
                <a href="/rss.xml" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                  rss.xml
                </a>
                <span>·</span>
                <a href="/ads.txt" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                  ads.txt
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#C89D42]/30 py-4 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto text-[#E5DEC9]/70">
          <span>
            جميع الحقوق محفوظة © {new Date().getFullYear()} {siteConfig.siteName} — رئيس التحرير المسؤول: {siteConfig.editorInChiefName}.
          </span>
          <span>جميع الصور والأخبار مرخّصة قانونيًا ومتوافقة مع معايير الملكية الفكرية وGoogle AdSense</span>
        </div>
      </footer>

      {/* لافتة الموافقة على الخصوصية (CMP) ومؤشر عدم الاتصال */}
      <ConsentBanner
        enabled={siteConfig.cmpEnabled}
        consent={consent}
        onUpdateConsent={setConsent}
        onNavigateLegal={(slug) => navigateTo({ view: 'legal', slug }, `/legal/${slug}`)}
      />
      <OfflineIndicator />
    </div>
  );
}

export default App;
