import { Link } from "@tanstack/react-router";
import { ABOUT_PARAS, HELP_WAYS, HERO_PARAS, MISSION, NEEDS, SITE, VALUES, VISION } from "@/content/site";
import type { PublicCamp, Stats } from "@/lib/camp-types";
import { categoryLabel } from "@/lib/camp-types";
import { formatDate, formatInt } from "@/lib/format";

function familyFace(stats: Stats): { label: string; value: number | null; note?: string } {
  if (stats.familiesVerified != null && stats.familiesRegistered != null) {
    return {
      label: "أسر تم التحقق منها",
      value: stats.familiesVerified,
      note: `من أصل ${formatInt(stats.familiesRegistered)} مسجّلة`,
    };
  }
  if (stats.familiesVerified != null) {
    return { label: "أسر تم التحقق منها", value: stats.familiesVerified };
  }
  if (stats.familiesRegistered != null) {
    return { label: "الأسر المسجّلة", value: stats.familiesRegistered };
  }
  return { label: "الأسر", value: null };
}

export function HomeView({ camp }: { camp: PublicCamp }) {
  const family = familyFace(camp.stats);
  const heroStats = [
    family,
    { label: "الأفراد", value: camp.stats.individuals },
    { label: "الأطفال", value: camp.stats.children },
    { label: "الاحتياجات", value: camp.stats.needsCatalog },
  ];

  const detail = [
    { label: "إجمالي عدد الأسر المسجّلة", value: camp.stats.familiesRegistered },
    { label: "أسر تم التحقق من بياناتها", value: camp.stats.familiesVerified },
    { label: "إجمالي عدد الأفراد", value: camp.stats.individuals },
    { label: "عدد الأطفال", value: camp.stats.children },
    { label: "عدد كبار السن", value: camp.stats.elderly },
    { label: "أسر تحتاج إلى دعم غذائي", value: camp.stats.needFood },
    { label: "أسر تحتاج إلى ملابس وأغطية", value: camp.stats.needClothing },
    { label: "أسر تحتاج إلى دعم في المأوى", value: camp.stats.needShelter },
    { label: "أسر تحتاج إلى دعم صحي", value: camp.stats.needHealth },
  ];

  return (
    <main id="content">
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:py-14">
        <figure className="lg:col-span-7">
          <img
            src="/camp/hero.jpg"
            alt="رسم توضيحي لطفل يجلس بجانب خيمة في مخيم للنازحين، مع ضوء دافئ في الأفق. ليس صورة حقيقية."
            width={1600}
            height={900}
            className="aspect-video w-full rounded-2xl object-cover"
          />
          <figcaption className="mt-2 text-xs text-muted">{SITE.illustrationNote}</figcaption>
        </figure>

        <div className="rise lg:col-span-5">
          <p className="text-sm font-medium text-moss">
            {SITE.name} · بيت لاهيا
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-cream sm:text-5xl">{SITE.heroTitle}</h1>
          <p className="mt-4 font-display text-xl italic leading-relaxed text-clay">{SITE.slogan}</p>
          <p className="mt-4 text-base leading-relaxed text-muted">{HERO_PARAS[0]}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to="/contribute"
              search={{ need: "general", mode: "specific" }}
              className="press inline-flex h-12 items-center justify-center rounded-xl bg-clay px-5 font-semibold text-night"
            >
              ساهم في دعم المخيم
            </Link>
            <a
              href="#about"
              className="press inline-flex h-12 items-center justify-center rounded-xl border border-line px-5 text-cream"
            >
              تعرّف على المخيم
            </a>
            <a
              href="#needs"
              className="press inline-flex h-12 items-center justify-center rounded-xl border border-line px-5 text-cream"
            >
              اطّلع على الاحتياجات
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-4 px-4 pb-4 text-base leading-relaxed text-muted sm:px-6">
        {HERO_PARAS.slice(1).map((para) => (
          <p key={para}>{para}</p>
        ))}
      </div>

      {camp.note ? (
        <aside className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-line bg-panel px-5 py-4">
            <p className="text-sm font-semibold text-moss">مستجد من المخيم</p>
            <p className="mt-2 leading-relaxed text-cream">{camp.note}</p>
          </div>
        </aside>
      ) : null}

      <section aria-label="شريط المعلومات" className="mx-auto mt-10 max-w-6xl px-4 sm:px-6">
        <div className="grid overflow-hidden rounded-2xl border border-line bg-panel sm:grid-cols-2 lg:grid-cols-4">
          {heroStats.map((item, index) => (
            <div
              key={item.label}
              className={`px-5 py-6 ${index > 0 ? "border-t border-line sm:border-t-0 lg:border-s" : ""} ${
                index === 1 || index === 3 ? "sm:border-s sm:border-line lg:border-s" : ""
              } ${index > 1 ? "border-t border-line lg:border-t-0" : ""}`}
            >
              <p className="text-sm text-muted">{item.label}</p>
              <p className="mt-2 font-display text-4xl tabular-nums text-cream">
                {camp.statsPublished && item.value != null ? formatInt(item.value) : "—"}
              </p>
              {"note" in item && item.note && camp.statsPublished ? (
                <p className="mt-1 text-xs text-moss">{item.note}</p>
              ) : null}
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {camp.statsPublished && camp.stats.statsUpdatedOn
            ? `آخر تحديث للأرقام: ${formatDate(camp.stats.statsUpdatedOn)}. لا تُعرض إلا بيانات تم التحقق منها، ومن غير أسماء أو عناوين.`
            : "لا تُعرض أرقام تجريبية. تُنشر الإحصائيات بعد التحقق فقط، مع تاريخ آخر تحديث."}
        </p>
      </section>

      <section id="about" className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
        <figure>
          <img
            src="/camp/about.jpg"
            alt="رسم توضيحي لخيام المخيم وطفل يحمل حقيبته وأسر تلبي احتياجات يومها، وليس تصويرًا حقيقيًا."
            width={1400}
            height={933}
            loading="lazy"
            className="h-auto w-full rounded-2xl object-cover"
          />
          <figcaption className="mt-2 text-xs text-muted">{SITE.illustrationNote}</figcaption>
        </figure>
        <div>
          <p className="text-sm font-medium text-clay">عن المخيم</p>
          <h2 className="mt-3 font-display text-4xl leading-tight">مخيم السلطان 1... حكايات من قلب شمال غزة</h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-muted">
            {ABOUT_PARAS.map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-panel">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2">
          <blockquote>
            <p className="text-sm font-semibold text-moss">الرؤية</p>
            <p className="mt-3 font-display text-2xl leading-relaxed text-cream">{VISION}</p>
          </blockquote>
          <blockquote>
            <p className="text-sm font-semibold text-moss">الرسالة</p>
            <p className="mt-3 text-base leading-relaxed text-muted">{MISSION}</p>
          </blockquote>
        </div>
      </section>

      <section id="numbers" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <p className="text-sm font-medium text-clay">المخيم بالأرقام</p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight">الأرقام تحكي حجم الاحتياج</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-muted">
          تساعدنا البيانات الدقيقة على فهم احتياجات المخيم بصورة أفضل، وتحديد الأولويات، والعمل على توجيه المساعدات نحو المجالات الأكثر احتياجًا. نحدّث البيانات وفق المعلومات المتاحة والموثوقة، مع الحفاظ على خصوصية الأسر وعدم نشر بياناتها الشخصية.
        </p>

        {!camp.statsPublished ? (
          <div className="mt-8 rounded-2xl border border-dashed border-line bg-panel px-5 py-8">
            <p className="font-display text-2xl text-cream">بانتظار التحديث الرسمي</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              ستظهر هنا أعداد الأسر والأفراد والأطفال وكبار السن، واحتياجات الغذاء والملابس والمأوى والصحة، بعد أن تُدخل إدارة المخيم أرقامًا تم التحقق منها وتاريخ تحديثها. لا نضع أرقامًا تقديرية مكان الحقيقة.
            </p>
          </div>
        ) : (
          <dl className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line">
            {detail.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 bg-panel px-5 py-4">
                <dt className="text-sm text-muted sm:text-base">{row.label}</dt>
                <dd className="font-display text-2xl tabular-nums text-cream">
                  {row.value == null ? <span className="text-base text-muted">غير متاح</span> : formatInt(row.value)}
                </dd>
              </div>
            ))}
          </dl>
        )}
        {camp.statsPublished && camp.stats.statsUpdatedOn ? (
          <p className="mt-3 text-sm text-muted">تاريخ التحديث: {formatDate(camp.stats.statsUpdatedOn)}</p>
        ) : null}
      </section>

      <section id="needs" className="border-t border-line bg-panel-2">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <p className="text-sm font-medium text-clay">احتياجات المخيم</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight">احتياج واضح يمكن المساهمة فيه</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted">
            نحوّل الظرف اليومي إلى مجالات يستطيع الزائر فهمها: غذاء، مياه، مأوى، دفء، صحة، وتعليم. المساهمة تُوجَّه بحسب الأولويات المتاحة، لا بحسب صورة عامة.
          </p>
          <div className="mt-12 grid gap-16">
            {NEEDS.map((need, index) => (
              <article key={need.id} className="grid items-center gap-6 lg:grid-cols-2">
                <figure className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <img
                    src={need.image}
                    alt={need.alt}
                    width={1100}
                    height={825}
                    loading="lazy"
                    className="h-auto w-full rounded-2xl object-cover"
                  />
                  <figcaption className="mt-2 text-xs text-muted">{SITE.illustrationNote}</figcaption>
                </figure>
                <div>
                  <p className="text-sm text-moss">{need.kicker}</p>
                  <h3 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">{need.title}</h3>
                  <div className="mt-4 space-y-3 leading-relaxed text-muted">
                    {need.body.map((para) => (
                      <p key={para.slice(0, 20)}>{para}</p>
                    ))}
                  </div>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {need.examples.map((example) => (
                      <li key={example} className="rounded-full border border-line bg-night px-3 py-1.5 text-sm text-cream">
                        {example}
                      </li>
                    ))}
                  </ul>
                  {need.note ? <p className="mt-4 text-sm text-clay">{need.note}</p> : null}
                  <Link
                    to="/contribute"
                    search={{ need: need.id, mode: "specific" }}
                    className="press mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-clay px-5 font-semibold text-night"
                  >
                    {need.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="help" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <p className="text-sm font-medium text-clay">كيف يمكنك المساعدة؟</p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight">مساهمتك قد تصنع فرقًا حقيقيًا</h2>
        <div className="mt-4 max-w-3xl space-y-3 leading-relaxed text-muted">
          <p>لا يشترط أن تكون مساهمتك كبيرة حتى يكون لها أثر.</p>
          <p>
            قد تكون مساهمة في توفير وجبة، أو المشاركة في تأمين المياه، أو توفير ملابس لطفل، أو دعم احتياج ضروري لأسرة. نرحب بكل مساهمة صادقة تتناسب مع قدرة صاحبها، ونسعى إلى توجيه الدعم وفق الاحتياجات الفعلية والأولويات المتاحة.
          </p>
        </div>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2">
          {HELP_WAYS.map((way) => (
            <li key={way.n} className="rounded-2xl border border-line bg-panel p-5">
              <p className="font-display text-3xl text-clay">{way.n}</p>
              <h3 className="mt-3 text-xl font-semibold">{way.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{way.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            to="/contribute"
            search={{ need: "general", mode: "specific" }}
            className="press inline-flex h-12 items-center justify-center rounded-xl bg-clay px-5 font-semibold text-night"
          >
            أريد المساهمة
          </Link>
          <Link
            to="/contribute"
            search={{ need: "general", mode: "inkind" }}
            className="press inline-flex h-12 items-center justify-center rounded-xl border border-line px-5"
          >
            أريد تقديم مساعدة عينية
          </Link>
          <Link
            to="/contribute"
            search={{ need: "general", mode: "share" }}
            className="press inline-flex h-12 items-center justify-center rounded-xl border border-line px-5"
          >
            أريد مشاركة الموقع
          </Link>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-display text-3xl">القيم التي نعمل بها</h2>
          <ul className="mt-6 flex flex-wrap gap-x-3 gap-y-3">
            {VALUES.map((value) => (
              <li key={value} className="text-base text-cream">
                <span className="text-clay">·</span> {value}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {camp.aid.length ? (
        <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl">آخر ما تم توثيقه</h2>
              <Link to="/aid" className="text-sm text-clay">
                السجل كاملًا
              </Link>
            </div>
            <ul className="mt-4 divide-y divide-line">
              {camp.aid.slice(0, 3).map((item) => (
                <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                  <span>
                    <span className="text-moss">{categoryLabel(item.category)} · </span>
                    {item.title}
                  </span>
                  <span className="text-sm text-muted">
                    {item.quantityLabel} — {formatDate(item.deliveredOn)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl bg-clay px-6 py-10 text-night sm:px-10">
          <h2 className="font-display text-4xl leading-tight">كن سببًا في تخفيف معاناة أسرة</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed">
            اختر مجالًا، أو ساهم بشكل عام، أو نسّق مساعدة عينية. لا تُعرض وسائل دفع أو حسابات إلا بعد تأكيد إدارتها وملكيتها.
          </p>
          <Link
            to="/contribute"
            search={{ need: "general", mode: "specific" }}
            className="press mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-night px-5 font-semibold text-cream"
          >
            أريد المساهمة
          </Link>
        </div>
      </section>
    </main>
  );
}
