import {
  ClayFooter,
  ClayHeader,
  useSiteSocials,
  whatsappUrl,
} from "@/components/ClayLayout";
import { DeveloperLogo } from "@/components/DeveloperLogo";
import { DeveloperScene } from "@/components/DeveloperScene";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AREAS,
  PRIMARY_DEVELOPERS,
  TYPES,
  developerFromSlug,
  developerSlug,
} from "@/lib/filters";
import { DELIVERY_LABELS, FINISH_LABELS } from "@/lib/primaryRequest";
import { developerProfile } from "@/lib/developerProfiles";
import { Building2, KeyRound, MessageCircle, RotateCcw, Search } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router";
import { useState } from "react";

/**
 * Developer landing page — opened from the Primary Sale dropdown on the
 * listings desk. Shows the developer's details and a requirements panel
 * (area, type, beds, delivery time, finish); submitting opens WhatsApp with
 * the request pre-filled for this developer, same flow as the desk.
 */
export default function Developer() {
  const { slug = "" } = useParams();
  const developer = developerFromSlug(slug);

  return (
    <div className="flex min-h-screen flex-col">
      <ClayHeader />

      {developer ? (
        <DeveloperDesk developer={developer} />
      ) : (
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-16">
          <div className="clay-card clay-md px-8 py-12 text-center">
            <span className="clay-icon clay-sheen mx-auto size-14 bg-primary text-primary-foreground">
              <Building2 className="size-6" />
            </span>
            <h1 className="font-display mt-4 text-2xl">Developer not found</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We don't have a page for that developer yet — but we still source
              their units. Browse the primary-sale desk instead.
            </p>
            <Button asChild className="clay-btn clay-btn-primary mt-6 h-11 rounded-full px-6">
              <Link to="/listings?purpose=primary">Go to Primary Sale</Link>
            </Button>
          </div>
        </main>
      )}

      <ClayFooter />
    </div>
  );
}

