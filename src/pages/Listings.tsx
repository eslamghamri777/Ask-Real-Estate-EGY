import {
  ClayFooter,
  ClayHeader,
  useSiteSocials,
  whatsappUrl,
} from "@/components/ClayLayout";
import { DeveloperLogo } from "@/components/DeveloperLogo";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { usePaginatedQuery, useQuery } from "convex/react";
import {
  Home,
  KeyRound,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  MessageCircle,
  RotateCcw,
  Search,
} from "lucide-react";
import {
  AREAS,
  DELIVERY_OPTIONS,
  FINISH_OPTIONS,
  PRIMARY_DEVELOPERS,
  TYPES,
} from "@/lib/filters";
import { DELIVERY_LABELS, FINISH_LABELS } from "@/lib/primaryRequest";
import { developerSlug } from "@/lib/filters";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

const VALID_PURPOSES = new Set(["primary", "resale", "rent"]);

/** Tolerate stale links like ?purpose=sale from before the primary/resale split. */
function sanitizePurpose(value: string | null): "primary" | "resale" | "rent" {
  return value && VALID_PURPOSES.has(value)
    ? (value as "primary" | "resale" | "rent")
    : // No (or invalid) purpose in the URL — the catalog opens on Primary Sale.
      "primary";
}

type SearchKey =
  | "purpose"
  | "area"
  | "type"
  | "bedrooms"
  | "delivery"
  | "developer"
  | "finish"
  | "q";

