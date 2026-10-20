const DIGITS = "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹";

export function normalizeDigits(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (ch) => {
    const index = DIGITS.indexOf(ch);
    return String(index % 10);
  });
}

export function parseOptionalInt(input: string): number | null | "bad" {
  const cleaned = normalizeDigits(input)
    .replace(/[,\s٬]/g, "")
    .trim();
  if (!cleaned) return null;
  if (!/^\d+$/.test(cleaned)) return "bad";
  const n = Number(cleaned);
  if (!Number.isSafeInteger(n) || n > 500_000) return "bad";
  return n;
}

const numberFormat = new Intl.NumberFormat("ar-EG-u-nu-latn");

export function formatInt(value: number): string {
  return numberFormat.format(value);
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(dt);
}
