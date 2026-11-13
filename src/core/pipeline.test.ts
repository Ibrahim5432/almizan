import test from 'node:test';
import assert from 'node:assert/strict';
import {
  decodeAndCleanRssText,
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

test('truncateAtWordBoundary never cuts Arabic words in half or leaves dangling particles', () => {
  const sample =
    'تغطية إخبارية تسلط الضوء على تفاصيل إطلاق مشروع الطاقة الشمسية في المحافظات السورية وأبرز المعطيات الصادرة عن المؤسسات الرسمية';
  const truncated = truncateAtWordBoundary(sample, 85, true);
  assert.ok(!truncated.endsWith('وأب…'), `Should not end with cut-off word وأب: ${truncated}`);
  assert.ok(!truncated.endsWith('في…'), `Should not end with dangling particle في: ${truncated}`);
  assert.ok(truncated.includes('المحافظات السورية'), `Should keep whole words: ${truncated}`);
});

test('isAuthenticArabicEditorialText blocks foreign headlines and accepts Arabic news', () => {
  const englishCheck = isAuthenticArabicEditorialText(
    'Eisenkot vows to undo Netanyahu policies as Israeli parliament opens',
    'Eisenkot vows to undo Netanyahu policies as Israeli parliament opens'
  );
  assert.equal(englishCheck.valid, false);

  const arabicCheck = isAuthenticArabicEditorialText(
    'عاجل | إطلاق خطة الطوارئ الكهربائية لتغذية المدن الصناعية والمشافي في دمشق وحلب وحمص',
    'بيانات رسمية من دمشق وحلب تؤكد ربط محطات التحويل الجديدة بمشاريع التوليد الشمسي والغازي.'
  );
  assert.equal(arabicCheck.valid, true);
});

test('INITIAL_AUTHORS includes Chief Editor Ibrahim, Chief Proofreader Allam Al-Kilani, and 100 journalists', () => {
  assert.equal(INITIAL_AUTHORS.length, 102);
  const proofreader = INITIAL_AUTHORS.find((a) => a.id === 'proofreader-allam');
  assert.ok(proofreader, 'Chief Proofreader Allam Al-Kilani must be present in INITIAL_AUTHORS');
  assert.ok(proofreader.name.includes('علام الكيلاني'));
});

test('INITIAL_ARTICLES has 100% unique images with zero duplicates and zero cut-off words', () => {
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
    assert.ok(!art.dek.endsWith('وأب'), `Article ${art.id} dek has cut-off word: ${art.dek}`);
    assert.ok(!art.bodyMd.includes('"تحت الر"'), `Article ${art.id} body has cut-off quote`);
  }
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
