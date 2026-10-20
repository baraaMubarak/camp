import { useRouter } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  addAidEntry,
  addSupportChannel,
  changePassphrase,
  getAdminCamp,
  saveCampSettings,
  setAidPublished,
  setChannelPublished,
  setupGuard,
} from "@/lib/camp.functions";
import {
  CATEGORIES,
  CHANNEL_KINDS,
  STAT_FIELDS,
  categoryLabel,
  type AdminCamp,
  type CategoryId,
  type ChannelKind,
  type Stats,
} from "@/lib/camp-types";
import { formatDate, parseOptionalInt } from "@/lib/format";

const PASS_KEY = "sultan-admin-pass";
const inputClass =
  "h-12 w-full rounded-xl border border-line bg-night px-3 text-base text-cream placeholder:text-muted";

type Phase = "boot" | "setup" | "lock" | "in";

function blankStats(): Record<keyof Stats, string> {
  return {
    familiesRegistered: "",
    familiesVerified: "",
    individuals: "",
    children: "",
    elderly: "",
    needFood: "",
    needClothing: "",
    needShelter: "",
    needHealth: "",
    needsCatalog: "",
    statsUpdatedOn: "",
  };
}

function statsToDraft(stats: Stats): Record<keyof Stats, string> {
  const draft = blankStats();
  (Object.keys(draft) as Array<keyof Stats>).forEach((key) => {
    const value = stats[key];
    draft[key] = value == null ? "" : String(value);
  });
  return draft;
}

async function call<T>(work: () => Promise<{ ok: true; data: T } | { ok: false; error: string }>) {
  try {
    return await work();
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "تعذر تنفيذ الطلب",
    };
  }
}

