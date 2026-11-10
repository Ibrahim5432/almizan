-- ============================================================================
-- الميزان الإخباري — PostgreSQL + pgvector Schema Migration (0001_initial.sql)
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. sources (المصادر الإخبارية المرخّصة والرسمية)
CREATE TABLE IF NOT EXISTS sources (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(32) NOT NULL CHECK (type IN ('rss', 'api', 'official_site')),
  url TEXT NOT NULL UNIQUE,
  tier SMALLINT NOT NULL CHECK (tier IN (1, 2, 3)),
  language VARCHAR(12) NOT NULL DEFAULT 'ar',
  license_notes TEXT NOT NULL,
  robots_ok BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  fetch_interval_min INTEGER NOT NULL DEFAULT 30,
  last_fetched_at TIMESTAMPTZ,
  error_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. story_clusters (تجميع الأحداث المتشابهة: حدث واحد = مقال واحد يُحدَّث)
CREATE TABLE IF NOT EXISTS story_clusters (
  id VARCHAR(64) PRIMARY KEY,
  topic_label VARCHAR(255) NOT NULL,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  newsworthiness_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL CHECK (status IN ('new', 'drafted', 'published', 'rejected', 'stale'))
);

-- 3. raw_items (المدخلات الأولية — يُحظر تخزين النص الكامل لمقالات الآخرين، <= 400 حرف فقط)
CREATE TABLE IF NOT EXISTS raw_items (
  id VARCHAR(64) PRIMARY KEY,
  source_id VARCHAR(64) NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  url TEXT NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  snippet VARCHAR(400) NOT NULL CHECK (char_length(snippet) <= 400),
  published_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  content_hash VARCHAR(128) NOT NULL,
  embedding vector(768),
  cluster_id VARCHAR(64) REFERENCES story_clusters(id) ON DELETE SET NULL,
  status VARCHAR(32) NOT NULL CHECK (status IN ('ingested', 'clustered', 'drafted', 'rejected'))
);
CREATE INDEX IF NOT EXISTS idx_raw_items_cluster ON raw_items(cluster_id);
CREATE INDEX IF NOT EXISTS idx_raw_items_hash ON raw_items(content_hash);

-- 4. categories (الأقسام التحريرية)
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  low_risk_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  daily_quota INTEGER NOT NULL DEFAULT 2,
  article_count INTEGER NOT NULL DEFAULT 0
);

-- 5. authors (أشخاص حقيقيون أو "فريق التحرير" — يُحظر إنشاء كتّاب وهميين)
CREATE TABLE IF NOT EXISTS authors (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  role_title VARCHAR(160) NOT NULL,
  bio TEXT NOT NULL,
  is_editorial_team BOOLEAN NOT NULL DEFAULT FALSE,
  email VARCHAR(255)
);

-- 6. images (الصور والبطاقات الطباعية مع بيانات الترخيص والإسناد)
CREATE TABLE IF NOT EXISTS images (
  id VARCHAR(64) PRIMARY KEY,
  url TEXT NOT NULL,
  alt VARCHAR(300) NOT NULL,
  caption TEXT NOT NULL,
  credit VARCHAR(255) NOT NULL,
  license VARCHAR(120) NOT NULL,
  source_url TEXT,
  strategy VARCHAR(32) NOT NULL CHECK (strategy IN ('stock', 'typographic', 'ai_illustrative')),
  is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
  width INTEGER NOT NULL DEFAULT 1200,
  height INTEGER NOT NULL DEFAULT 675
);

