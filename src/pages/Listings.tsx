import { ClayFooter, ClayHeader, useSiteSocials, whatsappUrl } from "@/components/ClayLayout";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
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
import { Home, KeyRound, MessageCircle, RotateCcw, Search } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router";

const TYPES = ["apartment", "villa", "chalet", "penthouse", "duplex", "studio", "townhouse"];

/** Headline primary-sale destinations — always offered on the request desk. */
const PRIMARY_AREAS = ["Cairo", "North Coast", "Ain Sokhna"];

const DELIVERY_OPTIONS = [
  { value: "immediate", label: "Immediate" },
  { value: "6m", label: "6 months" },
  { value: "12m", label: "12 months" },
  { value: "2y", label: "2 years" },
  { value: "3y", label: "3 years" },
  { value: "4y", label: "4 years" },
] as const;

const FINISH_OPTIONS = [
  { value: "core-shell", label: "Core & Shell / Unfinished" },
  { value: "semi-finished", label: "Semi-Finished" },
  { value: "fully-finished", label: "Fully Finished" },
  { value: "finished-furnished", label: "Finished-Furnished" },
] as const;

const VALID_PURPOSES = new Set(["primary", "resale", "rent"]);

/** Tolerate stale links like ?purpose=sale from before the primary/resale split. */
function sanitizePurpose(value: string | null): "all" | "primary" | "resale" | "rent" {
  return value && VALID_PURPOSES.has(value)
    ? (value as "primary" | "resale" | "rent")
    : "all";
}

type SearchKey =
  | "purpose"
  | "area"
  | "type"
  | "bedrooms"
  | "delivery"
  | "finish"
  | "q";

