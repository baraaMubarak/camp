import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  CATEGORIES,
  CHANNEL_KINDS,
  EMPTY_PUBLIC,
  EMPTY_STATS,
  DEFAULT_CAMP_NAME,
  type AdminCamp,
  type AidItem,
  type CategoryId,
  type ChannelItem,
  type ChannelKind,
  type Err,
  type PublicCamp,
  type Result,
  type Stats,
} from "@/lib/camp-types";

const PASS_MIN = 8;
const PASS_MAX = 72;

const categoryIds = CATEGORIES.map((c) => c.id) as [CategoryId, ...CategoryId[]];
const channelKinds = CHANNEL_KINDS.map((c) => c.id) as [ChannelKind, ...ChannelKind[]];

const optionalInt = z.number().int().min(0).max(500_000).nullable();
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const statsSchema = z.object({
  passphrase: z.string().min(PASS_MIN).max(PASS_MAX),
  familiesRegistered: optionalInt,
  familiesVerified: optionalInt,
  individuals: optionalInt,
  children: optionalInt,
  elderly: optionalInt,
  needFood: optionalInt,
  needClothing: optionalInt,
  needShelter: optionalInt,
  needHealth: optionalInt,
  needsCatalog: optionalInt,
  statsUpdatedOn: day.nullable(),
  statsPublished: z.boolean(),
  publicNote: z.string().max(400),
  notePublished: z.boolean(),
  campName: z.string().trim().min(2).max(60),
});

const passSchema = z.object({
  passphrase: z.string().min(PASS_MIN).max(PASS_MAX),
});

const setupSchema = z.object({
  passphrase: z.string().min(PASS_MIN).max(PASS_MAX),
});

const changeSchema = z.object({
  current: z.string().min(PASS_MIN).max(PASS_MAX),
  next: z.string().min(PASS_MIN).max(PASS_MAX),
});

const aidSchema = z.object({
  passphrase: z.string().min(PASS_MIN).max(PASS_MAX),
  deliveredOn: day,
  category: z.enum(categoryIds),
  title: z.string().trim().min(3).max(80),
  quantityLabel: z.string().trim().min(1).max(40),
  published: z.boolean(),
});

const toggleSchema = z.object({
  passphrase: z.string().min(PASS_MIN).max(PASS_MAX),
  id: z.number().int().positive(),
  published: z.boolean(),
});

const channelSchema = z.object({
  passphrase: z.string().min(PASS_MIN).max(PASS_MAX),
  kind: z.enum(channelKinds),
  label: z.string().trim().min(2).max(60),
  value: z.string().trim().min(3).max(180),
  confirmed: z.boolean(),
  published: z.boolean(),
});

type SettingsRow = {
  families_registered: number | null;
  families_verified: number | null;
  individuals: number | null;
  children: number | null;
  elderly: number | null;
  need_food: number | null;
  need_clothing: number | null;
  need_shelter: number | null;
  need_health: number | null;
  needs_catalog: number | null;
  stats_updated_on: string | null;
  stats_published: boolean | string | number;
  public_note: string | null;
  note_published: boolean | string | number;
  camp_name?: string | null;
};

type AidRow = {
  id: number;
  delivered_on: string;
  category: string;
  title: string;
  quantity_label: string;
  published: boolean | string | number;
};

type ChannelRow = {
  id: number;
  kind: string;
  label: string;
  value: string;
  confirmed: boolean | string | number;
  published: boolean | string | number;
};

function fail(error: string): Err {
  return { ok: false, error };
}

function asBool(value: unknown): boolean {
  return value === true || value === "t" || value === "true" || value === 1;
}

function asName(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_CAMP_NAME;
  const name = value.trim();
  return name || DEFAULT_CAMP_NAME;
}

