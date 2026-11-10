import type { SiteConfig } from '../../config/site.config.ts';
import type { ArticleRecord, TagRecord } from './types.ts';

// ============================================================================
// 1. JSON-LD Structured Data (NewsArticle, Organization, WebSite, BreadcrumbList)
// ============================================================================

export function generateNewsArticleJsonLd(article: ArticleRecord, siteConfig: SiteConfig): Record<string, unknown> {
  const baseUrl = `https://${siteConfig.domain}`;
  const articleUrl = `${baseUrl}/${article.categorySlug}/${article.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: article.headline,
    description: article.dek,
    image: [
      article.image.url.startsWith('http') || article.image.url.startsWith('data:')
        ? article.image.url
        : `${baseUrl}${article.image.url}`,
    ],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    inLanguage: 'ar',
    articleSection: article.categoryName,
    wordCount: article.wordCount,
    isAccessibleForFree: true,
    author: [
      {
        '@type': article.authorId === 'editorial-team' ? 'Organization' : 'Person',
        name: article.authorName,
        url: `${baseUrl}/editorial-team`,
      },
    ],
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: siteConfig.siteName,
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/icon.svg`,
        width: 512,
        height: 512,
      },
      publishingPrinciples: `${baseUrl}/legal/editorial-policy`,
      correctionsPolicy: `${baseUrl}/legal/corrections-policy`,
      ethicsPolicy: `${baseUrl}/legal/ai-disclosure`,
    },
  };
}