function readSearch(searchParams: URLSearchParams): Record<SearchKey, string> {
  return {
    purpose: sanitizePurpose(searchParams.get("purpose")),
    area: searchParams.get("area") || "",
    type: searchParams.get("type") || "",
    bedrooms: String(Number(searchParams.get("bedrooms")) || 0),
    delivery: searchParams.get("delivery") || "",
    finish: searchParams.get("finish") || "",
    q: searchParams.get("q") || "",
  };
}

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state lives in one object and is seeded from the URL once; the
  // URL is written through on every change, so no sync effect is needed.
  // Cross-navigation (e.g. a header link to /listings?purpose=rent) always
  // comes from another route, so this component mounts fresh and re-seeds.
  const [filters, setFilters] = useState(readSearch(searchParams));
  const purpose = filters.purpose as "all" | "primary" | "resale" | "rent";
  const area = filters.area;
  const type = filters.type;
  const bedrooms = Number(filters.bedrooms) || 0;
  const delivery = filters.delivery;
  const finish = filters.finish;
  const q = filters.q;

  const setFilter = (key: SearchKey, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params, { replace: true });
  };

  const areas = useQuery(api.listings.areas);
  const socials = useSiteSocials();

  // Primary Sale is a request desk, not a catalog: the headline destinations
  // are offered even when no listing exists for them yet (so no count shown).
  const dynamicAreas = areas ?? [];
  const areaOptions: { name: string; count?: number }[] =
    purpose === "primary"
      ? [
          ...PRIMARY_AREAS.map((name) => ({ name })),
          ...dynamicAreas
            .filter((a) => !PRIMARY_AREAS.includes(a.name))
            .map((a) => ({ name: a.name, count: a.count })),
        ]
      : dynamicAreas.map((a) => ({ name: a.name, count: a.count }));

  const results = usePaginatedQuery(
    api.listings.list,
    {
      purpose: purpose === "all" ? undefined : purpose,
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
  const changePurpose = (next: "all" | "primary" | "resale" | "rent") => {
    // Delivery only applies to primary (off-plan) sales, and a primary-only
    // area has no catalog to browse — drop both when leaving Primary so they
    // can't filter invisibly on another tab.
    const leavingPrimary = next !== "primary";
    const dropArea =
      leavingPrimary &&
      Boolean(area) &&
      PRIMARY_AREAS.includes(area) &&
      !dynamicAreas.some((a) => a.name === area);

    setFilters((prev) => ({
      ...prev,
      purpose: next === "all" ? "" : next,
      ...(leavingPrimary ? { delivery: "" } : {}),
      ...(dropArea ? { area: "" } : {}),
    }));

    const params = new URLSearchParams(searchParams);
    if (next === "all") params.delete("purpose");
    else params.set("purpose", next);
    if (leavingPrimary) params.delete("delivery");
    if (dropArea) params.delete("area");
    setSearchParams(params, { replace: true });
  };

  const clearFilters = () => {
    setFilters(readSearch(new URLSearchParams()));
    setSearchParams({}, { replace: true });
  };

  /**
   * Primary Sale is a request desk, not a catalog: submitting the filters
   * sends the compiled request straight to the team's WhatsApp — the same
   * number connected in the studio — and a person takes it from there.
   */
  const DELIVERY_LABELS: Record<string, string> = {
    immediate: "Immediate",
    "6m": "Within 6 months",
    "12m": "Within 12 months",
    "2y": "Within 2 years",
    "3y": "Within 3 years",
    "4y": "Within 4 years",
  };
  const FINISH_LABELS: Record<string, string> = {
    "core-shell": "Core & shell",
    "semi-finished": "Semi-finished",
    "fully-finished": "Fully finished",
    "finished-furnished": "Finished & furnished",
  };

  const primaryRequestMessage = () => {
    const lines = [
      "Hello Ask Real Estate 👋",
      "",
      "I'm looking for a primary-sale (direct from developer) property:",
      `• Area: ${area || "Any"}`,
      `• Type: ${type || "Any"}`,
      `• Bedrooms: ${bedrooms ? `${bedrooms}+` : "Any"}`,
      `• Delivery: ${delivery ? (DELIVERY_LABELS[delivery] ?? delivery) : "Any"}`,
      `• Finish: ${finish ? (FINISH_LABELS[finish] ?? finish) : "Any"}`,
    ];
    if (q.trim()) lines.push(`• Keyword: ${q.trim()}`);
    lines.push(
      "",
      "Please send me matching options with prices.",
    );
    return lines.join("\n");
  };

  const handlePrimaryRequest = () => {
    window.open(whatsappUrl(socials.whatsappNumber, primaryRequestMessage()), "_blank", "noopener,noreferrer");
  };

  const activeFilterCount =
    (purpose !== "all" ? 1 : 0) +
    (area ? 1 : 0) +
    (type ? 1 : 0) +
    (bedrooms ? 1 : 0) +
    (purpose === "primary" && delivery ? 1 : 0) +
    (finish ? 1 : 0) +
    (q.trim() ? 1 : 0);

  return (
    <div className="flex min-h-screen flex-col">
      <ClayHeader />

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
          {/* purpose toggle */}
          <div className="clay-well mb-4 flex w-fit flex-wrap items-center gap-1 rounded-full p-1.5">
            <PurposeTab
              active={purpose === "all"}
              onClick={() => changePurpose("all")}
              label="All"
            />
            <PurposeTab
              active={purpose === "primary"}
              onClick={() => changePurpose("primary")}
              icon={<Home className="size-4" />}
              label="Primary Sale"
            />
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

          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (purpose === "primary") {
                handlePrimaryRequest();
                return;
              }
              // Search submits the typed-but-unsubmitted keyword.
              setFilter("q", q.trim());
            }}
          >
            <div className="flex flex-wrap items-center gap-3">
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
                    Send request
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
                  We don't list primary-sale units online. Set your filters above and
                  submit — your request goes straight to our team's WhatsApp, and a
                  person replies with matching options and prices.
                </p>
              <Button
                type="button"
                onClick={handlePrimaryRequest}
                className="clay-btn clay-btn-primary mt-6 rounded-full px-7"
              >
                <MessageCircle className="size-4" />
                Send request on WhatsApp
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
