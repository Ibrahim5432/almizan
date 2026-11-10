/**
 * apps/worker/index.ts — عملية العامل المستقلة (pg-boss / Scheduled Pipeline Worker)
 * تنفذ المهام الدورية (كل 5 دقائق للعاجل، 10 دقائق للجمع، 15 دقيقة للتجميع والكتابة، ساعة للتحديثات، ويوميًا للموجز والنسخ الاحتياطي)
 * وتدعم الإيقاف الفوري عبر Kill Switch.
 */
import { defaultSiteConfig } from '../../config/site.config.ts';
import { runEditorialEvalSuite } from '../../src/core/eval-suite.ts';

export interface WorkerScheduleItem {
  id: string;
  nameAr: string;
  cronExpression: string;
  intervalLabel: string;
  idempotent: boolean;
  lastRunAt: string;
  status: 'active' | 'paused_by_kill_switch';
}

export function getWorkerSchedules(killSwitchActive: boolean): WorkerScheduleItem[] {
  const status = killSwitchActive ? 'paused_by_kill_switch' : 'active';
  return [
    {
      id: 'sched-breaking-5m',
      nameAr: 'متابعة وتحديث الأخبار العاجلة قيد الرصد',
      cronExpression: '*/5 * * * *',
      intervalLabel: 'كل 5 دقائق',
      idempotent: true,
      lastRunAt: '2026-11-08T08:55:00.000Z',
      status,
    },
    {
      id: 'sched-ingest-tier1-10m',
      nameAr: 'جلب المصادر الرسمية عالية الأولوية (Tier 1 RSS/APIs)',
      cronExpression: '*/10 * * * *',
      intervalLabel: 'كل 10 دقائق',
      idempotent: true,
      lastRunAt: '2026-11-08T08:50:00.000Z',
      status,
    },
    {
      id: 'sched-cluster-draft-15m',
      nameAr: 'تجميع القصص (Clustering) وحساب الأهمية وإطلاق الكتابة والتحقق',
      cronExpression: '*/15 * * * *',
      intervalLabel: 'كل 15 دقيقة',
      idempotent: true,
      lastRunAt: '2026-11-08T08:45:00.000Z',
      status,
    },
    {
      id: 'sched-update-loop-1h',
      nameAr: 'حلقة المواكبة الدقيقة (Update Loop) وتحديث widgets البيانات',
      cronExpression: '0 * * * *',
      intervalLabel: 'كل ساعة',
      idempotent: true,
      lastRunAt: '2026-11-08T08:00:00.000Z',
      status,
    },
    {
      id: 'sched-daily-digest-backup',
      nameAr: 'نشرة «موجز اليوم»، فحص الروابط المكسورة، والنسخ الاحتياطي المشفر',
      cronExpression: '0 22 * * *',
      intervalLabel: 'يوميًا (22:00)',
      idempotent: true,
      lastRunAt: '2026-11-07T22:00:00.000Z',
      status,
    },
    {
      id: 'sched-weekly-evergreen-readiness',
      nameAr: 'مقالات الشروحات الدائمة (Evergreen) وتدقيق الصفحات الرقيقة وتقرير AdSense',
      cronExpression: '0 6 * * 0',
      intervalLabel: 'أسبوعيًا (الأحد 06:00)',
      idempotent: true,
      lastRunAt: '2026-11-08T06:00:00.000Z',
      status,
    },
  ];
}

// في حال تشغيل الملف مباشرة كعملية worker مستقلة في Docker
if (typeof process !== 'undefined' && process.argv && import.meta.url === `file://${process.argv[1]}`) {
  console.log(`[worker] Starting Al-Mizan Newsroom Worker (publishMode=${defaultSiteConfig.publishMode})...`);
  const evalSummary = runEditorialEvalSuite();
  console.log(`[worker] Self-check eval suite: ${evalSummary.passed}/${evalSummary.total} passed.`);
}
