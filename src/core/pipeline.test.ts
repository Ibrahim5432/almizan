import test from 'node:test';
import assert from 'node:assert/strict';
import {
  auditArticleWordByWord,
  auditSentenceWordByWord,
  curateMagazineArticlesOrder,
  decodeAndCleanRssText,
  inspectArticleHeadlineContentAlignment,
  isAuthenticArabicEditorialText,
  proofreadAndDeduplicateArticles,
  truncateAtWordBoundary,
} from './pipeline.ts';
import { INITIAL_ARTICLES, INITIAL_AUTHORS } from './seed-data.ts';

test('decodeAndCleanRssText decodes HTML entities and strips tags cleanly', () => {
  const dirty = '<p>اجتماع &quot;عربي&quot; &#160;في دمشق &#x2014; قراءة في التفاصيل</p>';
  const cleaned = decodeAndCleanRssText(dirty);
  assert.ok(!cleaned.includes('&quot;'));
  assert.ok(!cleaned.includes('&#'));
  assert.ok(!cleaned.includes('<p>'));
  assert.ok(cleaned.includes('"عربي"'));
});

test('truncateAtWordBoundary and auditSentenceWordByWord never cut Arabic words or clauses in half', () => {
  const sample =
    'تغطية إخبارية تسلط الضوء على تفاصيل إطلاق مشروع الطاقة الشمسية في المحافظات السورية وأبرز المعطيات الصادرة عن المؤسسات الرسمية';
  const truncated = truncateAtWordBoundary(sample, 85, true);
  assert.ok(!truncated.endsWith('وأب…'), `Should not end with cut-off word وأب: ${truncated}`);
  assert.ok(!truncated.endsWith('في…'), `Should not end with dangling particle في: ${truncated}`);
  assert.ok(truncated.includes('المحافظات السورية'), `Should keep whole words: ${truncated}`);

  const jumbled =
    'واشنطن: أعلنت شركة مايكروسوفت استعادة خدماتها بالكامل. وذكرت الشركة.';
  const fixedSentence = auditSentenceWordByWord(jumbled);
  assert.ok(!fixedSentence.startsWith('واشنطن:'), 'Should strip wire city prefix');
  assert.ok(!fixedSentence.includes('وذكرت الشركة'), 'Should strip dangling trailing stub');
});

test('isAuthenticArabicEditorialText blocks foreign, off-brand, and incomplete stub headlines', () => {
  const englishCheck = isAuthenticArabicEditorialText(
    'Eisenkot vows to undo Netanyahu policies as Israeli parliament opens',
    'Eisenkot vows to undo Netanyahu policies as Israeli parliament opens'
  );
  assert.equal(englishCheck.valid, false);

  const stubCheck = isAuthenticArabicEditorialText(
    'عاجل | مستشفى الشفاء: شهيدان ومصابون في غارة',
    'التفاصيل بعد قليل..'
  );
  assert.equal(stubCheck.valid, false);

  const arabicCheck = isAuthenticArabicEditorialText(
    'عاجل | إطلاق خطة الطوارئ الكهربائية لتغذية المدن الصناعية والمشافي في دمشق وحلب وحمص',
    'بيانات رسمية من دمشق وحلب تؤكد ربط محطات التحويل الجديدة بمشاريع التوليد الشمسي والغازي.'
  );
  assert.equal(arabicCheck.valid, true);
});

test('INITIAL_AUTHORS includes Chief Editor Ibrahim, Layout Director Mazen, Alignment Inspector Hussam, Word Monitor Abdulrahman, Proofreader Allam, and 100 journalists', () => {
  assert.equal(INITIAL_AUTHORS.length, 105);
  const layoutDirector = INITIAL_AUTHORS.find((a) => a.id === 'layout-director-mazen');
  const alignmentInspector = INITIAL_AUTHORS.find((a) => a.id === 'alignment-inspector-hussam');
  const wordMonitor = INITIAL_AUTHORS.find((a) => a.id === 'word-monitor-abdulrahman');
  const proofreader = INITIAL_AUTHORS.find((a) => a.id === 'proofreader-allam');
  assert.ok(layoutDirector && layoutDirector.name.includes('مازن الدمشقي'));
  assert.ok(alignmentInspector && alignmentInspector.name.includes('حسام الشامي'));
  assert.ok(wordMonitor && wordMonitor.name.includes('عبد الرحمن الحموي'));
  assert.ok(proofreader && proofreader.name.includes('علام الكيلاني'));
});

