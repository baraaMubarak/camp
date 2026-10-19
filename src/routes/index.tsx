import { createFileRoute } from "@tanstack/react-router";
import { HomeView } from "@/components/home-view";
import { Shell } from "@/components/site-chrome";
import { SITE } from "@/content/site";
import { getPublicCamp } from "@/lib/camp.functions";

export const Route = createFileRoute("/")({
  loader: () => getPublicCamp(),
  head: () => ({
    meta: [
      { title: `${SITE.name} – ${SITE.place}` },
      {
        name: "description",
        content: `${SITE.slogan} موقع يعرّف باحتياجات مخيم السلطان 1 في بيت لاهيا، شمال غزة.`,
      },
    ],
  }),
  component: Home,
});

function Home() {
  const camp = Route.useLoaderData();
  return (
    <Shell>
      <HomeView camp={camp} />
    </Shell>
  );
}