function DeveloperDesk({ developer }: { developer: string }) {
  const [searchParams] = useSearchParams();
  const socials = useSiteSocials();
  const profile = developerProfile(developer);

  // Requirements come in from the URL (e.g. /request → desk links), then live
  // in local state; the developer itself is fixed by the page.
  const [area, setArea] = useState(searchParams.get("area") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [bedrooms, setBedrooms] = useState(Number(searchParams.get("bedrooms")) || 0);
  const [delivery, setDelivery] = useState(searchParams.get("delivery") ?? "");
  const [finish, setFinish] = useState(searchParams.get("finish") ?? "");

  const clearFilters = () => {
    setArea("");
    setType("");
    setBedrooms(0);
    setDelivery("");
    setFinish("");
  };

  /** WhatsApp request pinned to this developer, same text as the desk sends. */
  const openWhatsAppRequest = () => {
    const deliveryLabel = (DELIVERY_LABELS as Record<string, string>)[delivery] ?? delivery;
    const finishLabel = (FINISH_LABELS as Record<string, string>)[finish] ?? finish;
    const lines = [
      "New primary-sale request — Ask Real Estate",
      "",
      "First name:",
      "Last name:",
      "",
      `Area: ${area || "Any"}`,
      `Type: ${type ? type[0].toUpperCase() + type.slice(1) : "Any"}`,
      `Bedrooms: ${bedrooms ? `${bedrooms}+` : "Any"}`,
      `Delivery: ${delivery ? deliveryLabel : "Any"}`,
      `Developer: ${developer}`,
      `Finish: ${finish ? finishLabel : "Any"}`,
      "",
      "Fill in your first and last name above, then press send — we'll reply with matching options and prices.",
    ];
    window.location.href = whatsappUrl(socials.whatsappNumber, lines.join("\n"));
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-10">
      {/* ============ Developer details ============ */}
      <section className="clay-card clay-md overflow-hidden">
        <DeveloperScene
          name={developer}
          badge
          className="h-40 w-full sm:h-56"
        />
        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-12 flex flex-wrap items-end gap-4">
            <DeveloperLogo
              name={developer}
              size="xl"
              className="relative z-10 ring-4 ring-card"
            />
          </div>
          <p className="eyebrow mt-5">Primary sale · Developer</p>
          <h1 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
            {developer}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Off-plan and new-launch units from {developer} across Egypt. Pick
            your requirements below and send them to our team — we'll come back
            with matching {developer} projects, prices and payment plans.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-border bg-card/70 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground">
              Off-plan & new launches
            </span>
            <span className="rounded-full border border-border bg-card/70 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground">
              Prices shared on request
            </span>
            <span className="rounded-full border border-border bg-card/70 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground">
              Reply on WhatsApp
            </span>
          </div>
          <aside className="mt-6 rounded-2xl border border-border/80 bg-secondary/60 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-3xl">
                <p className="eyebrow">Developer at a glance</p>
                <h2 className="font-display mt-1 text-lg tracking-tight">{profile.heading}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{profile.detail}</p>
              </div>
              {profile.source && (
                <a
                  href={profile.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Source: {profile.source.label}
                </a>
              )}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground/80">
              Project notes are context, not a live availability or delivery-status update. Ask our team to confirm current details.
            </p>
          </aside>
        </div>
      </section>

      {/* ============ Requirements ============ */}
      <section className="clay-card clay-md mt-6 p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Tell us what you’re looking for</p>
            <h2 className="font-display mt-1 text-xl tracking-tight">Find a {developer} property</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose a few preferences and our team will send matching options.</p>
          </div>
        </div>
        <form
          className="flex flex-col gap-3 xl:flex-row xl:flex-nowrap xl:items-center"
          onSubmit={(e) => {
            e.preventDefault();
            openWhatsAppRequest();
          }}
        >
          <div className="flex flex-wrap items-center gap-3 xl:min-w-0 xl:flex-1 xl:flex-nowrap xl:gap-2">
            <Select
              value={area || "any-area"}
              onValueChange={(v) => setArea(v === "any-area" ? "" : v)}
            >
              <SelectTrigger className="clay-sheen h-12 w-auto rounded-full border-none bg-card px-5 text-sm font-semibold shadow-none xl:w-full xl:min-w-0 xl:flex-1 xl:px-3">
                <SelectValue className="max-w-full truncate" placeholder="Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any-area">Any area</SelectItem>
                {AREAS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={type || "any-type"}
              onValueChange={(v) => setType(v === "any-type" ? "" : v)}
            >
              <SelectTrigger className="clay-sheen h-12 w-auto rounded-full border-none bg-card px-5 text-sm font-semibold shadow-none xl:w-full xl:min-w-0 xl:flex-1 xl:px-3">
                <SelectValue className="max-w-full truncate" placeholder="Property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any-type">Any type</SelectItem>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(bedrooms)}
              onValueChange={(v) => setBedrooms(Number(v) ? Number(v) : 0)}
            >
              <SelectTrigger className="clay-sheen h-12 w-auto rounded-full border-none bg-card px-5 text-sm font-semibold shadow-none xl:w-full xl:min-w-0 xl:flex-1 xl:px-3">
                <SelectValue className="max-w-full truncate" placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n === 0 ? "Any beds" : `${n}+ beds`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={delivery || "any-delivery"}
              onValueChange={(v) => setDelivery(v === "any-delivery" ? "" : v)}
            >
              <SelectTrigger className="clay-sheen h-12 w-auto rounded-full border-none bg-card px-5 text-sm font-semibold shadow-none xl:w-full xl:min-w-0 xl:flex-1 xl:px-3">
                <SelectValue className="max-w-full truncate" placeholder="Delivery time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any-delivery">Any delivery time</SelectItem>
                {(Object.entries(DELIVERY_LABELS) as [string, string][]).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            <Select
              value={finish || "any-finish"}
              onValueChange={(v) => setFinish(v === "any-finish" ? "" : v)}
            >
              <SelectTrigger className="clay-sheen h-12 w-auto rounded-full border-none bg-card px-5 text-sm font-semibold shadow-none xl:w-full xl:min-w-0 xl:flex-1 xl:px-3">
                <SelectValue className="max-w-full truncate" placeholder="Finish" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any-finish">Any finish</SelectItem>
                {(Object.entries(FINISH_LABELS) as [string, string][]).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 xl:shrink-0 xl:flex-nowrap xl:justify-end">
            <Button
              type="button"
              onClick={clearFilters}
              variant="ghost"
              className="clay-btn clay-btn-light h-12 whitespace-nowrap rounded-full px-4 text-sm"
            >
              <RotateCcw className="size-4" />
              Clear
            </Button>
            <Button
              type="submit"
              className="clay-btn clay-btn-primary h-12 whitespace-nowrap rounded-full px-5"
            >
              <MessageCircle className="size-4" />
              Continue
            </Button>
          </div>
        </form>
      </section>

      {/* ============ Other developers ============ */}
      <DeveloperStrip current={developer} />

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Search className="size-3.5" />
        Prices stay private — the team replies on WhatsApp with matching {developer} options.
      </p>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <KeyRound className="mr-1.5 inline size-4" />
        Looking at other developers? Use the Primary Sale menu in the top bar.
      </p>
    </main>
  );
}

/**
 * The rest of the primary-sale roster, as a swipeable row of brand marks —
 * the same marks the top-bar menu shows, so a customer can hop between
 * developers without going back to the listings desk.
 */
function DeveloperStrip({ current }: { current: string }) {
  const others = PRIMARY_DEVELOPERS.filter((d) => d !== current);

  return (
    <section className="mt-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Other developers</p>
          <h2 className="font-display mt-1 text-xl tracking-tight">
            Ask about another developer
          </h2>
        </div>
        <span className="hidden text-xs text-muted-foreground sm:block">
          {others.length} more
        </span>
      </div>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {others.map((d) => (
          <Link
            key={d}
            to={`/developer/${developerSlug(d)}`}
            className="clay-card clay-card-hover w-44 shrink-0 overflow-hidden"
          >
            <DeveloperScene name={d} className="h-24 w-full" />
            <div className="flex items-center gap-2.5 p-3">
              <DeveloperLogo name={d} size="sm" />
              <span className="text-xs font-semibold leading-snug">{d}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
