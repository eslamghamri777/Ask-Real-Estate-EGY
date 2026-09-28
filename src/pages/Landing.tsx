import { ClayFooter, ClayHeader } from "@/components/ClayLayout";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import {
  Building2,
  Home,
  KeyRound,
  MapPin,
  Search,
  Star,
} from "lucide-react";
import { useQuery } from "convex/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

const areaChipHues = [
  "bg-clay-mint",
  "bg-clay-sky",
  "bg-clay-blush",
  "bg-clay-lilac",
  "bg-clay-sand",
  "bg-clay-butter",
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

export default function Landing() {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState<"sale" | "rent">("sale");
  const [area, setArea] = useState("");
  const [q, setQ] = useState("");

  const featured = useQuery(api.listings.featured);
  const areas = useQuery(api.listings.areas);
  const stats = useQuery(api.listings.stats);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (purpose) params.set("purpose", purpose);
    if (area) params.set("area", area);
    if (q.trim()) params.set("q", q.trim());
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ClayHeader />

      <main className="flex-1">
        {/* ============ Hero: search bar + areas first ============ */}
        <section className="mx-auto w-full max-w-6xl px-4 pt-10 sm:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="clay-chip clay-sm bg-clay-butter px-4 py-2 text-sm"
            >
              <MapPin className="size-4" />
              Cairo, Egypt
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="clay-text mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl"
            >
              Find your place
              <br />
              in <span className="text-primary">Cairo</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg"
            >
              Homes for sale and rent across the city — browse real listings
              with photos, in the areas you love.
            </motion.p>
          </div>

          {/* Clay search bar */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="clay-card clay-lg mx-auto mt-8 max-w-4xl p-4 sm:p-5"
          >
            {/* Buy / Rent toggle */}
            <div className="clay-well mx-auto mb-4 flex w-fit items-center gap-1 rounded-full p-1.5">
              <PurposeTab
                active={purpose === "sale"}
                onClick={() => setPurpose("sale")}
                icon={<Home className="size-4" />}
                label="Buy"
              />
              <PurposeTab
                active={purpose === "rent"}
                onClick={() => setPurpose("rent")}
                icon={<KeyRound className="size-4" />}
                label="Rent"
              />
            </div>

            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
            >
              <div className="relative flex-1">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Area — Zamalek, Maadi, New Cairo…"
                  className="clay-input pl-10"
                  aria-label="Area"
                />
              </div>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Keyword — villa, penthouse, Nile…"
                  className="clay-input pl-10"
                  aria-label="Keyword"
                />
              </div>
              <Button
                type="submit"
                className="clay-btn clay-btn-primary h-12 shrink-0 rounded-full px-7 text-base"
              >
                <Search className="size-4" />
                Search
              </Button>
            </form>
          </motion.div>

          {/* Area quick chips */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.36 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="text-sm font-semibold text-muted-foreground">
              Popular:
            </span>
            {["Zamalek", "Maadi", "New Cairo", "Heliopolis", "Sheikh Zayed", "Downtown"].map(
              (name) => (
                <button
                  key={name}
                  onClick={() => navigate(`/listings?area=${encodeURIComponent(name)}`)}
                  className="clay-chip clay-squish bg-card px-4 py-2 text-sm"
                >
                  <MapPin className="size-3.5 text-primary" />
                  {name}
                </button>
              ),
            )}
          </motion.div>
        </section>

        {/* ============ Areas ============ */}
        <section className="mx-auto w-full max-w-6xl px-4 pt-20">
          <motion.div {...fadeUp} className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Explore Cairo by area
              </h2>
              <p className="mt-1.5 text-muted-foreground">
                Every neighborhood has its own rhythm — pick yours.
              </p>
            </div>
          </motion.div>

          <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {areas === undefined
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="clay-sm h-44 rounded-[1.5rem]" />
                ))
              : areas.map((a, i) => (
                  <motion.button
                    key={a.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.45, delay: i * 0.05 }}
                    onClick={() => navigate(`/listings?area=${encodeURIComponent(a.name)}`)}
                    className={`clay-card clay-card-hover clay-squish relative h-44 overflow-hidden text-left ${
                      areaChipHues[i % areaChipHues.length]
                    }`}
                  >
                    <img
                      src={a.photo}
                      alt=""
                      loading="lazy"
                      className="absolute inset-x-4 top-4 h-20 rounded-2xl object-cover shadow-md"
                    />
                    <div className="absolute inset-x-4 bottom-4">
                      <p className="text-base font-extrabold">{a.name}</p>
                      <p className="text-xs font-semibold opacity-70">
                        {a.count} {a.count === 1 ? "listing" : "listings"}
                      </p>
                    </div>
                  </motion.button>
                ))}
          </div>
        </section>

        {/* ============ Featured listings ============ */}
        <section className="mx-auto w-full max-w-6xl px-4 pt-20">
          <motion.div {...fadeUp} className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="clay-chip clay-sm bg-clay-mint px-3.5 py-1.5 text-xs">
                <Star className="size-3.5" />
                Handpicked
              </span>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Featured homes
              </h2>
              <p className="mt-1.5 text-muted-foreground">
                A first look at what's on the market right now.
              </p>
            </div>
            <Button
              asChild
              className="clay-btn clay-btn-light h-11 rounded-full px-6"
            >
              <Link to="/listings">View all listings</Link>
            </Button>
          </motion.div>

          <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured === undefined
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-96 rounded-[1.75rem]" />
                ))
              : featured.map((l, i) => (
                  <motion.div
                    key={l._id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.07 }}
                  >
                    <ListingCard listing={l} />
                  </motion.div>
                ))}
          </div>
        </section>

        {/* ============ Stats strip ============ */}
        <section className="mx-auto w-full max-w-6xl px-4 pt-20">
          <motion.div
            {...fadeUp}
            className="clay-card clay-md grid gap-6 px-8 py-8 text-center sm:grid-cols-3"
          >
            <StatChip
              hue="bg-clay-butter"
              icon={<Building2 className="size-5" />}
              value={stats === undefined ? "—" : `${stats.total}`}
              label="Listings on Ask"
            />
            <StatChip
              hue="bg-clay-mint"
              icon={<Home className="size-5" />}
              value={stats === undefined ? "—" : `${stats.forSale}`}
              label="Homes for sale"
            />
            <StatChip
              hue="bg-clay-sky"
              icon={<KeyRound className="size-5" />}
              value={stats === undefined ? "—" : `${stats.forRent}`}
              label="Places to rent"
            />
          </motion.div>
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
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`clay-squish flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
        active ? "clay-sheen bg-card clay-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatChip({
  hue,
  icon,
  value,
  label,
}: {
  hue: string;
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className={`clay-icon clay-sheen size-12 ${hue}`}>{icon}</span>
      <p className="text-3xl font-extrabold">{value}</p>
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}

