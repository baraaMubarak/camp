import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { SITE } from "@/content/site";

const NAV = [
  { href: "/#about", label: "عن المخيم" },
  { href: "/#numbers", label: "الأرقام" },
  { href: "/#needs", label: "الاحتياجات" },
  { href: "/#help", label: "كيف تساعد" },
  { to: "/aid", label: "التوثيق" },
] as const;

function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M5 26 L16 7 L27 26" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 26 V19.5 H21 V26" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="16.5" r="1.35" fill="currentColor" />
    </svg>
  );
}

export function Shell({ children, campName = SITE.name }: { children: ReactNode; campName?: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const hideBar = path.startsWith("/idara");

  return (
    <div className="min-h-screen bg-night text-cream">
      <div className="h-1 bg-clay" />
      <Header campName={campName} />
      <div className={hideBar ? "" : "pb-24 md:pb-0"}>{children}</div>
      <Footer campName={campName} />
      {hideBar ? null : <MobileContribute />}
    </div>
  );
}

function Header({ campName }: { campName: string }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname + s.location.hash });

  useEffect(() => {
    setOpen(false);
  }, [path]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-night/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 press">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line text-clay">
            <Mark className="size-6" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-lg text-cream">{campName}</span>
            <span className="block truncate text-xs text-muted">{SITE.place}</span>
          </span>
        </Link>

        <nav className="ms-auto hidden items-center gap-1 lg:flex" aria-label="الأقسام">
          {NAV.map((item) =>
            "to" in item ? (
              <Link
                key={item.label}
                to={item.to}
                className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-panel hover:text-cream"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-panel hover:text-cream"
              >
                {item.label}
              </a>
            ),
          )}
          <Link
            to="/contribute"
            search={{ need: "general", mode: "specific" }}
            className="press ms-2 inline-flex h-11 items-center rounded-xl bg-clay px-4 text-sm font-semibold text-night"
          >
            ساهم في دعم المخيم
          </Link>
        </nav>

        <button
          type="button"
          className="ms-auto grid size-11 place-items-center rounded-xl border border-line lg:hidden"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "إغلاق القائمة" : "فتح القائمة"}</span>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <nav id="site-menu" className="border-t border-line bg-panel px-4 py-3 lg:hidden" aria-label="القائمة">
          <ul className="grid gap-1">
            {NAV.map((item) => (
              <li key={item.label}>
                {"to" in item ? (
                  <Link to={item.to} className="flex h-12 items-center rounded-xl px-3 text-base hover:bg-panel-2">
                    {item.label}
                  </Link>
                ) : (
                  <a href={item.href} className="flex h-12 items-center rounded-xl px-3 text-base hover:bg-panel-2">
                    {item.label}
                  </a>
                )}
              </li>
            ))}
            <li>
              <Link
                to="/contribute"
                search={{ need: "general", mode: "specific" }}
                className="press mt-1 flex h-12 items-center justify-center rounded-xl bg-clay font-semibold text-night"
              >
                ساهم في دعم المخيم
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

function Footer({ campName }: { campName: string }) {
  return (
    <footer className="border-t border-line bg-panel">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl">{campName}</p>
          <p className="mt-1 text-sm text-muted" dir="ltr">
            {campName === SITE.name ? `${SITE.nameEn} — North Gaza` : "North Gaza"}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted">{SITE.sloganAlt}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-cream">المكان</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{SITE.location}</p>
        </div>
        <div className="grid content-start gap-1 text-sm">
          <Link to="/privacy" className="py-2 text-muted hover:text-cream">
            الخصوصية
          </Link>
          <Link to="/aid" className="py-2 text-muted hover:text-cream">
            توثيق المساعدات
          </Link>
          <Link to="/idara" className="py-2 text-muted hover:text-cream">
            لوحة الإدارة
          </Link>
        </div>
      </div>
      <div className="border-t border-line px-4 py-4 text-center text-xs text-muted">
        لا تُنشر أسماء الأسر ولا بيانات الأطفال. الأرقام والقنوات تظهر بعد التحقق فقط.
      </div>
    </footer>
  );
}

function MobileContribute() {
  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-night/95 px-4 pt-3 backdrop-blur md:hidden">
      <Link
        to="/contribute"
        search={{ need: "general", mode: "specific" }}
        className="press flex h-12 items-center justify-center rounded-xl bg-clay font-semibold text-night"
      >
        ساهم في دعم المخيم
      </Link>
    </div>
  );
}

export function PageIntro({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="mx-auto max-w-3xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16">
      <p className="text-sm font-medium text-clay">{kicker}</p>
      <h1 className="mt-3 font-display text-4xl leading-tight text-cream sm:text-5xl">{title}</h1>
      {children ? <div className="mt-5 space-y-4 text-base leading-relaxed text-muted">{children}</div> : null}
    </header>
  );
}