export function AdminPanel({ claimed }: { claimed: boolean }) {
  const [phase, setPhase] = useState<Phase>("boot");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [camp, setCamp] = useState<AdminCamp | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(PASS_KEY) ?? "";
    if (claimed && saved) {
      setPass(saved);
      void openWith(saved);
      return;
    }
    setPhase(claimed ? "lock" : "setup");
  }, [claimed]);

  async function openWith(passphrase: string) {
    setBusy(true);
    setError("");
    const result = await call(() => getAdminCamp({ data: { passphrase } }));
    setBusy(false);
    if (!result.ok) {
      sessionStorage.removeItem(PASS_KEY);
      setPhase("lock");
      setError(result.error);
      return;
    }
    sessionStorage.setItem(PASS_KEY, passphrase);
    setPass(passphrase);
    setCamp(result.data);
    setPhase("in");
  }

  async function createPass(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (pass.trim().length < 8) {
      setError("عبارة المرور ٨ أحرف على الأقل.");
      return;
    }
    if (pass !== confirm) {
      setError("التأكيد لا يطابق عبارة المرور.");
      return;
    }
    setBusy(true);
    const result = await call(() => setupGuard({ data: { passphrase: pass } }));
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    await openWith(pass);
    setNotice("تم ضبط عبارة المرور على هذا الجهاز لهذه الجلسة. احفظها خارج الموقع.");
  }

  if (phase === "boot" || (phase === "in" && !camp)) {
    return <p className="px-4 py-16 text-center text-muted">جارٍ فتح اللوحة…</p>;
  }

  if (phase === "setup" || phase === "lock") {
    return (
      <form onSubmit={phase === "setup" ? createPass : (event) => { event.preventDefault(); void openWith(pass); }} className="mx-auto max-w-lg px-4 py-12">
        <p className="text-sm font-medium text-clay">الإدارة</p>
        <h1 className="mt-3 font-display text-4xl leading-tight">
          {phase === "setup" ? "اضبط عبارة مرور اللوحة" : "دخول لوحة الإدارة"}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {phase === "setup"
            ? "أول من يضبط العبارة يصبح مسؤول النشر. افعلها قبل مشاركة الموقع حتى لا ينشر غيرك أرقامًا أو حسابات. العبارة لا تُحفظ كنص واضح."
            : "الأرقام وقنوات المساهمة لا تتغير إلا بهذه العبارة. لا تُدخل أسماء الأسر أو هوياتهم هنا."}
        </p>
        <label className="mt-6 block text-sm" htmlFor="admin-pass">
          عبارة المرور
        </label>
        <input
          id="admin-pass"
          type="password"
          autoComplete={phase === "setup" ? "new-password" : "current-password"}
          dir="auto"
          value={pass}
          onChange={(event) => setPass(event.target.value)}
          className={`${inputClass} mt-2`}
        />
        {phase === "setup" ? (
          <>
            <label className="mt-4 block text-sm" htmlFor="admin-pass-2">
              تأكيد العبارة
            </label>
            <input
              id="admin-pass-2"
              type="password"
              autoComplete="new-password"
              dir="auto"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className={`${inputClass} mt-2`}
            />
          </>
        ) : null}
        {error ? <p className="mt-4 text-sm text-clay">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-clay font-semibold text-night disabled:opacity-60"
        >
          {busy ? "جارٍ الحفظ…" : phase === "setup" ? "حفظ العبارة والدخول" : "دخول"}
        </button>
      </form>
    );
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-10 px-4 py-10 sm:px-6">
      <header>
        <p className="text-sm font-medium text-clay">لوحة الإدارة</p>
        <h1 className="mt-2 font-display text-4xl">نشر ما تم التحقق منه فقط</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          اترك الخانة فارغة إن لم يتوفر الرقم. لا تكتب صفرًا كرقم تجريبي. لا أسماء، ولا هويات، ولا هواتف أسر، ولا عناوين تفصيلية.
        </p>
        {notice ? <p className="mt-3 text-sm text-moss">{notice}</p> : null}
        {error ? <p className="mt-3 text-sm text-clay">{error}</p> : null}
      </header>
      <SettingsForm
        camp={camp!}
        passphrase={pass}
        busy={busy}
        onBusy={setBusy}
        onError={setError}
        onNotice={setNotice}
        onCamp={setCamp}
      />
      <AidForm camp={camp!} passphrase={pass} onBusy={setBusy} onError={setError} onNotice={setNotice} onCamp={setCamp} busy={busy} />
      <ChannelForm camp={camp!} passphrase={pass} onBusy={setBusy} onError={setError} onNotice={setNotice} onCamp={setCamp} busy={busy} />
      <PasswordForm
        onChanged={(next) => {
          setPass(next);
          sessionStorage.setItem(PASS_KEY, next);
          setNotice("تم تغيير عبارة المرور.");
          setError("");
        }}
        onError={setError}
      />
    </div>
  );
}

