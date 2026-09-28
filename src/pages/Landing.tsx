import { ClayFooter, ClayHeader, whatsappUrl } from "@/components/ClayLayout";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { ArrowRight, MapPin, MessageCircle, Search } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useState } from "react";

const areaTones = [
  "bg-clay-butter",
  "bg-clay-sand",
  "bg-clay-sky",
  "bg-clay-blush",
  "bg-clay-lilac",
  "bg-clay-mint",
];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

const POPULAR_AREAS = ["Zamalek", "Maadi", "New Cairo", "Heliopolis", "Sheikh Zayed", "Downtown"];

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
    params.set("purpose", purpose);
    if (area) params.set("area", area);
    if (q.trim()) params.set("q", q.trim());
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ClayHeader />

      <main className="flex-1">
        {/* ============ Hero: search first ============ */}
        <section className="mx-auto w-full max-w-6xl px-4 pt-14 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="eyebrow"
            >
              Property sales & lettings · Cairo
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.06 }}
              className="font-display clay-text mt-4 text-4xl leading-[1.12] tracking-tight sm:text-6xl"
            >
              Find the right home,
              <br />
              with the right people
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.14 }}
              className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Ask Real Estate lists a small, verified portfolio of homes for
              sale and rent across Cairo. Browse the full catalog freely —
              when something is right, our team is one message away.
            </motion.p>
          </div>

          {/* Search panel */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="clay-card clay-lg mx-auto mt-10 max-w-4xl p-4 sm:p-5"
          >
            <div className="clay-well mx-auto mb-4 flex w-fit items-center gap-1 rounded-full p-1.5">
              <PurposeTab
                active={purpose === "sale"}
                onClick={() => setPurpose("sale")}
                label="Buy"
              />
              <PurposeTab
                active={purpose === "rent"}
                onClick={() => setPurpose("rent")}
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
                  placeholder="Keyword — villa, penthouse, Nile view…"
                  className="clay-input pl-10"
                  aria-label="Keyword"
                />
              </div>
              <Button
                type="submit"
                className="clay-btn clay-btn-primary h-12 shrink-0 rounded-full px-7 text-base"
              >
                Search
                <ArrowRight className="size-4" />
              </Button>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Popular:</span>
              {POPULAR_AREAS.map((name) => (
                <button
                  key={name}
                  onClick={() =>
                    navigate(`/listings?area=${encodeURIComponent(name)}`)
                  }
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {name}
                </button>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ============ Areas ============ */}
        <section className="mx-auto w-full max-w-6xl px-4 pt-24">
          <motion.div {...fadeUp} className="max-w-2xl">
            <span className="eyebrow">Neighborhoods</span>
            <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
              Start with the area
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Each district keeps its own character — from the leafy river
              streets of Zamalek to the gated compounds of New Cairo. Choose
              the one that feels like home.
            </p>
          </motion.div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {areas === undefined
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="clay-sm h-44 rounded-[1.5rem]" />
                ))
              : areas.map((a, i) => (
                  <motion.button
                    key={a.name}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    onClick={() =>
                      navigate(`/listings?area=${encodeURIComponent(a.name)}`)
                    }
                    className={`clay-card clay-card-hover clay-squish relative h-44 overflow-hidden text-left ${areaTones[i % areaTones.length]}`}
                  >
                    <img
                      src={a.photo}
                      alt=""
                      loading="lazy"
                      className="absolute inset-x-3 top-3 h-20 rounded-xl object-cover"
                    />
                    <div className="absolute inset-x-4 bottom-3.5">
                      <p className="font-display text-base">{a.name}</p>
                      <p className="text-xs font-medium opacity-70">
                        {a.count} {a.count === 1 ? "property" : "properties"}
                      </p>
                    </div>
                  </motion.button>
                ))}
          </div>
        </section>

        {/* ============ Featured ============ */}
        <section className="mx-auto w-full max-w-6xl px-4 pt-24">
          <motion.div {...fadeUp} className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <span className="eyebrow">The portfolio</span>
              <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
                Featured properties
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                A first look at what's available right now — each one visited
                and photographed by our own team.
              </p>
            </div>
            <Button
              asChild
              className="clay-btn clay-btn-light h-11 rounded-full px-6"
            >
              <Link to="/listings">
                View the full catalog
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </motion.div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured === undefined
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-96 rounded-[1.5rem]" />
                ))
              : featured.map((l, i) => (
                  <motion.div
                    key={l._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.06 }}
                  >
                    <ListingCard listing={l} />
                  </motion.div>
                ))}
          </div>
        </section>

        {/* ============ Trust ============ */}
        <section className="mx-auto w-full max-w-6xl px-4 pt-24">
          <motion.div {...fadeUp} className="clay-card clay-md px-8 py-12 sm:px-12">
            <div className="mx-auto max-w-2xl text-center">
              <span className="eyebrow">Why Ask</span>
              <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
                Serious about property, personal about people
              </h2>
            </div>
            <div className="mt-10 grid gap-8 text-center sm:grid-cols-3">
              <TrustPoint
                title="Verified listings"
                body="Every property is visited and photographed by our team before it appears here. No stock imagery, no surprises."
              />
              <TrustPoint
                title="Straight answers"
                body="Ask us anything about a home — pricing, service charges, the neighborhood. You'll hear back from a person, not a bot."
              />
              <TrustPoint
                title="Patient guidance"
                body="Buying or renting is a big decision. We move at your pace and tell you plainly when a place isn't right for you."
              />
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="font-semibold">
                {stats === undefined ? "—" : stats.total} live listings
              </span>
              <span className="size-1 rounded-full bg-muted-foreground/40" />
              <span className="font-semibold">
                {stats === undefined ? "—" : stats.forSale} for sale
              </span>
              <span className="size-1 rounded-full bg-muted-foreground/40" />
              <span className="font-semibold">
                {stats === undefined ? "—" : stats.forRent} for rent
              </span>
            </div>
          </motion.div>
        </section>
        {/* ============ Contact ============ */}
        <section className="mx-auto w-full max-w-6xl px-4 pt-24">
          <motion.div {...fadeUp} className="clay-card clay-md px-8 py-12 text-center sm:px-12">
            <span className="clay-icon clay-sheen mx-auto size-14 bg-primary text-primary-foreground">
              <MessageCircle className="size-6" />
            </span>
            <h2 className="font-display mt-5 text-3xl tracking-tight sm:text-4xl">
              Talk to us directly
            </h2>
            <p className="mx-auto mt-3 max-w-xl leading-relaxed text-muted-foreground">
              Questions about a home, the area, or pricing? Message us on
              WhatsApp — a real person from the team replies, usually within
              minutes.
            </p>
            <a
              href={whatsappUrl(
                "Hello Ask Real Estate! I have a question about a property.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="clay-btn clay-btn-primary mt-7 inline-flex h-12 items-center gap-2 rounded-full px-8 text-base"
            >
              <MessageCircle className="size-5" />
              Chat on WhatsApp · 0100 953 3599
            </a>
            <p className="mt-4 text-xs text-muted-foreground/70">
              Available Saturday–Thursday, 10am–8pm Cairo time
            </p>
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
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
        active ? "bg-card clay-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function TrustPoint({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <h3 className="font-display text-lg">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
