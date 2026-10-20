export const CATEGORIES = [
  { id: "food", label: "الغذاء" },
  { id: "water", label: "المياه" },
  { id: "shelter", label: "المأوى" },
  { id: "clothing", label: "الملابس والأغطية" },
  { id: "health", label: "الصحة" },
  { id: "education", label: "التعليم" },
  { id: "general", label: "احتياج عام" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const CHANNEL_KINDS = [
  { id: "whatsapp", label: "واتساب" },
  { id: "email", label: "بريد إلكتروني" },
  { id: "bank", label: "حساب مالي" },
  { id: "inkind", label: "استلام مساعدة عينية" },
] as const;

export type ChannelKind = (typeof CHANNEL_KINDS)[number]["id"];

export type Stats = {
  familiesRegistered: number | null;
  familiesVerified: number | null;
  individuals: number | null;
  children: number | null;
  elderly: number | null;
  needFood: number | null;
  needClothing: number | null;
  needShelter: number | null;
  needHealth: number | null;
  needsCatalog: number | null;
  statsUpdatedOn: string | null;
};

export type AidItem = {
  id: number;
  deliveredOn: string;
  category: CategoryId;
  title: string;
  quantityLabel: string;
  published: boolean;
};

export type ChannelItem = {
  id: number;
  kind: ChannelKind;
  label: string;
  value: string;
  confirmed: boolean;
  published: boolean;
};

export type PublicCamp = {
  statsPublished: boolean;
  stats: Stats;
  note: string | null;
  aid: Array<Omit<AidItem, "published">>;
  channels: Array<Omit<ChannelItem, "confirmed" | "published">>;
};

export type AdminCamp = {
  claimed: boolean;
  statsPublished: boolean;
  stats: Stats;
  publicNote: string;
  notePublished: boolean;
  aid: AidItem[];
  channels: ChannelItem[];
};

export const EMPTY_STATS: Stats = {
  familiesRegistered: null,
  familiesVerified: null,
  individuals: null,
  children: null,
  elderly: null,
  needFood: null,
  needClothing: null,
  needShelter: null,
  needHealth: null,
  needsCatalog: null,
  statsUpdatedOn: null,
};

export const EMPTY_PUBLIC: PublicCamp = {
  statsPublished: false,
  stats: EMPTY_STATS,
  note: null,
  aid: [],
  channels: [],
};

export type Ok<T> = { ok: true; data: T };
export type Err = { ok: false; error: string };
export type Result<T> = Ok<T> | Err;

export const STAT_FIELDS: Array<{ key: keyof Stats; label: string; hint: string }> = [
  { key: "familiesRegistered", label: "الأسر المسجّلة", hint: "إجمالي الأسر المسجّلة في المخيم" },
  { key: "familiesVerified", label: "أسر تم التحقق منها", hint: "عدد الأسر التي تم التحقق من بياناتها" },
  { key: "individuals", label: "الأفراد", hint: "إجمالي عدد الأشخاص" },
  { key: "children", label: "الأطفال", hint: "عدد الأطفال" },
  { key: "elderly", label: "كبار السن", hint: "إن توفرت بيانات موثوقة فقط" },
  { key: "needFood", label: "دعم غذائي", hint: "أسر تحتاج إلى دعم غذائي" },
  { key: "needClothing", label: "ملابس وأغطية", hint: "أسر تحتاج إلى ملابس وأغطية" },
  { key: "needShelter", label: "دعم المأوى", hint: "أسر تحتاج إلى دعم في المأوى" },
  { key: "needHealth", label: "دعم صحي", hint: "أسر تحتاج إلى دعم صحي" },
  { key: "needsCatalog", label: "الاحتياجات المصنّفة", hint: "عدد الاحتياجات الإنسانية المسجّلة أو المصنّفة" },
];

export function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function isCategoryId(value: string): value is CategoryId {
  return CATEGORIES.some((c) => c.id === value);
}

export const HELP_MODES = ["specific", "general", "inkind", "share"] as const;
export type HelpMode = (typeof HELP_MODES)[number];

export function isHelpMode(value: string): value is HelpMode {
  return (HELP_MODES as readonly string[]).includes(value);
}