function SettingsForm({
  camp,
  passphrase,
  busy,
  onBusy,
  onError,
  onNotice,
  onCamp,
}: {
  camp: AdminCamp;
  passphrase: string;
  busy: boolean;
  onBusy: (v: boolean) => void;
  onError: (v: string) => void;
  onNotice: (v: string) => void;
  onCamp: (v: AdminCamp) => void;
}) {
  const [draft, setDraft] = useState(() => statsToDraft(camp.stats));
  const [published, setPublished] = useState(camp.statsPublished);
  const [note, setNote] = useState(camp.publicNote);
  const [notePublished, setNotePublished] = useState(camp.notePublished);
  const [campName, setCampName] = useState(camp.campName);
  const router = useRouter();

  function setField(key: keyof Stats, value: string) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    onError("");
    const parsed: Record<string, number | null> = {};
    for (const field of STAT_FIELDS) {
      const value = parseOptionalInt(draft[field.key]);
      if (value === "bad") {
        onError(`«${field.label}» يحتاج رقمًا صحيحًا أو يُترك فارغًا.`);
        return;
      }
      parsed[field.key] = value;
    }
    const dateRaw = draft.statsUpdatedOn.trim();
    if (dateRaw && !/^\d{4}-\d{2}-\d{2}$/.test(dateRaw)) {
      onError("تاريخ التحديث غير صالح.");
      return;
    }
    const name = campName.trim();
    if (name.length < 2 || name.length > 60) {
      onError("اسم المخيم من حرفين إلى ٦٠ حرفًا.");
      return;
    }
    onBusy(true);
    const result = await call(() =>
      saveCampSettings({
        data: {
          passphrase,
          familiesRegistered: parsed.familiesRegistered ?? null,
          familiesVerified: parsed.familiesVerified ?? null,
          individuals: parsed.individuals ?? null,
          children: parsed.children ?? null,
          elderly: parsed.elderly ?? null,
          needFood: parsed.needFood ?? null,
          needClothing: parsed.needClothing ?? null,
          needShelter: parsed.needShelter ?? null,
          needHealth: parsed.needHealth ?? null,
          needsCatalog: parsed.needsCatalog ?? null,
          statsUpdatedOn: dateRaw || null,
          statsPublished: published,
          publicNote: note,
          notePublished,
          campName: name,
        },
      }),
    );
    onBusy(false);
    if (!result.ok) {
      onError(result.error);
      return;
    }
    onCamp(result.data);
    await router.invalidate();
    onNotice("تم حفظ اسم المخيم والبيانات.");
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="grid gap-4 rounded-2xl border border-line bg-panel p-5">
      <h2 className="font-display text-3xl">اسم المخيم</h2>
      <label className="grid gap-1 text-sm" htmlFor="camp-name">
        <span>تعديل اسم المخيم</span>
        <span className="text-xs text-muted">يظهر في الترويسة والتذييل وعنوان الصفحات بعد الحفظ.</span>
        <input
          id="camp-name"
          value={campName}
          maxLength={60}
          required
          onChange={(event) => setCampName(event.target.value)}
          className={inputClass}
        />
      </label>
      <h2 className="font-display text-3xl">الأرقام</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {STAT_FIELDS.map((field) => (
          <label key={field.key} className="grid gap-1 text-sm">
            <span>{field.label}</span>
            <span className="text-xs text-muted">{field.hint}</span>
            <input
              inputMode="numeric"
              dir="ltr"
              placeholder="—"
              value={draft[field.key]}
              onChange={(event) => setField(field.key, event.target.value)}
              className={inputClass}
            />
          </label>
        ))}
        <label className="grid gap-1 text-sm">
          <span>تاريخ آخر تحديث</span>
          <span className="text-xs text-muted">يظهر للزوار مع الأرقام المنشورة</span>
          <input
            type="date"
            dir="ltr"
            value={draft.statsUpdatedOn}
            onChange={(event) => setField("statsUpdatedOn", event.target.value)}
            className={inputClass}
          />
        </label>
      </div>
      <label className="flex items-start gap-3 text-sm leading-relaxed">
        <input
          type="checkbox"
          className="mt-1 size-5"
          checked={published}
          onChange={(event) => setPublished(event.target.checked)}
        />
        <span>أنشر هذه الأرقام. أؤكد أنها تحققت، وأن الخانات الفارغة ستظهر «غير متاح» لا صفرًا.</span>
      </label>
      <label className="grid gap-2 text-sm">
        <span>مستجد قصير للصفحة الرئيسية</span>
        <textarea
          value={note}
          maxLength={400}
          rows={3}
          onChange={(event) => setNote(event.target.value)}
          className="w-full rounded-xl border border-line bg-night px-3 py-3 text-base text-cream"
          placeholder="مثال: وصلت دفعة طحين وتُوزَّع بحسب الأولوية. بلا أسماء."
        />
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1 size-5"
          checked={notePublished}
          onChange={(event) => setNotePublished(event.target.checked)}
        />
        <span>أظهر هذا المستجد للزوار</span>
      </label>
      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-12 items-center justify-center rounded-xl bg-clay font-semibold text-night disabled:opacity-60"
      >
        حفظ الأرقام
      </button>
    </form>
  );
}

