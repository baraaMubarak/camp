import { createFileRoute } from "@tanstack/react-router";
import { AdminPanel } from "@/components/admin-panel";
import { Shell } from "@/components/site-chrome";
import { SITE } from "@/content/site";
import { getGuardStatus } from "@/lib/camp.functions";

export const Route = createFileRoute("/idara")({
  loader: () => getGuardStatus(),
  head: () => ({
    meta: [
      { title: `لوحة الإدارة – ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: IdaraPage,
});

function IdaraPage() {
  const guard = Route.useLoaderData();
  return (
    <Shell>
      <main id="content">
        <AdminPanel claimed={guard.claimed} />
      </main>
    </Shell>
  );
}
