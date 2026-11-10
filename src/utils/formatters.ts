/**
 * أدوات تنسيق الأرقام (الغربية 0-9 أو الهندية الشرقية ٠-٩) والتواريخ الميلادية والهجرية
 */

const EASTERN_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function formatNumerals(input: string | number, system: 'western' | 'eastern' = 'western'): string {
  const str = String(input);
  if (system === 'western') return str;
  return str.replace(/\d/g, (d) => EASTERN_DIGITS[Number(d)] ?? d);
}

export function formatArabicDate(isoDate: string, numeralSystem: 'western' | 'eastern' = 'western'): string {
  try {
    const date = new Date(isoDate);
    const formatted = new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      numberingSystem: numeralSystem === 'eastern' ? 'arab' : 'latn',
    }).format(date);
    return formatNumerals(formatted, numeralSystem);
  } catch {
    return isoDate;
  }
}

export function getTodayHijriAndGregorian(numeralSystem: 'western' | 'eastern' = 'western'): {
  hijri: string;
  gregorian: string;
} {
  const now = new Date('2026-11-08T09:00:00Z');
  try {
    const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      numberingSystem: numeralSystem === 'eastern' ? 'arab' : 'latn',
    }).format(now);

    const gregorian = new Intl.DateTimeFormat('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      numberingSystem: numeralSystem === 'eastern' ? 'arab' : 'latn',
    }).format(now);

    return {
      hijri: formatNumerals(hijri, numeralSystem),
      gregorian: formatNumerals(gregorian, numeralSystem),
    };
  } catch {
    return {
      hijri: 'الأحد 28 جمادى الأولى 1448 هـ',
      gregorian: '8 نوفمبر 2026 م',
    };
  }
}

export const RISK_FLAG_LABELS_AR: Record<string, string> = {
  death_with_names: 'بوابة بشرية: أخبار وفيات بأسماء',
  criminal_accusations: 'بوابة بشرية: اتهامات جنائية أو قضائية',
  medical_health_advice: 'بوابة بشرية: صحة وأدوية ولقاحات',
  financial_investment_advice: 'بوابة بشرية: نصائح مالية واستثمارية',
  elections_candidates: 'بوابة بشرية: انتخابات ومرشحون',
  conflict_casualties: 'بوابة بشرية: أرقام ضحايا في النزاعات',
  minors_protection: 'بوابة بشرية: قضايا تمس القاصرين',
  religious_controversy: 'بوابة بشرية: جدل ديني',
  leaked_materials: 'بوابة بشرية: مواد أو وثائق مسربة',
  contradictory_source_numbers: 'تنبيه المدقق: تفاوت أرقام بين المصادر',
};