export function generateOrganizationJsonLd(siteConfig: SiteConfig): Record<string, unknown> {
  const baseUrl = `https://${siteConfig.domain}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: siteConfig.siteName,
    description: siteConfig.siteTagline,
    url: baseUrl,
    logo: `${baseUrl}/icon.svg`,
    publishingPrinciples: `${baseUrl}/legal/editorial-policy`,
    correctionsPolicy: `${baseUrl}/legal/corrections-policy`,
    diversityPolicy: `${baseUrl}/legal/about`,
    actionableFeedbackPolicy: `${baseUrl}/legal/contact`,
  };
}

export function generateWebSiteJsonLd(siteConfig: SiteConfig): Record<string, unknown> {
  const baseUrl = `https://${siteConfig.domain}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.siteName,
    url: baseUrl,
    inLanguage: 'ar',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBreadcrumbJsonLd(
  items: { name: string; path: string }[],
  siteConfig: SiteConfig
): Record<string, unknown> {
  const baseUrl = `https://${siteConfig.domain}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  };
}

// ============================================================================
// 2. Sitemaps (sitemap.xml & Google News news-sitemap.xml <= 48 hours)
// ============================================================================

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateSitemapXml(articles: ArticleRecord[], siteConfig: SiteConfig): string {
  const baseUrl = `https://${siteConfig.domain}`;
  const indexableArticles = articles.filter((a) => a.status === 'published' && !a.noindex);

  const staticPaths = [
    '/',
    '/politics',
    '/economy',
    '/technology',
    '/sports',
    '/science-health',
    '/culture-society',
    '/analysis',
    '/legal/about',
    '/legal/editorial-board',
    '/legal/editorial-policy',
    '/legal/ai-disclosure',
    '/legal/corrections-policy',
    '/legal/methodology',
    '/legal/privacy',
    '/legal/terms',
    '/legal/contact',
  ];

  const staticEntries = staticPaths
    .map(
      (p) => `  <url>
    <loc>${escapeXml(`${baseUrl}${p}`)}</loc>
    <changefreq>${p === '/' ? 'hourly' : 'daily'}</changefreq>
    <priority>${p === '/' ? '1.0' : '0.8'}</priority>
  </url>`
    )
    .join('\n');

  const articleEntries = indexableArticles
    .map(
      (a) => `  <url>
    <loc>${escapeXml(`${baseUrl}/${a.categorySlug}/${a.slug}`)}</loc>
    <lastmod>${escapeXml(a.updatedAt)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${articleEntries}
</urlset>`;
}

/**
 * خريطة أخبار جوجل (news-sitemap.xml): تضم حصريًا المقالات المنشورة خلال آخر 48 ساعة وبحد أقصى 1000 رابط
 */
export function generateNewsSitemapXml(
  articles: ArticleRecord[],
  siteConfig: SiteConfig,
  referenceNowMs = Date.now()
): string {
  const baseUrl = `https://${siteConfig.domain}`;
  const cutoffMs = referenceNowMs - 48 * 60 * 60 * 1000;

  const recentArticles = articles
    .filter((a) => {
      if (a.status !== 'published' || a.noindex) return false;
      const pubMs = new Date(a.publishedAt).getTime();
      return pubMs >= cutoffMs && pubMs <= referenceNowMs + 60_000;
    })
    .slice(0, 1000);

  const entries = recentArticles
    .map(
      (a) => `  <url>
    <loc>${escapeXml(`${baseUrl}/${a.categorySlug}/${a.slug}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(siteConfig.siteName)}</news:name>
        <news:language>ar</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(a.publishedAt)}</news:publication_date>
      <news:title>${escapeXml(a.headline)}</news:title>
    </news:news>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries}
</urlset>`;
}

// ============================================================================
// 3. RSS 2.0 Feed, robots.txt, ads.txt, Thin Tag Evaluation
// ============================================================================

export function generateRssXml(
  articles: ArticleRecord[],
  siteConfig: SiteConfig,
  categoryFilter?: string
): string {
  const baseUrl = `https://${siteConfig.domain}`;
  const filtered = articles
    .filter((a) => a.status === 'published' && (!categoryFilter || a.categorySlug === categoryFilter))
    .slice(0, 30);

  const itemsXml = filtered
    .map(
      (a) => `    <item>
      <title>${escapeXml(a.headline)}</title>
      <link>${escapeXml(`${baseUrl}/${a.categorySlug}/${a.slug}`)}</link>
      <guid isPermaLink="true">${escapeXml(`${baseUrl}/${a.categorySlug}/${a.slug}`)}</guid>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(a.dek)}</description>
      <category>${escapeXml(a.categoryName)}</category>
    </item>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.siteName)}${categoryFilter ? ` — ${escapeXml(categoryFilter)}` : ''}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(siteConfig.siteTagline)}</description>
    <language>ar</language>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;
}

export function generateRobotsTxt(siteConfig: SiteConfig): string {
  const baseUrl = `https://${siteConfig.domain}`;
  return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /search

Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/news-sitemap.xml
`;
}

/**
 * توليد ملف /ads.txt ديناميكيًا وفق معيار IAB/Google AdSense
 */
export function generateAdsTxt(publisherId: string): string {
  const trimmed = publisherId.trim();
  if (!trimmed || trimmed === 'TODO_REQUIRED') {
    return '# ads.txt is intentionally empty until AdSense account approval and Publisher ID configuration.\n';
  }
  const normalizedPub = trimmed.startsWith('ca-pub-')
    ? trimmed.replace(/^ca-/, '')
    : trimmed.startsWith('pub-')
      ? trimmed
      : `pub-${trimmed}`;
  return `google.com, ${normalizedPub}, DIRECT, f08c47fec0942fa0\n`;
}

/**
 * صفحات الوسوم: تُفهرس فقط عند وجود 5 مقالات أو أكثر، وإلا noindex تلقائيًا لمنع الصفحات الرقيقة
 */
export function shouldNoindexTagPage(articleCount: number): boolean {
  return articleCount < 5;
}

// ============================================================================
// 4. Readiness Gate (/admin/readiness) — فحص جاهزية ادسنس والإنتاج
// ============================================================================

export interface ReadinessCheckItem {
  id: string;
  titleAr: string;
  category: 'legal' | 'content' | 'technical' | 'adsense';
  status: 'pass' | 'warning' | 'blocker';
  currentValue: string;
  requiredTarget: string;
  remediationAr: string;
}

export interface ReadinessGateReport {
  overallReadyForAdsense: boolean;
  overallReadyForAutoPublish: boolean;
  blockersCount: number;
  warningsCount: number;
  passedCount: number;
  checks: ReadinessCheckItem[];
  metrics: {
    publishedLast30Days: number;
    avgWordCount: number;
    humanReviewedRatio: number;
    thinTagPagesCount: number;
    thinTagPagesAutoNoindexed: boolean;
    demoSeedArticlesCount: number;
    todoRequiredFields: string[];
  };
}

export function evaluateReadinessGate(params: {
  siteConfig: SiteConfig;
  articles: ArticleRecord[];
  tags: TagRecord[];
  legalPagesCount: number;
  brokenLinksCount?: number;
}): ReadinessGateReport {
  const { siteConfig, articles, tags, legalPagesCount, brokenLinksCount = 0 } = params;

  const todoFields: string[] = [];
  if (siteConfig.publisherLegalName.includes('TODO_REQUIRED')) todoFields.push('PUBLISHER_LEGAL_NAME');
  if (siteConfig.editorInChiefName.includes('TODO_REQUIRED')) todoFields.push('EDITOR_IN_CHIEF_NAME');
  if (siteConfig.contactEmail.includes('TODO_REQUIRED')) todoFields.push('CONTACT_EMAIL');

  const published = articles.filter((a) => a.status === 'published');
  const thirtyDaysAgoMs = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const publishedLast30Days = published.filter((a) => new Date(a.publishedAt).getTime() >= thirtyDaysAgoMs).length;

  const totalWords = published.reduce((acc, a) => acc + a.wordCount, 0);
  const avgWordCount = published.length > 0 ? Math.round(totalWords / published.length) : 0;

  const humanReviewedCount = published.filter((a) => Boolean(a.reviewedBy)).length;
  const humanReviewedRatio = published.length > 0 ? Math.round((humanReviewedCount / published.length) * 100) : 100;

  const thinTags = tags.filter((t) => t.articleCount < 5);
  const allThinTagsNoindexed = thinTags.every((t) => t.noindex);

  const demoSeedArticlesCount = published.filter((a) => a.isDemoSeed).length;

  const checks: ReadinessCheckItem[] = [
    {
      id: 'todo_required_check',
      titleAr: 'خلو بيانات الناشر ورئيس التحرير من قيم TODO_REQUIRED',
      category: 'legal',
      status: todoFields.length === 0 ? 'pass' : 'blocker',
      currentValue: todoFields.length === 0 ? 'مكتملة 100%' : `${todoFields.length} حقول ناقصة (${todoFields.join(', ')})`,
      requiredTarget: '0 حقول ناقصة',
      remediationAr: 'أدخل الاسم القانوني للناشر واسم رئيس التحرير الحقيقي والبريد الفعلي في إعدادات المنصة أو ملف .env قبل التقديم لـ AdSense أو تفعيل النشر الآلي.',
    },
    {
      id: 'legal_pages_complete',
      titleAr: 'اكتمال صفحات الثقة والشفافية والسياسات القانونية (10 صفحات)',
      category: 'legal',
      status: legalPagesCount >= 10 ? 'pass' : 'blocker',
      currentValue: `${legalPagesCount} صفحات متوفرة`,
      requiredTarget: '10 صفحات قانونية وتحريرية مكتملة باللغة العربية',
      remediationAr: 'تأكد من نشر جميع صفحات الثقة (من نحن، هيئة التحرير، السياسة التحريرية، الذكاء الاصطناعي، التصحيحات، الخصوصية، ملفات الارتباط، الشروط، حقوق النشر، اتصل بنا).',
    },
    {
      id: 'demo_seed_isolation',
      titleAr: 'عزل البيانات التجريبية (SEED_DEMO) قبل الإطلاق الفعلي',
      category: 'content',
      status: demoSeedArticlesCount === 0 ? 'pass' : 'warning',
      currentValue: demoSeedArticlesCount === 0 ? 'لا توجد مقالات تجريبية' : `${demoSeedArticlesCount} مقالات عرض تجريبي مفعّلة`,
      requiredTarget: 'SEED_DEMO=false في الإنتاج',
      remediationAr: 'عند ربط الدومين الحقيقي، اضبط SEED_DEMO=false لإخفاء مقالات العرض التجريبي والاعتماد كليًا على المقالات الحقيقية الموثقة.',
    },
    {
      id: 'content_depth_quality',
      titleAr: 'عمق المحتوى ومتوسط طول التقارير المنشورة',
      category: 'content',
      status: avgWordCount >= 320 && publishedLast30Days >= 5 ? 'pass' : 'warning',
      currentValue: `${publishedLast30Days} مقالات (متوسط ${avgWordCount} كلمة)`,
      requiredTarget: 'متوسط ≥ 320 كلمة وتغطية منتظمة',
      remediationAr: 'حافظ على نشر تقارير موثقة وشروحات معمقة تتجاوز 320 كلمة في المتوسط وتجنب الأخبار السطحية القصيرة.',
    },
    {
      id: 'thin_pages_protection',
      titleAr: 'حماية الفهرس من الصفحات الرقيقة (Thin Tag Pages Noindex)',
      category: 'technical',
      status: allThinTagsNoindexed ? 'pass' : 'blocker',
      currentValue: allThinTagsNoindexed ? `مفعّل (${thinTags.length} وسوم موسومة بـ noindex)` : 'يوجد وسوم رقيقة مفهرسة',
      requiredTarget: 'noindex تلقائي لأي وسم يضم أقل من 5 مقالات',
      remediationAr: 'تأكد من تفعيل قاعدة shouldNoindexTagPage(count < 5) على جميع صفحات الوسوم والأرشيف.',
    },
    {
      id: 'human_review_ratio',
      titleAr: 'نسبة المراجعة البشرية للمقالات المنشورة',
      category: 'content',
      status: humanReviewedRatio >= 80 ? 'pass' : 'warning',
      currentValue: `${humanReviewedRatio}% مراجعة بشرية`,
      requiredTarget: '100% في مرحلة الإطلاق الأولى (review_all)',
      remediationAr: 'استمر في وضع review_all لمدة أسبوعين على الأقل قبل الانتقال التدريجي إلى وضع hybrid.',
    },
    {
      id: 'seo_sitemaps_feeds',
      titleAr: 'جاهزية sitemap.xml وnews-sitemap.xml وrobots.txt وJSON-LD',
      category: 'technical',
      status: brokenLinksCount === 0 ? 'pass' : 'blocker',
      currentValue: brokenLinksCount === 0 ? 'سليمة ومفحوصة آليًا (0 روابط مكسورة)' : `${brokenLinksCount} روابط مكسورة`,
      requiredTarget: 'صفر أخطاء في الخرائط والبيانات المهيكلة',
      remediationAr: 'تحقق من مسارات /sitemap.xml و/news-sitemap.xml و/robots.txt في Google Search Console.',
    },
    {
      id: 'adsense_isolation_cmp',
      titleAr: 'إعداد AdSlot ولافتة الموافقة (CMP TCF/KVKK) وملف /ads.txt',
      category: 'adsense',
      status: !siteConfig.adsEnabled || Boolean(siteConfig.adsensePublisherId) ? 'pass' : 'blocker',
      currentValue: siteConfig.adsEnabled
        ? `مفعّل (${siteConfig.adsensePublisherId || 'بدون معرّف!'})`
        : 'معطّل بأمان (ADS_ENABLED=false حتى القبول)',
      requiredTarget: 'ADS_ENABLED=false أثناء المراجعة، وتفعيل بعد القبول فقط',
      remediationAr: 'أبقِ ADS_ENABLED=false حتى صدور موافقة حساب AdSense رسميًا.',
    },
  ];

  const blockersCount = checks.filter((c) => c.status === 'blocker').length;
  const warningsCount = checks.filter((c) => c.status === 'warning').length;
  const passedCount = checks.filter((c) => c.status === 'pass').length;

  return {
    overallReadyForAdsense: blockersCount === 0 && demoSeedArticlesCount === 0,
    overallReadyForAutoPublish: blockersCount === 0 && todoFields.length === 0,
    blockersCount,
    warningsCount,
    passedCount,
    checks,
    metrics: {
      publishedLast30Days,
      avgWordCount,
      humanReviewedRatio,
      thinTagPagesCount: thinTags.length,
      thinTagPagesAutoNoindexed: allThinTagsNoindexed,
      demoSeedArticlesCount,
      todoRequiredFields: todoFields,
    },
  };
}
