import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro, Shell } from "@/components/site-chrome";
import { getPublicCamp } from "@/lib/camp.functions";
import { categoryLabel, DEFAULT_CAMP_NAME } from "@/lib/camp-types";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/aid")({
  loader: () => getPublicCamp(),
  head: ({ loaderData }) => ({
    meta: [
      { title: `توثيق المساعدات – ${loaderData?.campName ?? DEFAULT_CAMP_NAME}` },
      {
        name: "description",
        content: `سجل علني بما وصل إلى ${loaderData?.campName ?? DEFAULT_CAMP_NAME} من مواد، دون أسماء الأسر أو بيانات تكشف هويتها.`,
      },
    ],
  }),
  component: AidPage,
});

function AidPage() {
  const camp = Route.useLoaderData();

  return (
    <Shell campName={camp.campName}>
      <main id="content">
        <PageIntro kicker="الشفافية" title="توثيق المساعدات">
          <p>
            نوثّق ما يصل إلى المخيم بصورة علنية: نوع المادة، والكمية، والتاريخ. لا أسماء أسر، ولا أرقام هويات، ولا هواتف، ولا عناوين تفصيلية، ولا ما يكشف هوية طفل.
          </p>
          <p>البند يظهر هنا فقط بعد أن تسجّله إدارة المخيم وتختاره للنشر.</p>
        </PageIntro>
        <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
          {camp.aid.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-panel px-5 py-10">
              <p className="font-display text-3xl">السجل بانتظار أول إدخال موثّق</p>
              <p className="mt-3 leading-relaxed text-muted">
                لم يُنشر بعد أي تسليم. حين تُسجَّل مساعدة حقيقية من لوحة الإدارة، تظهر في هذا الدفتر كمواد وكميات فقط.
              </p>
              <Link
                to="/contribute"
                search={{ need: "general", mode: "specific" }}
                className="press mt-6 inline-flex h-12 items-center rounded-xl bg-clay px-5 font-semibold text-night"
              >
                أريد المساهمة
              </Link>
            </div>
          ) : (
            <ol className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-panel">
              {camp.aid.map((item) => (
                <li key={item.id} className="grid gap-1 px-5 py-4 sm:grid-cols-[9rem_1fr_auto] sm:items-baseline sm:gap-4">
                  <time className="text-sm text-moss" dateTime={item.deliveredOn}>
                    {formatDate(item.deliveredOn)}
                  </time>
                  <p>
                    <span className="text-muted">{categoryLabel(item.category)} · </span>
                    {item.title}
                  </p>
                  <p className="text-sm text-cream">{item.quantityLabel}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </main>
    </Shell>
  );
}
