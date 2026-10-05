import {
  ClayFooter,
  ClayHeader,
  SocialIconLinks,
} from "@/components/ClayLayout";
import askMark from "@/assets/ask-mark.svg";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { usePaginatedQuery, useQuery } from "convex/react";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router";

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

export default function Landing() {
  const navigate = useNavigate();

  const featured = useQuery(api.listings.featured);
  const areas = useQuery(api.listings.areas);
  const stats = useQuery(api.listings.stats);

  // Hero showcase — an ad built from the portfolio itself: primary launches
  // first, falling back to any photographed listing while primary is empty.
  const primaryList = usePaginatedQuery(
    api.listings.list,
    { purpose: "primary" },
    { initialNumItems: 9 },
  );
  const primaryWithPhotos = primaryList.results.filter((l) => l.photos.length > 0);
  const showcaseTiles =
    primaryWithPhotos.length > 0
      ? primaryWithPhotos.slice(0, 3)
      : (featured ?? []).filter((l) => l.photos.length > 0).slice(0, 3);
  const showcaseLoading = primaryList.status === "LoadingFirstPage";
  // If primary has no photos yet, wait for the featured fallback instead of
  // flashing the empty-state banner.
  const waitingOnShowcase =
    showcaseLoading || (showcaseTiles.length === 0 && featured === undefined);

  return (
    <div className="flex min-h-screen flex-col">
      <ClayHeader />

      <main className="flex-1">
        {/* ============ Hero: showcase first ============ */}
        <section className="mx-auto w-full max-w-6xl px-4 pt-14 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex justify-center"
            >
              <img src={askMark} alt="" className="size-16 sm:size-20" />
            </motion.div>

            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="eyebrow mt-6 block"
            >
              Property sales & lettings · Egypt
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.14 }}
              className="font-display mt-4 text-4xl leading-[1.12] tracking-tight sm:text-6xl"
            >
              Find the right home,
              <br />
              with the right people
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Ask Real Estate lists a small, verified portfolio of homes for
              sale and rent across Egypt. Browse the full catalog freely —
              when something is right, our team is one message away.
            </motion.p>
          </div>

          {/* Primary projects showcase — an ad built from the portfolio */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="clay-card clay-lg mx-auto mt-10 max-w-4xl overflow-hidden"
          >
            <div className="grid gap-2 p-2 sm:grid-cols-5 sm:p-3">
              {waitingOnShowcase ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className={
                      i === 0
                        ? "h-72 rounded-[1.25rem] sm:col-span-3 sm:row-span-2 sm:h-full"
                        : "h-40 rounded-[1.25rem] sm:col-span-2"
                    }
                  />
                ))
              ) : showcaseTiles.length === 0 ? (
                <div className="col-span-full flex h-44 items-center justify-center rounded-[1.25rem] bg-secondary px-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    New primary launches are added regularly — message us for
                    what's coming next.
                  </p>
                </div>
              ) : (
                showcaseTiles.map((l, i) => (
                  <motion.button
                    key={l._id}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/listings?purpose=primary&area=${encodeURIComponent(l.area)}`,
                      )
                    }
                    aria-label={`Primary properties in ${l.area}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.08 }}
                    className={
                      "group relative overflow-hidden rounded-[1.25rem] text-left " +
                      (i === 0
                        ? "h-72 sm:col-span-3 sm:row-span-2 sm:h-full"
                        : "h-40 sm:col-span-2")
                    }
                  >
                    <img
                      src={l.photos[0]}
                      alt={l.title}
                      loading={i === 0 ? "eager" : "lazy"}
                      className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    {i === 0 && (
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-foreground shadow-sm">
                        Direct from the developer
                      </span>
                    )}
                    <div className="absolute inset-x-4 bottom-3">
                      <p className="font-display text-lg text-white">{l.area}</p>
                      <p className="text-xs font-medium capitalize text-white/80">
                        {l.type} · primary sale
                      </p>
                    </div>
                  </motion.button>
                ))
              )}
            </div>

            <div className="flex flex-col items-center gap-4 border-t border-border px-6 py-5 text-center sm:flex-row sm:justify-between sm:gap-6 sm:text-left">
              <div>
                <p className="font-display text-lg tracking-tight">
                  Egypt's next addresses — direct from the developers
                </p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">
                  Expert advisory at no cost to you — enjoy{" "}
                  <span className="font-display text-lg italic text-brand">
                    0%
                  </span>{" "}
                  brokerage fees on primary sales.
                </p>
              </div>
              <Button
                asChild
                className="clay-btn clay-btn-primary h-11 shrink-0 rounded-full px-6"
              >
                <Link to="/listings?purpose=primary">
                  Explore projects
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
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
              Each destination keeps its own character — from the gated
              compounds of New Cairo to the Red Sea shores of Ain Sokhna and
              the North Coast. Choose the one that feels like home.
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
            <img src={askMark} alt="" className="mx-auto size-14" />
            <h2 className="font-display mt-5 text-3xl tracking-tight sm:text-4xl">
              Talk to us directly
            </h2>
            <p className="mx-auto mt-3 max-w-xl leading-relaxed text-muted-foreground">
              Questions about a home, the area, or pricing? Reach us on
              Facebook, Instagram, or WhatsApp — a real person from the team
              replies, usually within minutes.
            </p>

            <div className="mt-8">
              <SocialIconLinks className="mt-3" />
            </div>

            <p className="mt-6 text-xs text-muted-foreground/70">
              Available Saturday–Thursday, 10am–8pm Egypt time
            </p>
          </motion.div>
        </section>
      </main>

      <ClayFooter />
    </div>
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