test('INITIAL_ARTICLES has 100% unique images, preserves authentic leads, and has zero jumbled or meta-quoted sentences', () => {
  const urls = INITIAL_ARTICLES.map((a) => a.image.url);
  const uniqueUrls = new Set(urls);
  assert.equal(
    uniqueUrls.size,
    urls.length,
    `Expected ${urls.length} unique image URLs, got ${uniqueUrls.size}`
  );

  for (const art of INITIAL_ARTICLES) {
    const check = isAuthenticArabicEditorialText(art.headline, art.dek);
    assert.equal(check.valid, true, `Article ${art.id} failed Arabic check: ${art.headline}`);
    assert.ok(
      !art.dek.startsWith('تغطية إخبارية معمّقة تسلط الضوء على تفاصيل'),
      `Article ${art.id} dek must not be overwritten by generic meta-boilerplate: ${art.dek}`
    );
    assert.ok(
      !art.bodyMd.includes('«تغطية إخبارية'),
      `Article ${art.id} body must not contain nested meta-quotes`
    );
    assert.ok(
      !art.bodyMd.startsWith('أوردت «'),
      `Article ${art.id} must preserve its authentic journalistic lead instead of starting with template أوردت`
    );
    assert.ok(
      !art.bodyMd.includes('قاعدة البيانات الإحصائية الرسمية (مصدر مساند)'),
      `Article ${art.id} must not include raw source placeholder in prose`
    );
  }
});

test('auditArticleWordByWord and inspectArticleHeadlineContentAlignment repair corrupted deks and restore authentic leads', () => {
  const corrupted = {
    ...INITIAL_ARTICLES[0],
    id: 'test-corrupted-1',
    headline: 'اعتماد 16 ملعبًا في المنطقة العربية وتركيا لاستضافة البطولات القارية الكبرى',
    dek: 'تغطية إخبارية معمّقة تسلط الضوء على تفاصيل «اعتماد 16 ملعبًا» وأبرز',
    bodyMd:
      'أوردت «الاتحاد الآسيوي» في أحدث تقاريرها معطيات تتعلق بملف «اعتماد 16 ملعبًا».\n\nوتشير المعطيات الموثقة في التقرير إلى أن «تغطية إخبارية معمّقة تسلط الضوء على تفاصيل «اعتماد 16 ملعبًا» وأبرز»، وهو ما يضع هذا الملف في صدارة الأولويات.',
    categorySlug: 'economy' as const,
    categoryName: 'الاقتصاد والأعمال',
  };
  const audited = auditArticleWordByWord(corrupted);
  assert.ok(!audited.auditedArticle.dek.startsWith('تغطية إخبارية'), 'Corrupted meta-dek must be replaced');
  assert.ok(!audited.auditedArticle.bodyMd.includes('«تغطية إخبارية'), 'Nested meta-quote must be removed');

  const inspection = inspectArticleHeadlineContentAlignment(corrupted);
  assert.equal(inspection.alignedArticle.categorySlug, 'sports', 'Stadium headline must be aligned to sports category');
  assert.ok(inspection.alignedArticle.image.caption.includes('اعتماد 16 ملعبًا'), 'Image caption must reference headline');

  const curated = curateMagazineArticlesOrder([
    inspection.alignedArticle,
    { ...INITIAL_ARTICLES[0], id: 'test-syria-lead', categorySlug: 'syria' as const },
  ]);
  assert.equal(curated[0].categorySlug, 'syria', 'Syrian news must lead the curated magazine order');
});

test('proofreadAndDeduplicateArticles purges foreign articles and deduplicates repeated image URLs', () => {
  const sampleArticles = [
    {
      ...INITIAL_ARTICLES[0],
      id: 'test-art-1',
      image: { ...INITIAL_ARTICLES[0].image, url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=85' },
    },
    {
      ...INITIAL_ARTICLES[1],
      id: 'test-art-2',
      image: { ...INITIAL_ARTICLES[1].image, url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=85' },
    },
    {
      ...INITIAL_ARTICLES[2],
      id: 'test-art-english',
      headline: 'Eisenkot vows to undo Netanyahu policies as Israeli parliament opens',
      dek: 'Eisenkot vows to undo Netanyahu policies as Israeli parliament opens',
    },
  ];

  const cleaned = proofreadAndDeduplicateArticles(sampleArticles);
  assert.equal(cleaned.length, 2, 'English article must be purged');
  assert.notEqual(
    cleaned[0].image.url,
    cleaned[1].image.url,
    'Duplicate image URLs must be replaced with unique images'
  );
});