function readSearch(searchParams: URLSearchParams): Record<SearchKey, string> {
  return {
    purpose: sanitizePurpose(searchParams.get("purpose")),
    area: searchParams.get("area") || "",
    type: searchParams.get("type") || "",
    bedrooms: String(Number(searchParams.get("bedrooms")) || 0),
    delivery: searchParams.get("delivery") || "",
    developer: searchParams.get("developer") || "",
    finish: searchParams.get("finish") || "",
    q: searchParams.get("q") || "",
  };
}

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filter state lives in one object and is seeded from the URL, and the URL
  // is written through on every change. The effect below also re-seeds when
  // the URL changes out-of-band (e.g. the header's search dialog on this
  // same route), while internal writes are no-ops because they match the URL.
  const [filters, setFilters] = useState(readSearch(searchParams));
  const purpose = filters.purpose as "primary" | "resale" | "rent";
  const area = filters.area;
  const type = filters.type;
  const bedrooms = Number(filters.bedrooms) || 0;
  const delivery = filters.delivery;
  const developer = filters.developer;
  const finish = filters.finish;
  const q = filters.q;

  // The header's search dialog can change the URL while this component is
  // already mounted (same-route navigation). Re-seed local filter state from
  // the URL whenever it changes; internal writes keep both sides in sync, so
  // internal writes re-set the same values and are no-ops. Adjusting state
  // during render (React's documented pattern for "state that depends on
  // props") avoids the setState-in-effect cascading-render problem.
  const [prevParams, setPrevParams] = useState(searchParams);
  if (prevParams !== searchParams) {
    setPrevParams(searchParams);
    setFilters(readSearch(searchParams));
  }

  const setFilter = (key: SearchKey, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params, { replace: true });
  };

  const areas = useQuery(api.listings.areas);

  // Only the destinations we cover are offered, across every tab, with live
  // counts where we have them. Primary Sale is a request desk, so a destination
  // with no listing yet is still offered (just without a count).
  const catalogAreas = areas ?? [];
  const areaOptions: { name: string; count?: number }[] = [
    ...AREAS.map((name) => ({
      name,
      count: catalogAreas.find((a) => a.name === name)?.count,
    })),
    // A deep link (e.g. a landing-page area tile) can still carry an area we no
    // longer offer — keep it selectable so the trigger shows it and can clear it.
    ...(area && !AREAS.includes(area) ? [{ name: area }] : []),
  ];

  const results = usePaginatedQuery(
    api.listings.list,
    {
      purpose,
      area: area || undefined,
      type: type || undefined,
      bedrooms: bedrooms || undefined,
      delivery:
        purpose === "primary" && delivery
          ? (delivery as "immediate" | "6m" | "12m" | "2y" | "3y" | "4y")
          : undefined,
      finish: (finish || undefined) as
        | "core-shell"
        | "semi-finished"
        | "fully-finished"
        | "finished-furnished"
        | undefined,
      q: q.trim() || undefined,
    },
    { initialNumItems: 9 },
  );

  // Purpose changes touch several filters at once, so they bypass setFilter:
  // chained setFilter calls would each rebuild the URL from the same stale
  // searchParams and clobber each other's writes.
  const changePurpose = (next: "primary" | "resale" | "rent") => {
    // Delivery and developer only apply to primary (off-plan) sales — drop both
    // when leaving Primary so they can't filter invisibly on another tab. Area
    // now applies to every tab, so it survives the switch.
    const leavingPrimary = next !== "primary";

    setFilters((prev) => ({
      ...prev,
      purpose: next,
      ...(leavingPrimary ? { delivery: "", developer: "" } : {}),
    }));

    const params = new URLSearchParams(searchParams);
    params.set("purpose", next);
    if (leavingPrimary) {
      params.delete("delivery");
      params.delete("developer");
    }
    setSearchParams(params, { replace: true });
  };

  const clearFilters = () => {
    setFilters(readSearch(new URLSearchParams()));
    setSearchParams({}, { replace: true });
  };

  /**
   * Primary Sale is a request desk, not a catalog: the requirements picked
   * here open WhatsApp with the request pre-filled, so the customer confirms
   * the send themselves. The details page (/request) stays available as an
   * alternative for customers who'd rather fill a form.
   */
  const socials = useSiteSocials();

  const openWhatsAppRequest = () => {
    const cap = (value: string) =>
      value ? value[0].toUpperCase() + value.slice(1) : "";
    // The label maps are keyed by their value unions; the desk state holds
    // plain strings, so index through a string-keyed view.
    const deliveryLabel =
      (DELIVERY_LABELS as Record<string, string>)[delivery] ?? delivery;
    const finishLabel = (FINISH_LABELS as Record<string, string>)[finish] ?? finish;
    const lines = [
      "New primary-sale request — Ask Real Estate",
      "",
      "First name:",
      "Last name:",
      "",
      `Area: ${area || "Any"}`,
      `Type: ${type ? cap(type) : "Any"}`,
      `Bedrooms: ${bedrooms ? `${bedrooms}+` : "Any"}`,
      `Delivery: ${delivery ? deliveryLabel : "Any"}`,
      `Developer: ${developer || "Any"}`,
      `Finish: ${finish ? finishLabel : "Any"}`,
    ];
    if (q.trim()) lines.push(`Keyword: ${q.trim()}`);
    lines.push(
      "",
      "Fill in your first and last name above, then press send — we'll reply with matching options and prices.",
    );
    // Same-tab navigation to wa.me is never blocked, unlike a pop-up.
    window.location.href = whatsappUrl(socials.whatsappNumber, lines.join("\n"));
  };
  const goToRequest = () => {
    const params = new URLSearchParams({ purpose: "primary" });
    if (area) params.set("area", area);
    if (type) params.set("type", type);
    if (bedrooms) params.set("bedrooms", String(bedrooms));
    if (delivery) params.set("delivery", delivery);
    if (developer) params.set("developer", developer);
    if (finish) params.set("finish", finish);
    if (q.trim()) params.set("q", q.trim());
    navigate(`/request?${params.toString()}`);
  };

  // Purpose is the tab itself now (no "All" baseline), so it isn't counted as
  // an active filter — only the choices within a tab are.
  const activeFilterCount =
    (area ? 1 : 0) +
    (type ? 1 : 0) +
    (bedrooms ? 1 : 0) +
    (purpose === "primary" && delivery ? 1 : 0) +
    (purpose === "primary" && developer ? 1 : 0) +
    (finish ? 1 : 0) +
    (q.trim() ? 1 : 0);

  // The purpose toggle lives in the top bar (between the brand and the
  // Search Properties button) on md+ screens; it's hidden on small screens
  // where the header can't fit it without overflowing.
  const purposeToggle = (
    <div
      aria-label="Property purpose"
      className="clay-well mx-auto hidden w-fit items-center gap-1 rounded-full p-1.5 md:flex"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={`clay-squish flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
              purpose === "primary"
                ? "clay-sheen bg-card clay-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home className="size-4" />
            Primary Sale
            <ChevronDown className="size-3.5 opacity-60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="max-h-[26rem] w-72 overflow-y-auto rounded-2xl p-1.5"
        >
          <DropdownMenuLabel className="flex items-center justify-between gap-2 px-2 pt-2 pb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Choose a developer
            <span className="text-[10px] tabular-nums opacity-60">
              {PRIMARY_DEVELOPERS.length}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => changePurpose("primary")}
            className="gap-3 rounded-xl py-2.5"
          >
            <span className="clay-sheen inline-flex size-8 shrink-0 items-center justify-center rounded-[0.6rem] bg-primary text-primary-foreground">
              <LayoutGrid className="size-4" />
            </span>
            <span className="text-sm font-semibold">All developers</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {PRIMARY_DEVELOPERS.map((d) => (
            <DropdownMenuItem
              key={d}
              onSelect={() => navigate(`/developer/${developerSlug(d)}`)}
              className="group/item gap-3 rounded-xl py-2"
            >
              <DeveloperLogo name={d} size="sm" />
              <span className="truncate text-sm font-medium">{d}</span>
              <ChevronRight className="ml-auto size-3.5 text-muted-foreground opacity-0 transition-opacity group-focus/item:opacity-100" />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <PurposeTab
        active={purpose === "resale"}
        onClick={() => changePurpose("resale")}
        label="Resale"
      />
      <PurposeTab
        active={purpose === "rent"}
        onClick={() => changePurpose("rent")}
        icon={<KeyRound className="size-4" />}
        label="Rent"
      />
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <ClayHeader middle={purposeToggle} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10">
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
          Properties across Egypt
        </h1>
        <p className="mt-2 text-muted-foreground">
          {purpose === "primary"
            ? "Primary sale — tell us what you need and we'll find it"
            : results.status === "LoadingFirstPage"
              ? "Loading listings…"
              : `Showing ${results.results.length} ${
                  results.results.length === 1 ? "property" : "properties"
                }`}
        </p>

        {/* ============ Filters ============ */}
        <section className="clay-card clay-md mt-6 p-5">
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (purpose === "primary") {
                openWhatsAppRequest();
                return;
              }
              // Search submits the typed-but-unsubmitted keyword.
              setFilter("q", q.trim());
            }}
          >
            <div className="flex flex-wrap items-center gap-3">
            {/* Developer: on md+ screens it's chosen in the top bar (Primary
               Sale menu → developer page). That toggle is hidden on small
               screens, so the panel carries its own developer select there
               (see below, next to Delivery time). An explicit ?developer=
               deep link (e.g. from /request "edit") is still honored by the
               WhatsApp request. */}

            <Select
              value={area || "any-area"}
              onValueChange={(v) => setFilter("area", v === "any-area" ? "" : v)}
            >
              <SelectTrigger className="clay-sheen h-12 w-auto rounded-full border-none bg-card px-5 text-sm font-semibold shadow-none">
                <SelectValue placeholder="Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any-area">Any area</SelectItem>
                {areaOptions.map((a) => (
                  <SelectItem key={a.name} value={a.name}>
                    {a.count ? `${a.name} (${a.count})` : a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={type || "any-type"}
              onValueChange={(v) => setFilter("type", v === "any-type" ? "" : v)}
            >
              <SelectTrigger className="clay-sheen h-12 w-auto rounded-full border-none bg-card px-5 text-sm font-semibold shadow-none">
                <SelectValue placeholder="Property type" />
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
              onValueChange={(v) => setFilter("bedrooms", Number(v) ? v : "")}
            >
              <SelectTrigger className="clay-sheen h-12 w-auto rounded-full border-none bg-card px-5 text-sm font-semibold shadow-none">
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n === 0 ? "Any beds" : `${n}+ beds`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {purpose === "primary" && (
              <Select
                value={delivery || "any-delivery"}
                onValueChange={(v) =>
                  setFilter("delivery", v === "any-delivery" ? "" : v)
                }
              >
                <SelectTrigger className="clay-sheen h-12 w-auto rounded-full border-none bg-card px-5 text-sm font-semibold shadow-none">
                  <SelectValue placeholder="Delivery time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any-delivery">Any delivery time</SelectItem>
                  {DELIVERY_OPTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* On md+ screens the developer is picked from the top bar's
                Primary Sale menu; that toggle is hidden on small screens, so
                offer the same choice here — mobile only, primary only. */}
            {purpose === "primary" && (
              <Select
                value={developer || "any-developer"}
                onValueChange={(v) =>
                  setFilter("developer", v === "any-developer" ? "" : v)
                }
              >
                <SelectTrigger className="clay-sheen h-12 w-auto rounded-full border-none bg-card px-5 text-sm font-semibold shadow-none md:hidden">
                  {/* Carries its own label: a closed Radix SelectValue renders
                      nothing until its menu has been opened once, and this
                      control has to read clearly the moment the page loads. */}
                  <SelectValue placeholder="Developer">
                    {developer || "Any developer"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[22rem]">
                  <SelectItem value="any-developer">Any developer</SelectItem>
                  {PRIMARY_DEVELOPERS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select
              value={finish || "any-finish"}
              onValueChange={(v) => setFilter("finish", v === "any-finish" ? "" : v)}
            >
              <SelectTrigger className="clay-sheen h-12 w-auto rounded-full border-none bg-card px-5 text-sm font-semibold shadow-none">
                <SelectValue placeholder="Finish" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any-finish">Any finish</SelectItem>
                {FINISH_OPTIONS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>

            {/* keyword row */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setFilter("q", e.target.value)}
                placeholder="Keyword — e.g. Nile view, furnished…"
                className="clay-input h-12 pl-10 shadow-none"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                onClick={clearFilters}
                variant="ghost"
                className="clay-btn clay-btn-light h-12 rounded-full px-5 text-sm"
              >
                <RotateCcw className="size-4" />
                Clear{activeFilterCount ? ` (${activeFilterCount})` : ""}
              </Button>
              <Button
                type="submit"
                className="clay-btn clay-btn-primary h-12 rounded-full px-7"
              >
                {purpose === "primary" ? (
                  <>
                    <MessageCircle className="size-4" />
                    Continue
                  </>
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </form>
        </section>

        {/* ============ Results ============ */}
        {/* Primary Sale is a request desk: no posts are shown — submitting the
            filters sends the request to the team's WhatsApp instead. */}
        <section className="mt-8 pb-4">
          {purpose === "primary" ? (
            <div className="clay-card mx-auto max-w-lg mt-2 overflow-hidden text-center">
              {/* 0% brokerage promise — the primary desk's headline offer */}
              <div className="bg-primary px-8 pb-8 pt-7 text-primary-foreground">
                <span className="eyebrow text-primary-foreground/70">
                  Expert advisory — at no cost to you
                </span>
                <p className="font-display mt-2 text-4xl leading-none tracking-tight">
                  Enjoy <span className="italic">0%</span> brokerage fees
                </p>
                <div className="mx-auto mt-5 h-px w-12 bg-primary-foreground/40" />
              </div>

              <div className="px-8 pb-10 pt-9">
                <span className="clay-icon clay-sheen mx-auto size-14 bg-primary text-primary-foreground">
                  <MessageCircle className="size-6" />
                </span>
                <h2 className="font-display mt-4 text-xl">Tell us what you're looking for</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  We don't list primary-sale units online. Set your filters above
                  and tap Continue — WhatsApp opens with your request already
                  filled in, so you just press send. A person replies with
                  matching options and prices.
                </p>
              <Button
                type="button"
                onClick={goToRequest}
                variant="ghost"
                className="clay-btn clay-btn-light mt-6 rounded-full px-7"
              >
                <MessageCircle className="size-4" />
                Prefer a form? Add your details
              </Button>
              </div>
            </div>
          ) : results.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-[1.75rem]" />
              ))}
            </div>
          ) : results.results.length === 0 ? (
            <div className="clay-card mx-auto max-w-lg px-8 py-12 text-center">
              <span className="clay-icon clay-sheen mx-auto size-14 bg-clay-blush">
                <Search className="size-6" />
              </span>
              <h2 className="font-display mt-4 text-xl">No matching properties</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Nothing matches this combination right now. Try widening your
                search — fewer filters, or another area.
              </p>
              <Button
                onClick={clearFilters}
                className="clay-btn clay-btn-primary mt-5 rounded-full px-6"
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.results.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>

              {results.status === "CanLoadMore" && (
                <div className="mt-10 flex justify-center">
                  <Button
                    onClick={() => results.loadMore(9)}
                    className="clay-btn clay-btn-light h-12 rounded-full px-8"
                  >
                    Show more
                  </Button>
                </div>
              )}
              {results.status === "Exhausted" && results.results.length > 9 && (
                <p className="mt-10 text-center text-sm text-muted-foreground">
                  You've reached the end of the results.
                </p>
              )}
            </>
          )}
        </section>
      </main>

      <ClayFooter />
    </div>
  );
}

function PurposeTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`clay-squish flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
        active ? "clay-sheen bg-card clay-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