function asInt(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function asDay(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") return value.slice(0, 10);
  return null;
}

function asCategory(value: string): CategoryId {
  return CATEGORIES.some((c) => c.id === value) ? (value as CategoryId) : "general";
}

function asKind(value: string): ChannelKind {
  return CHANNEL_KINDS.some((c) => c.id === value) ? (value as ChannelKind) : "inkind";
}

function hasLongDigits(value: string): boolean {
  return /\d{8,}/.test(value);
}

function mapStats(row: SettingsRow): Stats {
  return {
    familiesRegistered: asInt(row.families_registered),
    familiesVerified: asInt(row.families_verified),
    individuals: asInt(row.individuals),
    children: asInt(row.children),
    elderly: asInt(row.elderly),
    needFood: asInt(row.need_food),
    needClothing: asInt(row.need_clothing),
    needShelter: asInt(row.need_shelter),
    needHealth: asInt(row.need_health),
    needsCatalog: asInt(row.needs_catalog),
    statsUpdatedOn: asDay(row.stats_updated_on),
  };
}

function mapAid(row: AidRow): AidItem {
  return {
    id: asInt(row.id) ?? 0,
    deliveredOn: asDay(row.delivered_on) ?? "",
    category: asCategory(row.category),
    title: row.title,
    quantityLabel: row.quantity_label,
    published: asBool(row.published),
  };
}

function mapChannel(row: ChannelRow): ChannelItem {
  return {
    id: asInt(row.id) ?? 0,
    kind: asKind(row.kind),
    label: row.label,
    value: row.value,
    confirmed: asBool(row.confirmed),
    published: asBool(row.published),
  };
}

async function sqlClient() {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

async function hashPass(passphrase: string, saltHex?: string): Promise<string> {
  const { scryptSync, randomBytes } = await import("node:crypto");
  const salt = saltHex ?? randomBytes(16).toString("hex");
  const hash = scryptSync(passphrase, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

async function verifyPass(passphrase: string, stored: string | null): Promise<boolean> {
  if (!stored || !stored.includes(":")) return false;
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;
  const { scryptSync, timingSafeEqual } = await import("node:crypto");
  const actual = scryptSync(passphrase, salt, 32);
  const expected = Buffer.from(expectedHex, "hex");
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(actual, expected);
}

async function guardHash(): Promise<string | null> {
  const sql = await sqlClient();
  const rows = await sql<{ pass_hash: string | null }>`select pass_hash from camp_guard where id = 1`;
  return rows[0]?.pass_hash ?? null;
}

async function requirePass(passphrase: string): Promise<Err | null> {
  const stored = await guardHash();
  if (!stored) return fail("لم تُضبط عبارة مرور الإدارة بعد.");
  const ok = await verifyPass(passphrase, stored);
  if (!ok) return fail("عبارة المرور غير صحيحة.");
  return null;
}

async function readAdmin(): Promise<AdminCamp> {
  const sql = await sqlClient();
  const settings = await sql<SettingsRow>`select * from camp_settings where id = 1`;
  const aid = await sql<AidRow>`
    select id, delivered_on, category, title, quantity_label, published
    from aid_entries
    order by delivered_on desc, id desc
    limit 100
  `;
  const channels = await sql<ChannelRow>`
    select id, kind, label, value, confirmed, published
    from support_channels
    order by id asc
    limit 40
  `;
  const row = settings[0];
  const claimed = Boolean(await guardHash());
  if (!row) {
    return {
      claimed,
      statsPublished: false,
      stats: EMPTY_STATS,
      publicNote: "",
      notePublished: false,
      campName: DEFAULT_CAMP_NAME,
      aid: aid.map(mapAid),
      channels: channels.map(mapChannel),
    };
  }
  return {
    claimed,
    statsPublished: asBool(row.stats_published),
    stats: mapStats(row),
    publicNote: row.public_note ?? "",
    notePublished: asBool(row.note_published),
    campName: asName(row.camp_name),
    aid: aid.map(mapAid),
    channels: channels.map(mapChannel),
  };
}

function toPublic(admin: AdminCamp): PublicCamp {
  const base = admin.claimed
    ? {
        statsPublished: admin.statsPublished,
        stats: admin.statsPublished ? admin.stats : EMPTY_STATS,
        note: admin.notePublished ? admin.publicNote.trim() || null : null,
        aid: admin.aid
          .filter((item) => item.published)
          .map(({ published: _published, ...item }) => item),
        channels: admin.channels
          .filter((item) => item.published && item.confirmed)
          .map(({ confirmed: _c, published: _p, ...item }) => item),
      }
    : EMPTY_PUBLIC;
  return { ...base, campName: admin.campName || DEFAULT_CAMP_NAME };
}

function validateNarrative(value: string, label: string): string | null {
  const text = value.trim();
  if (hasLongDigits(text)) return `${label} لا يجوز أن يتضمّن أرقامًا طويلة قد تكشف هوية أحد.`;
  if (/https?:|www\./i.test(text)) return `${label} لا يقبل الروابط.`;
  return null;
}

function normalizeChannel(kind: ChannelKind, value: string): string | Err {
  const trimmed = value.trim();
  if (kind === "whatsapp") {
    const digits = trimmed.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) {
      return fail("اكتب رقم الواتساب دوليًا، من 10 إلى 15 رقمًا، مثل 9705xxxxxxx.");
    }
    return digits;
  }
  if (kind === "email") {
    const email = trimmed.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("البريد الإلكتروني غير مكتمل.");
    return email;
  }
  if (kind === "bank") {
    if (/https?:|www\./i.test(trimmed)) return fail("الحساب المالي يُكتب نصًا، لا رابطًا.");
    if (trimmed.length < 6) return fail("بيانات الحساب قصيرة جدًا.");
    return trimmed;
  }
  const problem = validateNarrative(trimmed, "تعليمات الاستلام");
  if (problem) return fail(problem);
  return trimmed;
}

export const getGuardStatus = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const hash = await guardHash();
    return { claimed: Boolean(hash) };
  } catch (error) {
    console.error(error);
    return { claimed: false };
  }
});

