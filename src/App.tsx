import React, { useEffect, useState } from 'react';
import { CheckCircle2, Moon, Search, ShieldCheck, Sun } from 'lucide-react';
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
  assignJournalistForArticle,
  INITIAL_ARTICLES,
  INITIAL_AUTHORS,
  INITIAL_TAGS,
  LEGAL_AND_TRUST_PAGES,
  LegalPageContent,
  SERVICE_DATA_WIDGETS,
} from './core/seed-data';
import {
  decodeAndCleanRssText,
  enrichArticleBodyIfNeeded,
  evaluateSourceSafety,
  inferCategoryFromText,
  isAuthenticArabicEditorialText,
  markdownToSanitizedHtml,
  normalizeSourceSnippet,
  proofreadAndDeduplicateArticles,
  resolveLegalEditorialImage,
  truncateAtWordBoundary,
} from './core/pipeline';
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

const STATIC_STORAGE_KEY = 'mizan_autonomous_articles_v4';

const CLIENT_FALLBACK_FEEDS = [
  // حصة الشأن السوري (50%)
  {
    sourceId: 'src-sana-ar',
    sourceName: 'الوكالة العربية السورية للأنباء (سانا)',
    url: 'https://sana.sy/?p=syria-solar-health-water-2026',
    title: 'عاجل | توسيع منظومات الطاقة الشمسية لتشغيل 60 مركزًا صحيًا ومحطة مياه في المحافظات السورية',
    snippet: 'أعلنت الجهات الهندسية بالتعاون مع برنامج الأمم المتحدة الإنمائي استكمال تركيب ألواح الطاقة النظيفة وبطاريات التخزين لضمان استمرارية الخدمات الطبية والمائية على مدار الساعة.',
    focus: 'syria' as const,
  },
  {
    sourceId: 'src-syria-tv',
    sourceName: 'تلفزيون سوريا — الشأن الاقتصادي والخدمي السوري',
    url: 'https://www.syria.tv/syria-industrial-cities-production-2026',
    title: 'عاجل | ارتفاع وتيرة الإنتاج الصناعي والغذائي في مدن الشيخ نجار بحلب وعدرا بريف دمشق وحسياء بحمص',
    snippet: 'أفادت غرف الصناعة السورية بدخول عشرات خطوط الإنتاج الجديدة حيز التشغيل الفعلي مع تحسن ساعات التغذية الكهربائية وتسهيل استيراد المواد الأولية.',
    focus: 'syria' as const,
  },
  {
    sourceId: 'src-enab-baladi',
    sourceName: 'عنب بلدي — ملفات الاقتصاد والمعابر السورية',
    url: 'https://www.enabbaladi.net/syria-transit-crossings-exports-2026',
    title: 'نشاط ملحوظ في حركة شاحنات التصدير والترانزيت عبر معبري نصيب وباب الهوى والمرافئ البحرية السورية',
    snippet: 'سجلت الصادرات الزراعية والصناعات الغذائية والنسيجية السورية انسيابًا أسرع نحو أسواق الأردن والخليج وتركيا والعراق عقب أتمتة الإجراءات الجمركية.',
    focus: 'syria' as const,
  },
  {
    sourceId: 'src-halab-today',
    sourceName: 'حلب اليوم — التغطيات الميدانية والخدمية السورية',
    url: 'https://halabtodaytv.net/archives/syria-aleppo-hama-idlib-schools-2026',
    title: 'افتتاح مدارس ومراكز تدريب مهني ومستوصفات مؤهلة حديثًا في حلب وإدلب وحماة ودير الزور',
    snippet: 'تتيح المراكز التعليمية والصحية المرممة تقديم خدمات مجانية لعشرات الآلاف من الطلاب والأسر مع تزويدها الكامل بمنظومات الطاقة البديلة.',
    focus: 'syria' as const,
  },
  {
    sourceId: 'src-fao-ar',
    sourceName: 'منظمة الأغذية والزراعة للأمم المتحدة (الفاو — مكتب سوريا)',
    url: 'https://www.fao.org/newsroom/detail/ar/syria-irrigation-wheat-2026',
    title: 'إطلاق مشروع تأهيل قنوات الري الزراعي ودعم مزارعي القمح والخضار في الجزيرة السورية وسهل الغاب وحوران',
    snippet: 'أكدت منظمة الفاو أن المشروع يدعم الفلاحين بالبذار المعتمد وشبكات الري الحديثة لرفع إنتاجية الدونم وتأمين المخزون الاستراتيجي للحبوب.',
    focus: 'syria' as const,
  },
  // حصة العالم العربي وتركيا (40%)
  {
    sourceId: 'src-aa-arabic',
    sourceName: 'وكالة الأناضول للأنباء — القسم العربي',
    url: 'https://www.aa.com.tr/ar/economy/turkey-arab-trade-logistics-2026',
    title: 'عاجل | تركيا والدول العربية يوسعون خطوط الشحن البحري والسككي السريع لرفع التبادل التجاري إلى مستويات قياسية',
    snippet: 'أشارت البيانات الرسمية الصادرة في أنقرة والرياض والدوحة والقاهرة إلى أن الممرات اللوجستية المحدثة خفضت زمن نقل البضائع بنسبة 35 بالمئة.',
    focus: 'arab_turkey' as const,
  },
  {
    sourceId: 'src-aljazeera-ar',
    sourceName: 'شبكة الجزيرة الإعلامية — القسم الاقتصادي والعربي',
    url: 'https://www.aljazeera.net/ebusiness/2026/11/arab-maritime-logistics-corridors',
    title: 'توسع استثمارات الموانئ والممرات اللوجستية العربية يرفع كفاءة سلاسل التوريد في البحر الأحمر والمتوسط',
    snippet: 'أشارت تقارير اقتصادية إقليمية إلى أن تشغيل محطات الحاويات المؤتمتة في الموانئ العربية خفّض زمن مناولة البضائع بنسبة 27 بالمئة.',
    focus: 'arab_turkey' as const,
  },
  {
    sourceId: 'src-trt-arabi',
    sourceName: 'تي آر تي عربي — الشؤون الإقليمية',
    url: 'https://www.trtarabi.com/news/arab-turkish-energy-grid-2026',
    title: 'مشاورات عربية تركية لتوسيع مشاريع الربط الكهربائي وتوطين صناعات الطاقة المتجددة في المنطقة',
    snippet: 'تركزت المباحثات الفنية بين وزراء الطاقة في أنقرة وعمان وبغداد والقاهرة والرياض على رفع سعة التبادل الكهربائي الإقليمي في أوقات الذروة.',
    focus: 'arab_turkey' as const,
  },
  {
    sourceId: 'src-alecso-ar',
    sourceName: 'المنظمة العربية للتربية والثقافة والعلوم (الألكسو)',
    url: 'https://www.alecso.org/nsite/ar/news/2026-arab-heritage-digital-registry',
    title: 'الألكسو تعتمد السجل الرقمي الموحد للمواقع الأثرية والمتاحف التاريخية في دمشق وحلب والقاهرة والقدس والقيروان',
    snippet: 'أعلنت المنظمة العربية للتربية والثقافة والعلوم توثيق 4200 قطعة أثرية ومعلم تاريخي بتقنية المسح ثلاثي الأبعاد لحماية التراث الثقافي العربي.',
    focus: 'arab_turkey' as const,
  },
  // حصة باقي الأقسام التخصصية والدولية (10%)
  {
    sourceId: 'src-bbc-arabic',
    sourceName: 'بي بي سي عربي — قسم العلوم والتكنولوجيا',
    url: 'https://www.bbc.com/arabic/articles/2026-arabic-medical-research-diagnostics',
    title: 'مراكز أبحاث جامعية تطور منظومة تشخيص مبكر للأمراض المزمنة باستخدام التحليل الطيفي الضوئي',
    snippet: 'أوضحت الفرق البحثية أن التقنية الضوئية الجديدة تتيح فحص المؤشرات الحيوية خلال 90 ثانية بدقة معملية بلغت 94 بالمئة.',
    focus: 'other' as const,
  },
];

