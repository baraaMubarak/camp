import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageIntro, Shell } from "@/components/site-chrome";
import { NEEDS, SITE } from "@/content/site";
import { getPublicCamp } from "@/lib/camp.functions";
import {
  CATEGORIES,
  categoryLabel,
  isCategoryId,
  isHelpMode,
  type CategoryId,
  type HelpMode,
} from "@/lib/camp-types";

export const Route = createFileRoute("/contribute")({
  validateSearch: (search: Record<string, unknown>) => {
    const need = typeof search.need === "string" && isCategoryId(search.need) ? search.need : "general";
    const mode = typeof search.mode === "string" && isHelpMode(search.mode) ? search.mode : "specific";
    return { need, mode };
  },
  loader: () => getPublicCamp(),
  head: ({ loaderData }) => ({
    meta: [
      { title: `المساهمة – ${loaderData?.campName ?? SITE.name}` },
      {
        name: "description",
        content: `كن سببًا في تخفيف معاناة أسرة. المساهمة في ${loaderData?.campName ?? SITE.name} دون نشر بيانات الأسر.`,
      },
    ],
  }),
  component: ContributePage,
});

const MODES: Array<{ id: HelpMode; title: string; text: string }> = [
  { id: "specific", title: "احتياج محدد", text: "أوجّه مساهمتي إلى مجال أختاره." },
  { id: "general", title: "مساهمة عامة", text: "تُوجَّه إلى الأكثر إلحاحًا حسب الأولويات المعلنة." },
  { id: "inkind", title: "مساعدة عينية", text: "مواد غذائية أو ملابس أو أغطية أو مستلزمات." },
  { id: "share", title: "مشاركة الموقع", text: "أصل الرسالة إلى من يستطيع الدعم." },
];

function ContributePage() {
  const initial = Route.useSearch();
  const camp = Route.useLoaderData();
  const [need, setNeed] = useState<CategoryId>(initial.need);
  const [mode, setMode] = useState<HelpMode>(initial.mode);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setNeed(initial.need);
    setMode(initial.mode);
  }, [initial.need, initial.mode]);

  const needLabel = need === "general" ? "احتياجات المخيم العامة" : categoryLabel(need);
  const needCopy = NEEDS.find((item) => item.id === need);
  const message = `أود المساهمة في ${camp.campName} – ${SITE.place}، في مجال ${needLabel}. كيف يمكنني المساعدة بما يناسب الاحتياج الفعلي؟`;

  const channels =
    mode === "inkind"
      ? [...camp.channels].sort((a, b) => Number(b.kind === "inkind") - Number(a.kind === "inkind"))
      : camp.channels;

  async function share() {
    const url = window.location.origin;
    const payload = { title: camp.campName, text: `${SITE.slogan}\n${message}`, url };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }
    } catch {
      return;
    }
    try {
      await navigator.clipboard.writeText(`${payload.text}\n${url}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Shell campName={camp.campName}>
      <main id="content" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <PageIntro kicker="قسم التبرع" title="كن سببًا في تخفيف معاناة أسرة">
          <p>
            لا يشترط أن تكون المساهمة كبيرة. اختر مجالًا، أو اجعلها عامة، أو نسّق مساعدة عينية، أو انشر رسالة المخيم.
          </p>
          <p>لا تُعرض وسائل دفع أو حسابات مالية إلا بعد التأكد من صحتها وملكيتها والقدرة على استقبال المساهمات من خلالها.</p>
        </PageIntro>

        <section className="mt-2">
          <h2 className="text-sm font-semibold text-moss">المجال</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIES.map((item) => {
              const active = need === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setNeed(item.id)}
                  className={`h-11 rounded-full px-4 text-sm ${
                    active ? "bg-clay font-semibold text-night" : "border border-line text-cream"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          {needCopy ? <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">{needCopy.body[0]}</p> : null}
          {need === "health" ? (
            <p className="mt-3 text-sm text-clay">الموقع ليس جهة طبية، ولا يجمع بيانات طبية شخصية.</p>
          ) : null}
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold text-moss">طريقة المساهمة</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {MODES.map((item) => {
              const active = mode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setMode(item.id)}
                  className={`rounded-2xl border px-4 py-4 text-start ${
                    active ? "border-clay bg-panel" : "border-line bg-panel/40"
                  }`}
                >
                  <span className="block font-semibold text-cream">{item.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{item.text}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-line bg-panel p-5 sm:p-6">
          <h2 className="font-display text-3xl">الخطوة التالية</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            لا نطلب اسمك ولا رقمك ولا نخزّنهما. إن وُجدت قناة موثّقة، تواصل أنت مباشرة. وإن لم تُنشر بعد، تبقى المشاركة هي الباب المفتوح.
          </p>
          <label className="mt-5 block text-sm text-moss" htmlFor="draft-message">
            نص يمكنك إرساله بنفسك
          </label>
          <textarea
            id="draft-message"
            readOnly
            value={message}
            rows={4}
            className="mt-2 w-full resize-none rounded-xl border border-line bg-night px-3 py-3 text-base leading-relaxed text-cream"
          />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void copyMessage()}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-line px-4"
            >
              {copied ? "تم النسخ" : "انسخ النص"}
            </button>
            <button
              type="button"
              onClick={() => void share()}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-clay px-4 font-semibold text-night"
            >
              شارك الموقع
            </button>
          </div>

          {mode !== "share" && channels.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-line px-4 py-4 text-sm leading-relaxed text-muted">
              قنوات الاستقبال غير مفعّلة بعد. لا نعرض رقمًا أو حسابًا قبل أن تؤكد إدارة المخيم ملكيته. يمكنك الآن مشاركة الموقع، وستظهر الوسيلة هنا حين تُعتمد.
            </p>
          ) : null}

          {mode !== "share" && channels.length > 0 ? (
            <ul className="mt-6 grid gap-3">
              {channels.map((channel) => (
                <li key={channel.id} className="rounded-xl border border-line bg-night px-4 py-4">
                  <p className="text-sm text-moss">{channel.label}</p>
                  {channel.kind === "whatsapp" ? (
                    <a
                      className="mt-2 inline-flex h-12 items-center text-base font-semibold text-clay"
                      href={`https://wa.me/${channel.value}?text=${encodeURIComponent(message)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      فتح واتساب
                    </a>
                  ) : null}
                  {channel.kind === "email" ? (
                    <a
                      className="mt-2 inline-flex h-12 items-center text-base font-semibold text-clay"
                      href={`mailto:${channel.value}?subject=${encodeURIComponent(`مساهمة – ${camp.campName}`)}&body=${encodeURIComponent(message)}`}
                    >
                      {channel.value}
                    </a>
                  ) : null}
                  {channel.kind === "bank" ? (
                    <p className="mt-2 text-base leading-relaxed text-cream" dir="ltr">
                      {channel.value}
                    </p>
                  ) : null}
                  {channel.kind === "inkind" ? (
                    <p className="mt-2 text-base leading-relaxed text-cream">{channel.value}</p>
                  ) : null}
                  {channel.kind === "bank" ? (
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                      هذه بيانات نشرتها إدارة المخيم بعد تأكيد ملكيتها. لا ترسل بيانات شخصية أكثر من اللازم، ولا تُذكر أسماء الأسر.
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </main>
    </Shell>
  );
}