-- 7. articles (المقالات والتقارير الصحفية)
CREATE TABLE IF NOT EXISTS articles (
  id VARCHAR(64) PRIMARY KEY,
  cluster_id VARCHAR(64) REFERENCES story_clusters(id) ON DELETE SET NULL,
  type VARCHAR(32) NOT NULL CHECK (type IN ('news', 'breaking', 'analysis', 'explainer', 'roundup', 'data')),
  slug VARCHAR(200) NOT NULL UNIQUE,
  headline VARCHAR(120) NOT NULL,
  dek VARCHAR(250) NOT NULL,
  body_md TEXT NOT NULL,
  body_html TEXT NOT NULL,
  key_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  background_section TEXT,
  analysis_section TEXT,
  what_next_section TEXT,
  category_id VARCHAR(64) NOT NULL REFERENCES categories(id),
  author_id VARCHAR(64) NOT NULL REFERENCES authors(id),
  image_id VARCHAR(64) REFERENCES images(id),
  status VARCHAR(32) NOT NULL CHECK (status IN ('draft', 'needs_review', 'approved', 'scheduled', 'published', 'unpublished')),
  risk_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  sensitivity_level VARCHAR(24) NOT NULL DEFAULT 'normal' CHECK (sensitivity_level IN ('normal', 'elevated', 'high_no_ads')),
  confidence NUMERIC(4,3) NOT NULL DEFAULT 0,
  max_similarity_score NUMERIC(4,3) NOT NULL DEFAULT 0,
  word_count INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by VARCHAR(160),
  publish_mode_used VARCHAR(32) NOT NULL DEFAULT 'review_all',
  canonical_url TEXT NOT NULL,
  noindex BOOLEAN NOT NULL DEFAULT FALSE,
  is_demo_seed BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_articles_status_pub ON articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_fts ON articles USING GIN (to_tsvector('arabic', headline || ' ' || dek || ' ' || body_md));

-- 8. article_versions (سجل التعديلات الكامل مع diff وسبب التعديل)
CREATE TABLE IF NOT EXISTS article_versions (
  id VARCHAR(64) PRIMARY KEY,
  article_id VARCHAR(64) NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  headline VARCHAR(120) NOT NULL,
  body_md TEXT NOT NULL,
  diff_summary TEXT NOT NULL,
  change_reason TEXT NOT NULL,
  edited_by VARCHAR(160) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. article_sources (المصادر المسندة لكل مقال)
CREATE TABLE IF NOT EXISTS article_sources (
  id VARCHAR(64) PRIMARY KEY,
  article_id VARCHAR(64) NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  raw_item_id VARCHAR(64) REFERENCES raw_items(id) ON DELETE SET NULL,
  publisher VARCHAR(200) NOT NULL,
  title VARCHAR(400) NOT NULL,
  url TEXT NOT NULL,
  tier SMALLINT NOT NULL DEFAULT 1,
  role VARCHAR(32) NOT NULL CHECK (role IN ('primary', 'supporting', 'official'))
);

-- 10. claims (الادعاءات والوقائع المفحوصة آليًا)
CREATE TABLE IF NOT EXISTS claims (
  id VARCHAR(64) PRIMARY KEY,
  article_id VARCHAR(64) NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  source_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verifier_notes TEXT NOT NULL
);

-- 11. corrections (التصحيحات العلنية أسفل المقال وفي سجل التصحيحات)
CREATE TABLE IF NOT EXISTS corrections (
  id VARCHAR(64) PRIMARY KEY,
  article_id VARCHAR(64) NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  corrected_by VARCHAR(160) NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. tags (الوسوم مع عداد المقالات لقاعدة >= 5 مقالات للفهرسة)
CREATE TABLE IF NOT EXISTS tags (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  article_count INTEGER NOT NULL DEFAULT 0
);

-- 13. jobs_log (سجل مهام pg-boss وخط الأنابيب)
CREATE TABLE IF NOT EXISTS jobs_log (
  id VARCHAR(64) PRIMARY KEY,
  job_name VARCHAR(120) NOT NULL,
  stage VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'skipped')),
  duration_ms INTEGER NOT NULL DEFAULT 0,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. llm_usage (تتبع استهلاك التوكنات والتكلفة بالدولار مقابل الميزانية الشهرية)
CREATE TABLE IF NOT EXISTS llm_usage (
  id VARCHAR(64) PRIMARY KEY,
  stage VARCHAR(64) NOT NULL,
  model VARCHAR(120) NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd NUMERIC(8,5) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. audit_log (سجل التدقيق الأمني والتحريري)
CREATE TABLE IF NOT EXISTS audit_log (
  id VARCHAR(64) PRIMARY KEY,
  actor VARCHAR(160) NOT NULL,
  role VARCHAR(32) NOT NULL CHECK (role IN ('admin', 'editor', 'reviewer', 'system')),
  action VARCHAR(120) NOT NULL,
  target_id VARCHAR(120),
  notes TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. settings (الإعدادات الديناميكية ومفتاح الإيقاف)
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(120) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. subscribers (مشتركو النشرة البريدية بنظام Double Opt-In)
CREATE TABLE IF NOT EXISTS subscribers (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  confirmation_token VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. rejections (سجل العناصر والمسودات المرفوضة للتدقيق والتعلم)
CREATE TABLE IF NOT EXISTS rejections (
  id VARCHAR(64) PRIMARY KEY,
  raw_item_id VARCHAR(64),
  cluster_id VARCHAR(64),
  stage VARCHAR(64) NOT NULL,
  reason_code VARCHAR(80) NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