export const getPublicCamp = createServerFn({ method: "GET" }).handler(async (): Promise<PublicCamp> => {
  try {
    return toPublic(await readAdmin());
  } catch (error) {
    console.error(error);
    return EMPTY_PUBLIC;
  }
});

export const setupGuard = createServerFn({ method: "POST" })
  .validator((input: unknown) => setupSchema.parse(input))
  .handler(async ({ data }): Promise<Result<{ claimed: true }>> => {
    try {
      const existing = await guardHash();
      if (existing) return fail("عبارة المرور مضبوطة بالفعل. أدخلها للوصول إلى اللوحة.");
      const hash = await hashPass(data.passphrase);
      const sql = await sqlClient();
      const rows = await sql<{ id: number }>`
        update camp_guard
        set pass_hash = ${hash}
        where id = 1 and pass_hash is null
        returning id
      `;
      if (!rows.length) return fail("تم ضبط عبارة المرور من جهة أخرى. أدخل العبارة الحالية.");
      return { ok: true, data: { claimed: true } };
    } catch (error) {
      console.error(error);
      return fail("تعذر حفظ عبارة المرور. حاول مرة أخرى.");
    }
  });

export const getAdminCamp = createServerFn({ method: "POST" })
  .validator((input: unknown) => passSchema.parse(input))
  .handler(async ({ data }): Promise<Result<AdminCamp>> => {
    try {
      const denied = await requirePass(data.passphrase);
      if (denied) return denied;
      return { ok: true, data: await readAdmin() };
    } catch (error) {
      console.error(error);
      return fail("تعذر فتح لوحة الإدارة.");
    }
  });

export const saveCampSettings = createServerFn({ method: "POST" })
  .validator((input: unknown) => statsSchema.parse(input))
  .handler(async ({ data }): Promise<Result<AdminCamp>> => {
    try {
      const denied = await requirePass(data.passphrase);
      if (denied) return denied;
      const numbers = [
        data.familiesRegistered,
        data.familiesVerified,
        data.individuals,
        data.children,
        data.elderly,
        data.needFood,
        data.needClothing,
        data.needShelter,
        data.needHealth,
        data.needsCatalog,
      ];
      const anyNumber = numbers.some((n) => n !== null);
      if (data.statsPublished && !anyNumber) {
        return fail("لا يُنشر قسم الأرقام من غير رقم واحد على الأقل تم التحقق منه.");
      }
      if (data.statsPublished && !data.statsUpdatedOn) {
        return fail("حدد تاريخ آخر تحديث قبل نشر الأرقام.");
      }
      if (
        data.familiesRegistered !== null &&
        data.familiesVerified !== null &&
        data.familiesVerified > data.familiesRegistered
      ) {
        return fail("عدد الأسر التي تم التحقق منها لا يمكن أن يتجاوز عدد الأسر المسجّلة.");
      }
      const note = data.publicNote.trim();
      if (data.notePublished && note.length < 8) {
        return fail("المستجد المنشور يحتاج نصًا واضحًا، أو ألغِ نشره.");
      }
      const noteProblem = note ? validateNarrative(note, "المستجد") : null;
      if (noteProblem) return fail(noteProblem);
      const nameProblem = validateNarrative(data.campName, "اسم المخيم");
      if (nameProblem) return fail(nameProblem);

      const sql = await sqlClient();
      await sql`
        update camp_settings set
          families_registered = ${data.familiesRegistered},
          families_verified = ${data.familiesVerified},
          individuals = ${data.individuals},
          children = ${data.children},
          elderly = ${data.elderly},
          need_food = ${data.needFood},
          need_clothing = ${data.needClothing},
          need_shelter = ${data.needShelter},
          need_health = ${data.needHealth},
          needs_catalog = ${data.needsCatalog},
          stats_updated_on = ${data.statsUpdatedOn},
          stats_published = ${data.statsPublished},
          public_note = ${note},
          note_published = ${data.notePublished},
          camp_name = ${data.campName},
          updated_at = now()
        where id = 1
      `;
      return { ok: true, data: await readAdmin() };
    } catch (error) {
      console.error(error);
      return fail("تعذر حفظ البيانات. حاول مرة أخرى.");
    }
  });

