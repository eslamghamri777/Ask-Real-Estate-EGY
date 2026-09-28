import { ClayFooter, ClayHeader } from "@/components/ClayLayout";
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
import { Home, KeyRound, RotateCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

const TYPES = ["apartment", "villa", "chalet", "penthouse", "duplex", "studio", "townhouse"];

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [purpose, setPurpose] = useState<"all" | "sale" | "rent">(
    (searchParams.get("purpose") as "sale" | "rent") || "all",
  );
  const [area, setArea] = useState(searchParams.get("area") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [bedrooms, setBedrooms] = useState(
    Number(searchParams.get("bedrooms")) || 0,
  );
  const [q, setQ] = useState(searchParams.get("q") || "");

  // keep filter state in sync when the URL changes (e.g. header nav links)
  useEffect(() => {
    setPurpose((searchParams.get("purpose") as "sale" | "rent") || "all");
    setArea(searchParams.get("area") || "");
    setType(searchParams.get("type") || "");
    setBedrooms(Number(searchParams.get("bedrooms")) || 0);
    setQ(searchParams.get("q") || "");
  }, [searchParams]);

  const areas = useQuery(api.listings.areas);

  const results = usePaginatedQuery(
    api.listings.list,
    {
      purpose: purpose === "all" ? undefined : purpose,
      area: area || undefined,
      type: type || undefined,
      bedrooms: bedrooms || undefined,
      q: q.trim() || undefined,
    },
    { initialNumItems: 9 },
  );

  const applyToUrl = (next: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    // keep a typed-but-unsubmitted keyword instead of silently reverting it
    if (!("q" in next)) {
      if (q.trim()) params.set("q", q.trim());
      else params.delete("q");
    }
    setSearchParams(params, { replace: true });
  };

  const changePurpose = (next: "all" | "sale" | "rent") => {
    setPurpose(next);
    applyToUrl({ purpose: next === "all" ? "" : next });
  };

  const clearFilters = () => {
    setPurpose("all");
    setArea("");
    setType("");
    setBedrooms(0);
    setQ("");
    setSearchParams({}, { replace: true });
  };

  const activeFilterCount =
    (purpose !== "all" ? 1 : 0) +
    (area ? 1 : 0) +
    (type ? 1 : 0) +
    (bedrooms ? 1 : 0) +
    (q.trim() ? 1 : 0);

  return (
    <div className="flex min-h-screen flex-col">
      <ClayHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10">
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
          Properties across Egypt
        </h1>
        <p className="mt-2 text-muted-foreground">
          {results.status === "LoadingFirstPage"
            ? "Loading listings…"
            : `Showing ${results.results.length} ${
                results.results.length === 1 ? "property" : "properties"
              }`}
        </p>

        {/* ============ Filters ============ */}
        <section className="clay-card clay-md mt-6 p-5">
          {/* purpose toggle */}
          <div className="clay-well mb-4 flex w-fit items-center gap-1 rounded-full p-1.5">
            <PurposeTab
              active={purpose === "all"}
              onClick={() => changePurpose("all")}
              label="All"
            />
            <PurposeTab
              active={purpose === "sale"}
              onClick={() => changePurpose("sale")}
              icon={<Home className="size-4" />}
              label="Buy"
            />
            <PurposeTab
              active={purpose === "rent"}
              onClick={() => changePurpose("rent")}
              icon={<KeyRound className="size-4" />}
              label="Rent"
            />
          </div>

          <form
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
              applyToUrl({ q: q.trim() });
            }}
          >
            <Select
              value={area || "any-area"}
              onValueChange={(v) => {
                setArea(v === "any-area" ? "" : v);
                applyToUrl({ area: v === "any-area" ? "" : v });
              }}
            >
              <SelectTrigger className="clay-sheen h-12 rounded-full border-none bg-card px-5 text-sm font-semibold shadow-none">
                <SelectValue placeholder="Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any-area">Any area</SelectItem>
                {(areas ?? []).map((a) => (
                  <SelectItem key={a.name} value={a.name}>
                    {a.name} ({a.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={type || "any-type"}
              onValueChange={(v) => {
                setType(v === "any-type" ? "" : v);
                applyToUrl({ type: v === "any-type" ? "" : v });
              }}
            >
              <SelectTrigger className="clay-sheen h-12 rounded-full border-none bg-card px-5 text-sm font-semibold shadow-none">
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
              onValueChange={(v) => {
                const n = Number(v);
                setBedrooms(n);
                applyToUrl({ bedrooms: n ? String(n) : "" });
              }}
            >
              <SelectTrigger className="clay-sheen h-12 rounded-full border-none bg-card px-5 text-sm font-semibold shadow-none">
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

            {/* keyword row */}
            <div className="relative sm:col-span-2 lg:col-span-3">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Keyword — e.g. Nile view, furnished…"
                className="clay-input h-12 pl-10 shadow-none"
              />
            </div>
            <div className="flex gap-3 sm:col-span-2 lg:col-span-3 lg:justify-end">
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
                Search
              </Button>
            </div>
          </form>
        </section>

        {/* ============ Results ============ */}
        <section className="mt-8 pb-4">
          {results.isLoading ? (
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
