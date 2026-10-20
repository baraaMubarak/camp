import { createFileRoute } from "@tanstack/react-router";
import { AdminPanel } from "@/components/admin-panel";
import { Shell } from "@/components/site-chrome";
import { getGuardStatus, getPublicCamp } from "@/lib/camp.functions";

export const Route = createFileRoute("/idara")({
  loader: async () => {
    const [guard, camp] = await Promise.all([getGuardStatus(), getPublicCamp()]);
    return { claimed: guard.claimed, campName: camp.campName };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `لوحة الإدارة – ${loaderData?.campName ?? "مخيم السلطان 1"}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: IdaraPage,
});

function IdaraPage() {
  const guard = Route.useLoaderData();
  return (
    <Shell campName={guard.campName}>
      <main id="content">
        <AdminPanel claimed={guard.claimed} />
      </main>
    </Shell>
  );
}