export const addAidEntry = createServerFn({ method: "POST" })
  .validator((input: unknown) => aidSchema.parse(input))
  .handler(async ({ data }): Promise<Result<AdminCamp>> => {
    try {
      const denied = await requirePass(data.passphrase);
      if (denied) return denied;
      const titleProblem = validateNarrative(data.title, "وصف المساعدة");
      if (titleProblem) return fail(titleProblem);
      const qtyProblem = validateNarrative(data.quantityLabel, "الكمية");
      if (qtyProblem) return fail(qtyProblem);
      const sql = await sqlClient();
      const countRows = await sql<{ n: number }>`select count(*)::int as n from aid_entries`;
      if ((asInt(countRows[0]?.n) ?? 0) >= 200) {
        return fail("سجل التوثيق ممتلئ. أخفِ البنود القديمة بدل إضافة المزيد.");
      }
      await sql`
        insert into aid_entries (delivered_on, category, title, quantity_label, published)
        values (${data.deliveredOn}, ${data.category}, ${data.title}, ${data.quantityLabel}, ${data.published})
      `;
      return { ok: true, data: await readAdmin() };
    } catch (error) {
      console.error(error);
      return fail("تعذر إضافة سجل المساعدة.");
    }
  });

export const setAidPublished = createServerFn({ method: "POST" })
  .validator((input: unknown) => toggleSchema.parse(input))
  .handler(async ({ data }): Promise<Result<AdminCamp>> => {
    try {
      const denied = await requirePass(data.passphrase);
      if (denied) return denied;
      const sql = await sqlClient();
      await sql`
        update aid_entries set published = ${data.published} where id = ${data.id}
      `;
      return { ok: true, data: await readAdmin() };
    } catch (error) {
      console.error(error);
      return fail("تعذر تحديث حالة السجل.");
    }
  });

export const addSupportChannel = createServerFn({ method: "POST" })
  .validator((input: unknown) => channelSchema.parse(input))
  .handler(async ({ data }): Promise<Result<AdminCamp>> => {
    try {
      const denied = await requirePass(data.passphrase);
      if (denied) return denied;
      if (data.published && !data.confirmed) {
        return fail("لا تُعرض قناة مساهمة قبل تأكيد صحتها وملكيتها.");
      }
      const labelProblem = validateNarrative(data.label, "اسم القناة");
      if (labelProblem) return fail(labelProblem);
      const normalized = normalizeChannel(data.kind, data.value);
      if (typeof normalized !== "string") return normalized;
      const sql = await sqlClient();
      const countRows = await sql<{ n: number }>`select count(*)::int as n from support_channels`;
      if ((asInt(countRows[0]?.n) ?? 0) >= 30) {
        return fail("عدد القنوات بلغ الحد. أخفِ قناة غير مستخدمة.");
      }
      await sql`
        insert into support_channels (kind, label, value, confirmed, published)
        values (${data.kind}, ${data.label.trim()}, ${normalized}, ${data.confirmed}, ${data.published && data.confirmed})
      `;
      return { ok: true, data: await readAdmin() };
    } catch (error) {
      console.error(error);
      return fail("تعذر إضافة القناة.");
    }
  });

export const setChannelPublished = createServerFn({ method: "POST" })
  .validator((input: unknown) => toggleSchema.parse(input))
  .handler(async ({ data }): Promise<Result<AdminCamp>> => {
    try {
      const denied = await requirePass(data.passphrase);
      if (denied) return denied;
      const sql = await sqlClient();
      if (data.published) {
        const rows = await sql<{ confirmed: boolean | string | number }>`
          select confirmed from support_channels where id = ${data.id}
        `;
        if (!rows.length) return fail("القناة غير موجودة.");
        if (!asBool(rows[0]?.confirmed)) {
          return fail("لا يمكن إظهار قناة لم يُؤكَّد ملكها وصحتها.");
        }
      }
      await sql`
        update support_channels set published = ${data.published} where id = ${data.id}
      `;
      return { ok: true, data: await readAdmin() };
    } catch (error) {
      console.error(error);
      return fail("تعذر تحديث القناة.");
    }
  });

export const changePassphrase = createServerFn({ method: "POST" })
  .validator((input: unknown) => changeSchema.parse(input))
  .handler(async ({ data }): Promise<Result<{ changed: true }>> => {
    try {
      const denied = await requirePass(data.current);
      if (denied) return denied;
      if (data.current === data.next) return fail("اختر عبارة مرور مختلفة عن الحالية.");
      const hash = await hashPass(data.next);
      const sql = await sqlClient();
      await sql`update camp_guard set pass_hash = ${hash} where id = 1`;
      return { ok: true, data: { changed: true } };
    } catch (error) {
      console.error(error);
      return fail("تعذر تغيير عبارة المرور.");
    }
  });
