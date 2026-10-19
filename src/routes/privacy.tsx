import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, Shell } from "@/components/site-chrome";
import { PRIVACY_RULES, SITE } from "@/content/site";
import { getPublicCamp } from "@/lib/camp.functions";

export const Route = createFileRoute("/privacy")({
  loader: () => getPublicCamp(),
  head: () => ({
    meta: [
      { title: `الخصوصية – ${SITE.name}` },
      {
        name: "description",
        content: "ضوابط نشر البيانات في موقع مخيم السلطان 1: لا أسماء، ولا هويات، ولا بيانات أطفال.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const camp = Route.useLoaderData();

  return (
    <Shell>
      <main id="content">
        <PageIntro kicker="الثقة" title="الخصوصية وحفظ الكرامة">
          <p>
            هذا الموقع جسر بين أصحاب العطاء والأسر المحتاجة. الجسر لا يقوم على كشف الناس، بل على معلومات موثوقة لا تمس كرامتهم.
          </p>
        </PageIntro>
        <div className="mx-auto grid max-w-3xl gap-10 px-4 pb-16 sm:px-6">
          <section>
            <h2 className="font-display text-3xl">ما لا يُنشر</h2>
            <ul className="mt-4 grid gap-3">
              {PRIVACY_RULES.map((rule) => (
                <li key={rule} className="rounded-xl border border-line bg-panel px-4 py-3 leading-relaxed">
                  {rule}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-display text-3xl">ما قد يُنشر</h2>
            <div className="mt-4 space-y-3 leading-relaxed text-muted">
              <p>أرقام إجمالية فقط، بعد التحقق، مع تاريخ التحديث، والتمييز بين المسجّل والمُتحقَّق منه حين تتوفر البيانات.</p>
              <p>سجل مساعدات يصف المواد والكميات والتاريخ، لا المستفيدين بالاسم.</p>
              <p>قنوات تواصل تخص إدارة المخيم، بعد تأكيد صحتها وملكيتها. لا تُعرض قبل ذلك.</p>
              <p>الرسوم في الموقع توضيحية بأسلوب قصصي، وليست صورًا حقيقية من المخيم ولا لأشخاص حقيقيين.</p>
            </div>
          </section>
          <section>
            <h2 className="font-display text-3xl">ما لا نجمعه من الزائر</h2>
            <p className="mt-4 leading-relaxed text-muted">
              صفحة المساهمة لا تحفظ اسمك ولا هاتفك ولا بريدك. إن نسخت نصًا أو فتحت واتساب أو بريدًا، فذلك يتم من جهازك أنت نحو القناة التي نشرتها الإدارة.
            </p>
          </section>
          <section>
            <h2 className="font-display text-3xl">الصحة</h2>
            <p className="mt-4 leading-relaxed text-muted">
              الموقع ليس جهة طبية، ولا يجمع بيانات طبية شخصية. الحديث عن الاحتياج الصحي عام، ويُوجَّه بالتنسيق مع الجهات المناسبة بحسب الإمكانات.
            </p>
          </section>
          <section>
            <h2 className="font-display text-3xl">لوحة الإدارة</h2>
            <p className="mt-4 leading-relaxed text-muted">
              تعديل الأرقام والقنوات محمي بعبارة مرور تخص الإدارة. تُحفظ العبارة مشفّرة، ولا تُعرض مسودات الأرقام أو القنوات غير المنشورة للزوار.
            </p>
            {camp.channels.length ? (
              <ul className="mt-4 grid gap-2 text-sm">
                {camp.channels.map((channel) => (
                  <li key={channel.id} className="text-cream">
                    {channel.label}
                    {channel.kind === "email" ? <span dir="ltr"> — {channel.value}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">لا توجد قناة تواصل منشورة حاليًا.</p>
            )}
          </section>
        </div>
      </main>
    </Shell>
  );
}
