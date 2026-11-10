# المعمارية التقنية للنظام (System Architecture)

## 1. مخطط المكونات الأساسية

```
+-----------------------------------------------------------------------------------+
|                           Cloudflare CDN / Caddy HTTPS                            |
|               (HSTS, Security Headers, stale-while-revalidate Cache)              |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                         Web & API Server (Port 3000)                              |
|  - SSR Metadata & JSON-LD Injection (NewsArticle, Organization, WebSite)          |
|  - Public RTL Broadsheet UI (Home, Article, Category, Tag, Search, 11 Legal Pages)|
|  - /admin Dashboard (Review Queue, Editor, Readiness Gate, Kill Switch, Eval Set) |
|  - Dynamic Feeds: /sitemap.xml, /news-sitemap.xml (<=48h), /rss.xml, /ads.txt     |
+-------------------+-----------------------------------+---------------------------+
                    |                                   |
                    v                                   v
+---------------------------------------+   +---------------------------------------+
|   Editorial Worker (apps/worker)      |   |   Database & Storage Layer            |
|  - Stage 1: Ingestion & SSRF Guard    |   |  - PostgreSQL 16 + pgvector + FTS     |
|  - Stage 2: Prompt Injection Defense  |   |    (packages/core/db-schema.sql)      |
|  - Stage 3: Clustering & Dedupe       |   |  - 18 Normalized Tables               |
|  - Stage 4: Newsworthiness & Quotas   |   |  - Typographic SVG & S3/R2 Media      |
|  - Stage 5: Grounded LLM Writer       |   |  - Encrypted Daily GPG Backups        |
|  - Stage 6: Independent Verifier +    |   +---------------------------------------+
|             N-Gram Shingle Check      |
|  - Stage 7: Risk Gate & Human Routing |
|  - Stage 8: Publish & IndexNow        |
|  - Stage 9: Substantive Update Loop   |
|  - Stage 10: Evergreen & Launch Ramp  |
+---------------------------------------+
```

## 2. توثيق المواءمة المعمارية (Tech Stack & Runtime Notes)

1. **توليد HTML والبيانات المهيكلة على الخادم (SSR Metadata & JSON-LD)**:
   - يقوم الخادم (`server.ts`) بفحص كل مسار وارد (`/`, `/:category/:slug`, `/tag/:slug`, `/search`, `/admin`) ويحقن على الخادم مباشرةً وسوم `<title>`, `<meta name="description">`, `<meta name="robots">`, وبيانات `application/ld+json` (`NewsArticle`, `NewsMediaOrganization`, `WebSite`) قبل إرسال الاستجابة للزواحف والمراجعين.
   - في صفحات الوسوم التي تضم أقل من 5 مقالات، يحقن الخادم تلقائيًا `<meta name="robots" content="noindex, follow" />` لمنع الصفحات الرقيقة (Thin Content).
2. **قاعدة البيانات والجدولة**:
   - يتضمن المشروع مخطط PostgreSQL 16 + `pgvector` الكامل المكون من 18 جدولًا في `packages/core/db-schema.sql` مع إعداد `docker-compose.yml` و`Caddyfile` للنشر الإنتاجي على خادم VPS.
   - وفي بيئة معاينة الحاوية الفورية، يعمل مستودع بيانات دائم (`data/newsroom-state.json`) يحاكي الجداول الـ 18 نفسها لضمان عمل المعاينة الحية والاختبارات دون انقطاع.
3. **طبقة الذكاء الاصطناعي (`packages/llm/provider.ts`)**:
   - معزولة خلف واجهة `LLMProvider` وتقرأ أسماء النماذج من متغيرات البيئة حصريًا (`LLM_MODEL_FAST`, `LLM_MODEL_WRITER`, `LLM_MODEL_VERIFIER`) عبر حزمة `@google/genai` الرسمية على الخادم مع التحقق الصارم بمخططات `Zod`.