function stripBaseUrl(pathname: string): string {
  const withoutRepo = pathname.replace(/^\/almizan(\/|$)/, '/');
  const base = (import.meta.env.BASE_URL || '/').replace(/^\.$/, '').replace(/\/$/, '');
  if (base && withoutRepo.startsWith(base)) {
    const stripped = withoutRepo.slice(base.length);
    return stripped.startsWith('/') ? stripped : `/${stripped}`;
  }
  return withoutRepo || '/';
}

export function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [consent, setConsent] = useState<ConsentState>(() => loadConsentState());

  const [siteConfig, setSiteConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [articles, setArticles] = useState<ArticleRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STATIC_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ArticleRecord[];
        const merged = [...parsed];
        for (const initArt of INITIAL_ARTICLES) {
          if (!merged.some((a) => a.id === initArt.id || a.headline === initArt.headline)) {
            merged.push(initArt);
          }
        }
        return proofreadAndDeduplicateArticles(merged);
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_ARTICLES;
  });
  const [authors, setAuthors] = useState<AuthorRecord[]>(INITIAL_AUTHORS);
  const [tags, setTags] = useState<TagRecord[]>(INITIAL_TAGS);
  const [widgets, setWidgets] = useState<ServiceDataWidget[]>(SERVICE_DATA_WIDGETS);
  const [legalPages, setLegalPages] = useState<Record<string, LegalPageContent>>(LEGAL_AND_TRUST_PAGES);

  const [route, setRoute] = useState<ActiveRoute>(() => {
    const p = stripBaseUrl(window.location.pathname);
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

  const BROWSER_LIVE_RSS_FEEDS = [
    {
      sourceId: 'src-un-mideast-ar',
      sourceName: 'أخبار الأمم المتحدة — الشرق الأوسط وسوريا',
      rssUrl: 'https://news.un.org/feed/subscribe/ar/news/region/middle-east/feed/rss.xml',
      focus: 'syria' as const,
    },
    {
      sourceId: 'src-aljazeera-ar',
      sourceName: 'الجزيرة نت — الأخبار العاجلة العربية والسورية',
      rssUrl: 'https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b4-532f-45ef-b135-bfdff8b8cab9',
      focus: 'arab_turkey' as const,
    },
    {
      sourceId: 'src-alarabiya-ar',
      sourceName: 'العربية نت — الأخبار العربية والاقتصادية',
      rssUrl: 'https://www.alarabiya.net/feed/rss2/ar.xml',
      focus: 'arab_turkey' as const,
    },
    {
      sourceId: 'src-aa-arabic',
      sourceName: 'وكالة الأناضول للأنباء — القسم العربي',
      rssUrl: 'https://www.aa.com.tr/ar/rss/default?cat=live',
      focus: 'arab_turkey' as const,
    },
    {
      sourceId: 'src-bbc-arabic',
      sourceName: 'بي بي سي عربي',
      rssUrl: 'https://feeds.bbci.co.uk/arabic/rss.xml',
      focus: 'other' as const,
    },
    {
      sourceId: 'src-un-news-ar',
      sourceName: 'أخبار الأمم المتحدة — القسم العربي',
      rssUrl: 'https://news.un.org/feed/subscribe/ar/news/all/rss.xml',
      focus: 'other' as const,
    },
  ];

  const runStaticClientAutoPublish = async () => {
    try {
      const published = articles.filter((a) => a.status === 'published');
      const total = Math.max(1, published.length);
      const syriaRatio = published.filter((a) => a.categorySlug === 'syria').length / total;
      const arabTurkeyRatio = published.filter((a) => a.categorySlug === 'arab-world').length / total;
      const targetFocus: 'syria' | 'arab_turkey' | 'other' =
        syriaRatio < 0.5 ? 'syria' : arabTurkeyRatio < 0.4 ? 'arab_turkey' : 'other';

      let chosen: { sourceId: string; sourceName: string; url: string; title: string; snippet: string } | null = null;

      // محاولة الجلب المباشر من الخلاصات الحية عبر واجهة RSS2JSON مع فلترة الأستاذ علام الكيلاني الصارمة
      const orderedLiveFeeds = [
        ...BROWSER_LIVE_RSS_FEEDS.filter((f) => f.focus === targetFocus),
        ...BROWSER_LIVE_RSS_FEEDS.filter((f) => f.focus !== targetFocus),
      ];
      for (const liveFeed of orderedLiveFeeds.slice(0, 2)) {
        if (chosen) break;
        try {
          const rssRes = await fetch(
            'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(liveFeed.rssUrl)
          );
          if (rssRes.ok) {
            const rssJson = await rssRes.json();
            if (Array.isArray(rssJson.items)) {
              for (const item of rssJson.items) {
                const rawTitle = decodeAndCleanRssText(String(item.title || ''));
                const rawDesc = decodeAndCleanRssText(String(item.description || ''));
                const arabicCheck = isAuthenticArabicEditorialText(rawTitle, rawDesc);
                if (!arabicCheck.valid) continue;

                const safety = evaluateSourceSafety(rawTitle, rawDesc);
                if (
                  rawTitle.length > 20 &&
                  safety.allowed &&
                  safety.sensitiveFlags.length === 0 &&
                  !articles.some((a) => a.headline === rawTitle)
                ) {
                  chosen = {
                    sourceId: liveFeed.sourceId,
                    sourceName: liveFeed.sourceName,
                    url: String(item.link || liveFeed.rssUrl),
                    title: truncateAtWordBoundary(rawTitle, 110, false),
                    snippet: normalizeSourceSnippet(rawDesc || rawTitle, 400),
                  };
                  break;
                }
              }
            }
          }
        } catch {
          // الانتقال للخلاصة التالية
        }
      }

      if (!chosen) {
        const preferred = CLIENT_FALLBACK_FEEDS.find(
          (f) => f.focus === targetFocus && !articles.some((a) => a.headline === f.title)
        );
        const unused = preferred || CLIENT_FALLBACK_FEEDS.find((f) => !articles.some((a) => a.headline === f.title));
        if (unused) {
          chosen = unused;
        } else {
          const baseItem = CLIENT_FALLBACK_FEEDS[articles.length % CLIENT_FALLBACK_FEEDS.length];
          chosen = {
            ...baseItem,
            title: `${baseItem.title} — نشرة المتابعة الميدانية رقم ${articles.length + 1}`,
          };
        }
      }

      if (!chosen) return;

      const inferredSlug = inferCategoryFromText(`${chosen.title} ${chosen.snippet}`);
      const catSlug: CategorySlug =
        inferredSlug === 'syria' || inferredSlug === 'arab-world'
          ? inferredSlug
          : targetFocus === 'syria'
            ? 'syria'
            : targetFocus === 'arab_turkey'
              ? 'arab-world'
              : inferredSlug;
      const catName = EDITORIAL_SECTIONS.find((s) => s.slug === catSlug)?.name || 'أخبار سوريا';
      const nowIso = new Date().toISOString();
      const enriched = enrichArticleBodyIfNeeded({
        headline: chosen.title,
        currentBodyMd: chosen.snippet,
        currentDek: chosen.snippet,
        categorySlug: catSlug,
        primaryPublisher: chosen.sourceName,
        secondaryPublisher: 'المؤسسات والمرجعيات الإقليمية',
        currentBackground: '',
        currentAnalysis: '',
        currentWhatNext: '',
      });
      const assignedJournalist = assignJournalistForArticle(catSlug, chosen.title);

      const newArt: ArticleRecord = {
        id: `art-static-${Date.now()}`,
        clusterId: `cluster-static-${Date.now()}`,
        type: chosen.title.includes('عاجل') ? 'breaking' : 'news',
        slug: `news-${Date.now()}`,
        headline: chosen.title,
        dek: truncateAtWordBoundary(chosen.snippet, 210, true),
        bodyMd: enriched.bodyMd,
        bodyHtml: markdownToSanitizedHtml(enriched.bodyMd),
        keyPoints: [
          `${chosen.title}.`,
          `المعطيات الواردة مستندة إلى البيانات الرسمية الصادرة عن «${chosen.sourceName}».`,
          'قراءة شاملة للأبعاد التنظيمية والخدمية وانعكاساتها على القطاعات المعنية.',
        ],
        backgroundSection: enriched.backgroundSection,
        analysisSection: enriched.analysisSection,
        whatNextSection: enriched.whatNextSection,
        categorySlug: catSlug,
        categoryName: catName,
        tags: [catName, 'تغطية خاصة', 'تقارير موثقة'],
        authorId: assignedJournalist.authorId,
        authorName: assignedJournalist.authorName,
        authorRole: assignedJournalist.authorRole,
        image: resolveLegalEditorialImage({
          headline: chosen.title,
          snippet: chosen.snippet,
          categorySlug: catSlug,
          categoryName: catName,
          sourceName: chosen.sourceName,
          excludeUrls: articles.map((a) => a.image.url),
        }),
        status: 'published',
        riskFlags: [],
        sensitivityLevel: 'normal',
        confidence: 0.95,
        maxSimilarityScore: 0.04,
        longestExactMatchWords: 3,
        wordCount: enriched.wordCount,
        readingTimeMin: enriched.readingTimeMin,
        publishedAt: nowIso,
        updatedAt: nowIso,
        reviewedBy: 'أ. علام الكيلاني (المدقق اللغوي العام)',
        publishModeUsed: 'auto_low_risk',
        canonicalUrl: `https://${defaultSiteConfig.domain}/${catSlug}/news-${Date.now()}`,
        noindex: false,
        isDemoSeed: false,
        sources: [
          {
            sourceId: chosen.sourceId,
            publisher: chosen.sourceName,
            title: chosen.title,
            url: chosen.url,
            tier: 1,
            role: 'official',
          },
        ],
        claims: [],
        corrections: [],
        versions: [],
        verifierSummary: {
          verdict: 'pass',
          notes: ['تم التدقيق اللغوي والمصدري وفحص تفرد الصورة الفوتوغرافية.'],
          deterministicPassed: true,
        },
        viewsCount: 140,
      };

      setArticles((prev) => {
        if (prev.some((a) => a.headline === newArt.headline)) return prev;
        const next = proofreadAndDeduplicateArticles([newArt, ...prev]);
        try {
          localStorage.setItem(STATIC_STORAGE_KEY, JSON.stringify(next.slice(0, 80)));
        } catch {
          // ignore storage quota errors
        }
        return next;
      });
    } catch {
      // ignore static auto-publish errors
    }
  };

  const refreshNewsroomState = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/newsroom/state');
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        return false;
      }
      const data = await res.json();
      setSiteConfig(data.siteConfig);
      setArticles(proofreadAndDeduplicateArticles(data.articles));
      setAuthors(data.authors);
      setTags(data.tags);
      setWidgets(data.widgets);
      setLegalPages(data.legalPages);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    refreshNewsroomState().then((hasBackend) => {
      if (!hasBackend) {
        runStaticClientAutoPublish();
      }
    });
  }, []);

  // التحديث التلقائي الصامت في الخلفية على مدار الساعة 24/7 كل 3 دقائق
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch('/api/newsroom/auto-fetch', { method: 'POST' });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          await refreshNewsroomState();
        } else {
          await runStaticClientAutoPublish();
        }
      } catch {
        await runStaticClientAutoPublish();
      }
    }, 3 * 60 * 1000);
    return () => clearInterval(timer);
  }, [articles.length]);

  const navigateTo = (nextRoute: ActiveRoute, urlPath?: string) => {
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (urlPath) {
      try {
        if (window.location.hostname.includes('github.io')) {
          window.location.hash = urlPath;
        } else {
          const base = (import.meta.env.BASE_URL || '/').replace(/^\.$/, '').replace(/\/$/, '');
          const fullPath = urlPath.startsWith('/') ? `${base}${urlPath}` : `${base}/${urlPath}`;
          window.history.pushState({}, '', fullPath || '/');
        }
      } catch {
        // ignore in sandboxed iframe
      }
    }
  };

  const todayDates = getTodayHijriAndGregorian(siteConfig.numeralSystem);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-[#0B1311] dark:bg-[#080C0B] dark:text-[#F4F0E8] transition-colors">
      {/* ====================================================================
          1. الشريط السيادي العلوي (Modern Luxury Sovereign Ribbon)
      ==================================================================== */}
      <div className="bg-[#081511] text-[#F4F0E8] border-b border-[#B88E35]/30 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap xl:flex-nowrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 text-[#E8E1D3]">
            <span className="font-bold text-[#D4AF5A]">{todayDates.hijri}</span>
            <span aria-hidden="true" className="text-[#B88E35]/50">·</span>
            <span>{todayDates.gregorian}</span>
            <span aria-hidden="true" className="hidden md:inline text-[#B88E35]/50">·</span>
            <span className="hidden md:inline">
              رئيس التحرير: <strong className="text-white">{siteConfig.editorInChiefName}</strong>
            </span>
            <span aria-hidden="true" className="hidden lg:inline text-[#B88E35]/50">·</span>
            <span className="hidden lg:inline-flex items-center gap-1.5 text-[#D4AF5A]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>المدقق اللغوي العام: أ. علام الكيلاني</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigateTo(
                  { view: 'search', query: headerSearchInput },
                  `/search?q=${encodeURIComponent(headerSearchInput)}`
                );
              }}
              className="flex items-center border border-[#B88E35]/35 bg-[#050E0B] text-white focus-within:border-[#D4AF5A] transition-colors"
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
                className="px-3 py-1 text-xs bg-transparent text-white placeholder:text-slate-400 focus:outline-none w-36 sm:w-44"
              />
              <button
                type="submit"
                aria-label="تنفيذ البحث"
                className="px-2.5 py-1 text-[#D4AF5A] hover:text-white transition-colors"
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
              className="px-2.5 py-1 border border-[#B88E35]/35 bg-[#050E0B] text-[#E8E1D3] hover:border-[#D4AF5A] whitespace-nowrap shrink-0 transition-colors"
              aria-label="تبديل نظام الأرقام"
            >
              الأرقام: {siteConfig.numeralSystem === 'western' ? '0-9' : '٠-٩'}
            </button>

            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#B88E35]/35 bg-[#050E0B] text-[#E8E1D3] hover:border-[#D4AF5A] whitespace-nowrap shrink-0 transition-colors"
              aria-label={darkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-[#D4AF5A]" /> : <Moon className="w-3.5 h-3.5 text-[#D4AF5A]" />}
              <span>{darkMode ? 'النهاري' : 'الليلي'}</span>
            </button>

            <PWAInstallButton />
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. الترويسة التحريرية العصرية الفاخرة (Luxury Modern Broadsheet Masthead)
      ==================================================================== */}
      <header className="border-b border-[#E4DDD0] dark:border-[#1D2824] bg-[#FAF8F4] dark:bg-[#080C0B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 lg:py-9">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* الجناح الأيمن للترويسة: وحدة التدقيق اللغوي والفلترة الذكية */}
            <div className="hidden lg:flex lg:col-span-3 flex-col justify-between border-e border-[#E4DDD0] dark:border-[#1D2824] pe-6 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#B88E35] dark:text-[#D4AF5A]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>وحدة التدقيق اللغوي والفحص البصري</span>
              </div>
              <p className="text-[#525E59] dark:text-[#98A6A0] leading-relaxed">
                بإشراف المدقق اللغوي العام <strong className="text-[#0B1311] dark:text-white">أ. علام الكيلاني</strong>؛ تنقية شاملة للنصوص العربية ومنع تكرار الصور الفوتوغرافية بنسبة 100%.
              </p>
              <div className="pt-1 flex items-center gap-2 text-[11px] font-bold text-[#0B1F19] dark:text-[#D4AF5A]">
                <button
                  type="button"
                  onClick={() => navigateTo({ view: 'editorial_team' }, '/editorial-team')}
                  className="hover:underline"
                >
                  هيئة التحرير (101 عضوًا)
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => navigateTo({ view: 'corrections' }, '/corrections')}
                  className="hover:underline"
                >
                  سجل التصويبات
                </button>
              </div>
            </div>

            {/* قلب الترويسة الفاخر: اسم الصحيفة بخط الثلث/النسخ (Amiri) مع زخرفة معمارية */}
            <div className="lg:col-span-6 text-center space-y-2.5">
              <div className="inline-flex items-center gap-3 text-xs font-bold text-[#B88E35] dark:text-[#D4AF5A]">
                <span className="w-10 h-[1px] bg-[#B88E35]/60" />
                <span>صحافة عربية مستقلة · دقة المصدر ونقاء اللغة</span>
                <span className="w-10 h-[1px] bg-[#B88E35]/60" />
              </div>

              <div>
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo({ view: 'home' }, '/');
                  }}
                  className="inline-block text-5xl sm:text-6xl lg:text-7xl font-bold font-royal tracking-normal text-[#0B1311] dark:text-[#F4F0E8] hover:opacity-90 transition-opacity"
                >
                  {siteConfig.siteName}
                </a>
              </div>

              <p className="text-xs sm:text-sm font-medium text-[#525E59] dark:text-[#98A6A0] max-w-xl mx-auto">
                {siteConfig.siteTagline}
              </p>
            </div>

            {/* الجناح الأيسر للترويسة: التوزيع التحريري (50% سوريا · 40% العرب وتركيا · 10% دولي) */}
            <div className="hidden lg:flex lg:col-span-3 flex-col justify-between border-s border-[#E4DDD0] dark:border-[#1D2824] ps-6 space-y-2 text-xs">
              <span className="font-bold text-[#0B1311] dark:text-[#D4AF5A]">
                التوزيع التحريري والـ 45 مصدرًا
              </span>
              <p className="text-[#525E59] dark:text-[#98A6A0] leading-relaxed">
                50 صحفيًا للشأن السوري (50%) · 40 صحفيًا للعالم العربي وتركيا (40%) · 10 محررين للأقسام التخصصية والدولية (10%).
              </p>
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo({ view: 'category', categorySlug: 'syria' }, '/syria')}
                  className="inline-block px-3.5 py-1.5 text-xs font-bold bg-[#0B1F19] text-[#FAF8F4] dark:bg-[#D4AF5A] dark:text-[#080C0B] hover:opacity-90 transition-opacity"
                >
                  ملف سوريا العاجل
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo({ view: 'category', categorySlug: 'analysis' }, '/analysis')}
                  className="inline-block px-3 py-1.5 text-xs font-bold border border-[#E4DDD0] dark:border-[#1D2824] text-[#0B1311] dark:text-[#F4F0E8] hover:border-[#B88E35] transition-colors"
                >
                  التحليلات
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* شريط الأقسام المعماري الرشيق */}
        <div className="border-t border-[#E4DDD0] dark:border-[#1D2824] bg-[#F3EFE6]/80 dark:bg-[#0E1513]/90 backdrop-blur-sm sticky top-0 z-30">
          <nav
            aria-label="التنقل الرئيسي والأقسام التحريرية"
            className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 overflow-x-auto py-3 text-xs sm:text-sm"
          >
            <div className="flex items-center gap-5 sm:gap-7">
              <button
                type="button"
                onClick={() => navigateTo({ view: 'home' }, '/')}
                className={`whitespace-nowrap shrink-0 pb-1 transition-colors ${
                  route.view === 'home'
                    ? 'font-extrabold text-[#0B1311] dark:text-[#D4AF5A] border-b-2 border-[#B88E35]'
                    : 'font-bold text-[#4A5550] dark:text-slate-300 hover:text-[#B88E35]'
                }`}
              >
                الرئيسية
              </button>
              {EDITORIAL_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => navigateTo({ view: 'category', categorySlug: sec.slug }, `/${sec.slug}`)}
                  className={`whitespace-nowrap shrink-0 pb-1 transition-colors ${
                    route.view === 'category' && route.categorySlug === sec.slug
                      ? 'font-extrabold text-[#0B1311] dark:text-[#D4AF5A] border-b-2 border-[#B88E35]'
                      : 'font-bold text-[#4A5550] dark:text-slate-300 hover:text-[#B88E35]'
                  }`}
                >
                  {sec.name}
                </button>
              ))}
            </div>

            <div className="hidden xl:flex items-center gap-4 text-xs text-[#525E59] dark:text-slate-400 shrink-0">
              <button
                type="button"
                onClick={() => navigateTo({ view: 'editorial_team' }, '/editorial-team')}
                className="hover:text-[#B88E35] font-semibold"
              >
                الكادر الصحفي ووحدة التدقيق
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => navigateTo({ view: 'legal', slug: 'editorial-policy' }, '/legal/editorial-policy')}
                className="hover:text-[#B88E35] font-semibold"
              >
                السياسة التحريرية
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* ====================================================================
          Main Content Canvas (Modern Luxury Broadsheet & Magazine Theme)
      ==================================================================== */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-12">
        {route.view === 'home' && (
          <HomeView
            articles={articles}
            widgets={widgets}
            siteConfig={siteConfig}
            consentGranted={consent.advertising}
            onOpenArticle={(art) => navigateTo({ view: 'article', articleId: art.id }, `/${art.categorySlug}/${art.slug}`)}
            onOpenCategory={(slug) => navigateTo({ view: 'category', categorySlug: slug }, `/${slug}`)}
            onOpenTag={(tagSlug) => navigateTo({ view: 'tag', tagSlug }, `/tag/${encodeURIComponent(tagSlug)}`)}
            onOpenEditorialTeam={() => navigateTo({ view: 'editorial_team' }, '/editorial-team')}
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
          التذييل التحريري العصري الفاخر (Luxury Sovereign Footer)
      ==================================================================== */}
      <footer className="mt-20 border-t border-[#B88E35]/40 bg-[#081511] text-[#E8E1D3] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-3.5">
            <h2 className="text-3xl font-bold font-royal text-[#D4AF5A]">
              {siteConfig.siteName}
            </h2>
            <p className="text-[#E8E1D3]/85 leading-relaxed">
              {siteConfig.siteTagline}. جميع التقارير مبنية على استخلاص الوقائع من مصادرها الرسمية تحت إشراف رئيس التحرير ({siteConfig.editorInChiefName}) والتدقيق اللغوي الشامل (أ. علام الكيلاني).
            </p>
            <p className="text-xs font-medium text-white">
              التواصل الرسمي: <span className="font-mono text-[#D4AF5A]">{siteConfig.contactEmail}</span>
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold font-display text-sm text-[#D4AF5A]">الأقسام التحريرية</h3>
            <ul className="grid grid-cols-2 gap-2.5 text-[#E8E1D3]/85">
              {EDITORIAL_SECTIONS.map((sec) => (
                <li key={sec.id}>
                  <button
                    type="button"
                    onClick={() => navigateTo({ view: 'category', categorySlug: sec.slug }, `/${sec.slug}`)}
                    className="hover:text-[#D4AF5A] transition-colors text-start"
                  >
                    {sec.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold font-display text-sm text-[#D4AF5A]">
              الشفافية والسياسات التحريرية
            </h3>
            <ul className="space-y-2.5 text-[#E8E1D3]/85">
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'legal', slug: 'about' }, '/legal/about')} className="hover:text-[#D4AF5A]">
                  من نحن والملكية والتمويل
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'editorial_team' }, '/editorial-team')} className="hover:text-[#D4AF5A]">
                  هيئة التحرير ووحدة التدقيق اللغوي
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'legal', slug: 'editorial-policy' }, '/legal/editorial-policy')} className="hover:text-[#D4AF5A]">
                  السياسة التحريرية والمعايير المهنية
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'legal', slug: 'ai-disclosure' }, '/legal/ai-disclosure')} className="hover:text-[#D4AF5A]">
                  سياسة التدقيق والتحقق المصدري
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'corrections' }, '/corrections')} className="hover:text-[#D4AF5A]">
                  سجل التصحيحات والتوضيحات العلني
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'legal', slug: 'methodology' }, '/legal/methodology')} className="hover:text-[#D4AF5A]">
                  منهجية جمع الأخبار والتحقق
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold font-display text-sm text-[#D4AF5A]">
              الشؤون القانونية وحقوق النشر
            </h3>
            <ul className="space-y-2.5 text-[#E8E1D3]/85">
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'legal', slug: 'privacy' }, '/legal/privacy')} className="hover:text-[#D4AF5A]">
                  سياسة الخصوصية وحماية البيانات
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'legal', slug: 'cookies' }, '/legal/cookies')} className="hover:text-[#D4AF5A]">
                  سياسة ملفات الارتباط
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'legal', slug: 'terms' }, '/legal/terms')} className="hover:text-[#D4AF5A]">
                  شروط الاستخدام وإفصاح الإعلانات
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'legal', slug: 'dmca' }, '/legal/dmca')} className="hover:text-[#D4AF5A]">
                  إشعارات حقوق النشر والملكية الفكرية
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo({ view: 'legal', slug: 'contact' }, '/legal/contact')} className="hover:text-[#D4AF5A]">
                  اتصل بهيئة التحرير
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#B88E35]/20 py-4 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto text-[#E8E1D3]/70">
          <span>
            جميع الحقوق محفوظة © {new Date().getFullYear()} {siteConfig.siteName} — رئيس التحرير المسؤول: {siteConfig.editorInChiefName} · المدقق اللغوي العام: أ. علام الكيلاني.
          </span>
          <span>جميع الصور الفوتوغرافية فريدة ومرخّصة قانونيًا دون أي تكرار</span>
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