function AidForm({
  camp,
  passphrase,
  busy,
  onBusy,
  onError,
  onNotice,
  onCamp,
}: {
  camp: AdminCamp;
  passphrase: string;
  busy: boolean;
  onBusy: (v: boolean) => void;
  onError: (v: string) => void;
  onNotice: (v: string) => void;
  onCamp: (v: AdminCamp) => void;
}) {
  const [deliveredOn, setDeliveredOn] = useState("");
  const [category, setCategory] = useState<CategoryId>("food");
  const [title, setTitle] = useState("");
  const [quantityLabel, setQuantityLabel] = useState("");
  const [published, setPublished] = useState(true);

  async function submit(event: FormEvent) {
    event.preventDefault();
    onError("");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(deliveredOn)) {
      onError("حدد تاريخ التسليم.");
      return;
    }
    onBusy(true);
    const result = await call(() =>
      addAidEntry({
        data: { passphrase, deliveredOn, category, title, quantityLabel, published },
      }),
    );
    onBusy(false);
    if (!result.ok) {
      onError(result.error);
      return;
    }
    onCamp(result.data);
    setTitle("");
    setQuantityLabel("");
    onNotice("أُضيف سجل المساعدة.");
  }

  async function toggle(id: number, next: boolean) {
    onError("");
    onBusy(true);
    const result = await call(() => setAidPublished({ data: { passphrase, id, published: next } }));
    onBusy(false);
    if (!result.ok) {
      onError(result.error);
      return;
    }
    onCamp(result.data);
  }

  return (
    <section className="grid gap-4 rounded-2xl border border-line bg-panel p-5">
      <h2 className="font-display text-3xl">توثيق مساعدة</h2>
      <p className="text-sm leading-relaxed text-muted">صف المادة والكمية فقط. مثال: «سلال غذائية» و«٤٠ سلة». لا اسم أسرة.</p>
      <form onSubmit={(event) => void submit(event)} className="grid gap-3">
        <label className="grid gap-1 text-sm">
          التاريخ
          <input type="date" dir="ltr" required value={deliveredOn} onChange={(e) => setDeliveredOn(e.target.value)} className={inputClass} />
        </label>
        <label className="grid gap-1 text-sm">
          المجال
          <select value={category} onChange={(e) => setCategory(e.target.value as CategoryId)} className={inputClass}>
            {CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          الوصف
          <input value={title} required minLength={3} maxLength={80} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="طحين وأرز" />
        </label>
        <label className="grid gap-1 text-sm">
          الكمية
          <input value={quantityLabel} required maxLength={40} onChange={(e) => setQuantityLabel(e.target.value)} className={inputClass} placeholder="١٢٠ كيسًا" />
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" className="size-5" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          أظهره في سجل التوثيق العلني
        </label>
        <button type="submit" disabled={busy} className="inline-flex h-12 items-center justify-center rounded-xl bg-clay font-semibold text-night disabled:opacity-60">
          إضافة السجل
        </button>
      </form>
      <ul className="divide-y divide-line">
        {camp.aid.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <span>
              {formatDate(item.deliveredOn)} · {categoryLabel(item.category)} · {item.title} · {item.quantityLabel}
            </span>
            <button type="button" className="h-10 rounded-lg border border-line px-3" onClick={() => void toggle(item.id, !item.published)}>
              {item.published ? "إخفاء" : "نشر"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ChannelForm({
  camp,
  passphrase,
  busy,
  onBusy,
  onError,
  onNotice,
  onCamp,
}: {
  camp: AdminCamp;
  passphrase: string;
  busy: boolean;
  onBusy: (v: boolean) => void;
  onError: (v: string) => void;
  onNotice: (v: string) => void;
  onCamp: (v: AdminCamp) => void;
}) {
  const [kind, setKind] = useState<ChannelKind>("whatsapp");
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [published, setPublished] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    onError("");
    onBusy(true);
    const result = await call(() =>
      addSupportChannel({
        data: { passphrase, kind, label, value, confirmed, published },
      }),
    );
    onBusy(false);
    if (!result.ok) {
      onError(result.error);
      return;
    }
    onCamp(result.data);
    setLabel("");
    setValue("");
    setConfirmed(false);
    setPublished(false);
    onNotice("حُفظت القناة.");
  }

  async function toggle(id: number, next: boolean) {
    onError("");
    onBusy(true);
    const result = await call(() => setChannelPublished({ data: { passphrase, id, published: next } }));
    onBusy(false);
    if (!result.ok) {
      onError(result.error);
      return;
    }
    onCamp(result.data);
  }

  return (
    <section className="grid gap-4 rounded-2xl border border-line bg-panel p-5">
      <h2 className="font-display text-3xl">قنوات المساهمة</h2>
      <p className="text-sm leading-relaxed text-muted">
        لا تضف حسابًا إلا إذا كنت تملكه وتستطيع الاستقبال عبره. الزائر لا يرى القناة إلا بعد تأكيدك وإظهارها.
      </p>
      <form onSubmit={(event) => void submit(event)} className="grid gap-3">
        <label className="grid gap-1 text-sm">
          النوع
          <select value={kind} onChange={(e) => setKind(e.target.value as ChannelKind)} className={inputClass}>
            {CHANNEL_KINDS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          الاسم الظاهر
          <input value={label} required minLength={2} maxLength={60} onChange={(e) => setLabel(e.target.value)} className={inputClass} placeholder="واتساب تنسيق المخيم" />
        </label>
        <label className="grid gap-1 text-sm">
          القيمة
          <input
            value={value}
            required
            dir={kind === "inkind" ? "rtl" : "ltr"}
            onChange={(e) => setValue(e.target.value)}
            className={inputClass}
            placeholder={kind === "whatsapp" ? "9705xxxxxxxx" : kind === "email" ? "name@example.org" : ""}
          />
        </label>
        <label className="flex items-start gap-3 text-sm leading-relaxed">
          <input type="checkbox" className="mt-1 size-5" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
          <span>أؤكد أن هذه القناة صحيحة، ومملوكة لمن يستقبل المساهمات، ويمكن استخدامها.</span>
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" className="size-5" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          أظهرها الآن في صفحة المساهمة
        </label>
        <button type="submit" disabled={busy} className="inline-flex h-12 items-center justify-center rounded-xl bg-clay font-semibold text-night disabled:opacity-60">
          حفظ القناة
        </button>
      </form>
      <ul className="divide-y divide-line">
        {camp.channels.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <span>
              {item.label}
              <span className="text-muted" dir="ltr">
                {" "}
                — {item.value}
              </span>
              {item.published ? <span className="text-moss"> · ظاهرة</span> : <span className="text-muted"> · مخفية</span>}
            </span>
            <button type="button" className="h-10 rounded-lg border border-line px-3" onClick={() => void toggle(item.id, !item.published)}>
              {item.published ? "إخفاء" : "نشر"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PasswordForm({
  onChanged,
  onError,
}: {
  onChanged: (next: string) => void;
  onError: (v: string) => void;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    onError("");
    if (next.trim().length < 8) {
      onError("العبارة الجديدة ٨ أحرف على الأقل.");
      return;
    }
    setBusy(true);
    const result = await call(() => changePassphrase({ data: { current, next } }));
    setBusy(false);
    if (!result.ok) {
      onError(result.error);
      return;
    }
    onChanged(next);
    setCurrent("");
    setNext("");
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="grid gap-3 rounded-2xl border border-line p-5">
      <h2 className="font-display text-2xl">تغيير عبارة المرور</h2>
      <input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="الحالية" className={inputClass} dir="auto" />
      <input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="الجديدة" className={inputClass} dir="auto" />
      <button type="submit" disabled={busy} className="inline-flex h-12 items-center justify-center rounded-xl border border-line disabled:opacity-60">
        تغيير العبارة
      </button>
    </form>
  );
}
