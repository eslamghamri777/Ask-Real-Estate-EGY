import { ClayFooter, ClayHeader } from "@/components/ClayLayout";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Check,
  ChevronLeft,
  ChevronRight,
  Expand,
  Heart,
  MapPin,
  Phone,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

export default function ListingDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [photoIndex, setPhotoIndex] = useState(0);

  const listing = useQuery(api.listings.get, { slug: slug ?? "" });
  const related = useQuery(
    api.listings.related,
    { slug: slug ?? "", area: listing?.area ?? "" },
  );

  // reset the gallery when moving between listings
  useEffect(() => {
    setPhotoIndex(0);
  }, [slug]);

  if (listing === undefined) {
    return (
      <div className="flex min-h-screen flex-col">
        <ClayHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10">
          <Skeleton className="h-[26rem] w-full rounded-[2rem]" />
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-72 rounded-[1.75rem] lg:col-span-2" />
            <Skeleton className="h-72 rounded-[1.75rem]" />
          </div>
          <Skeleton className="mt-6 h-64 w-full rounded-[1.75rem]" />
        </main>
        <ClayFooter />
      </div>
    );
  }

  if (listing === null) {
    return (
      <div className="flex min-h-screen flex-col">
        <ClayHeader />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="clay-card clay-md max-w-md px-8 py-12 text-center">
            <span className="clay-icon clay-sheen mx-auto size-14 bg-clay-blush">
              <Search className="size-6" />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold">Listing not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This home may have been taken off the market.
            </p>
            <Button
              onClick={() => navigate("/listings")}
              className="clay-btn clay-btn-primary mt-6 rounded-full px-6"
            >
              <ArrowLeft className="size-4" />
              Browse all listings
            </Button>
          </div>
        </main>
        <ClayFooter />
      </div>
    );
  }

  const photos = listing.photos;
  const nextPhoto = () => setPhotoIndex((i) => (i + 1) % photos.length);
  const prevPhoto = () =>
    setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);

  return (
    <div className="flex min-h-screen flex-col">
      <ClayHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6">
        <Link
          to="/listings"
          className="clay-chip clay-squish mb-5 inline-flex bg-card px-4 py-2 text-sm"
        >
          <ArrowLeft className="size-4" />
          Back to listings
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ============ Gallery ============ */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="clay-card overflow-hidden p-3">
              <div className="relative overflow-hidden rounded-[1.5rem]">
                <img
                  src={photos[photoIndex]}
                  alt={listing.title}
                  className="aspect-[16/10] w-full object-cover"
                />

                <button
                  onClick={prevPhoto}
                  aria-label="Previous photo"
                  className="clay-icon clay-sheen clay-squish absolute left-3 top-1/2 size-10 -translate-y-1/2 bg-card/90 text-foreground"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  onClick={nextPhoto}
                  aria-label="Next photo"
                  className="clay-icon clay-sheen clay-squish absolute right-3 top-1/2 size-10 -translate-y-1/2 bg-card/90 text-foreground"
                >
                  <ChevronRight className="size-5" />
                </button>

                <span className="clay-chip absolute bottom-3 right-3 bg-card/90 px-3 py-1.5 text-xs">
                  {photoIndex + 1} / {photos.length}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-3">
                {photos.map((photo, i) => (
                  <button
                    key={`${photo}-${i}`}
                    onClick={() => setPhotoIndex(i)}
                    className={`overflow-hidden rounded-2xl transition-all ${
                      i === photoIndex
                        ? "clay-md ring-2 ring-primary"
                        : "clay-sm opacity-80 hover:opacity-100"
                    } shadow-none`}
                  >
                    <img
                      src={photo}
                      alt=""
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ============ Info panel ============ */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <div className="clay-card clay-md flex flex-col gap-4 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="clay-chip bg-primary px-3.5 py-1.5 text-xs text-primary-foreground">
                  {listing.purpose === "sale" ? "For sale" : "For rent"}
                </span>
                <span className="clay-chip bg-clay-sky px-3.5 py-1.5 text-xs capitalize">
                  {listing.type}
                </span>
                {listing.featured && (
                  <span className="clay-chip bg-clay-butter px-3.5 py-1.5 text-xs">
                    <Sparkles className="size-3.5" />
                    Featured
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl font-extrabold leading-snug tracking-tight">
                  {listing.title}
                </h1>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  {listing.area}, Cairo
                </p>
              </div>

              <p className="text-3xl font-extrabold text-primary">
                {listing.purpose === "rent"
                  ? `${listing.price.toLocaleString()} EGP/mo`
                  : `${listing.price.toLocaleString()} EGP`}
              </p>

              <div className="clay-well grid grid-cols-3 gap-2 rounded-[1.5rem] p-4 text-center">
                <DetailStat
                  icon={<BedDouble className="size-5" />}
                  value={`${listing.bedrooms}`}
                  label="Beds"
                />
                <DetailStat
                  icon={<Bath className="size-5" />}
                  value={`${listing.bathrooms}`}
                  label="Baths"
                />
                <DetailStat
                  icon={<Expand className="size-5" />}
                  value={`${listing.areaSqm}`}
                  label="m²"
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <Button className="clay-btn clay-btn-primary h-12 rounded-full text-base">
                  <Phone className="size-4" />
                  Ask about this home
                </Button>
                <Button className="clay-btn clay-btn-light h-11 rounded-full">
                  <Heart className="size-4" />
                  Save home
                </Button>
              </div>
            </div>
          </motion.aside>

          {/* ============ Description ============ */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="lg:col-span-3"
          >
            <div className="clay-card clay-md p-6 sm:p-8">
              <h2 className="text-xl font-extrabold">About this home</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {listing.description}
              </p>

              <h2 className="mt-8 text-xl font-extrabold">
                What makes it special
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {listing.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="clay-chip clay-squish justify-start bg-secondary px-4 py-3 text-sm"
                  >
                    <span className="clay-icon clay-sheen size-7 bg-clay-mint">
                      <Check className="size-4" />
                    </span>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        </div>

        {/* ============ Related ============ */}
        {related && related.length > 0 && (
          <section className="pt-14">
            <h2 className="text-2xl font-extrabold tracking-tight">
              More in {listing.area}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((l) => (
                <ListingCard key={l._id} listing={l} />
              ))}
            </div>
          </section>
        )}
      </main>

      <ClayFooter />
    </div>
  );
}

function DetailStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="clay-icon clay-sheen size-10 bg-card">{icon}</span>
      <p className="text-lg font-extrabold">{value}</p>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}
