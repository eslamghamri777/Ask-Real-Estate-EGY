import { ClayFooter, ClayHeader } from "@/components/ClayLayout";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Expand,
  MapPin,
  MessageSquare,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

export default function ListingDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [photoIndex, setPhotoIndex] = useState(0);

  const listing = useQuery(api.listings.get, { slug: slug ?? "" });
  const related = useQuery(
    api.listings.related,
    { slug: slug ?? "", area: listing?.area ?? "" },
  );
  const inquiries = useQuery(
    api.inquiries.forListing,
    listing ? { listingId: listing._id } : "skip",
  );

  // reset the gallery when moving between properties
  useEffect(() => {
    setPhotoIndex(0);
  }, [slug]);

  if (listing === undefined) {
    return (
      <div className="flex min-h-screen flex-col">
        <ClayHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10">
          <Skeleton className="h-[26rem] w-full rounded-[1.75rem]" />
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-72 rounded-[1.5rem] lg:col-span-2" />
            <Skeleton className="h-72 rounded-[1.5rem]" />
          </div>
          <Skeleton className="mt-6 h-64 w-full rounded-[1.5rem]" />
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
            <span className="clay-icon clay-sheen mx-auto size-14 bg-secondary">
              <Search className="size-6" />
            </span>
            <h1 className="font-display mt-4 text-2xl">Listing not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This property may have been taken off the market.
            </p>
            <Button
              onClick={() => navigate("/listings")}
              className="clay-btn clay-btn-primary mt-6 rounded-full px-6"
            >
              <ArrowLeft className="size-4" />
              Browse the catalog
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
          Back to the catalog
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ============ Gallery ============ */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="clay-card overflow-hidden p-3">
              <div className="relative overflow-hidden rounded-[1.25rem]">
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
                    className={`overflow-hidden rounded-2xl transition-all shadow-none ${
                      i === photoIndex
                        ? "clay-md ring-2 ring-primary"
                        : "clay-sm opacity-80 hover:opacity-100"
                    }`}
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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <div className="clay-card clay-md flex flex-col gap-4 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="clay-chip bg-primary px-3.5 py-1.5 text-xs text-primary-foreground">
                  {listing.purpose === "sale" ? "For sale" : "For rent"}
                </span>
                <span className="clay-chip bg-card px-3.5 py-1.5 text-xs capitalize">
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
                <h1 className="font-display text-2xl leading-snug tracking-tight">
                  {listing.title}
                </h1>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  {listing.area}, Cairo
                </p>
              </div>

              <div className="clay-well rounded-2xl px-4 py-3">
                <p className="text-sm font-semibold">
                  {listing.purpose === "sale" ? "Pricing on request" : "Rent on request"}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  Message us below for full pricing details and current offers on
                  this property.
                </p>
              </div>

              <div className="clay-well grid grid-cols-3 gap-2 rounded-[1.25rem] p-4 text-center">
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

              <p className="text-sm leading-relaxed text-muted-foreground">
                Interested in this property? Send us a message below and a
                member of our team will get back to you personally.
              </p>
            </div>
          </motion.aside>

          {/* ============ Description ============ */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="lg:col-span-2"
          >
            <div className="clay-card clay-md h-full p-6 sm:p-8">
              <h2 className="font-display text-xl">About this property</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {listing.description}
              </p>

              <h2 className="font-display mt-8 text-xl">Features & amenities</h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {listing.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2.5 text-sm font-medium"
                  >
                    <span className="clay-icon clay-sheen size-7 shrink-0 bg-secondary">
                      <Sparkles className="size-3.5" />
                    </span>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ============ Inquiry ============ */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
          >
            <InquiryPanel listingId={listing._id} inquiries={inquiries} />
          </motion.section>
        </div>

        {/* ============ Related ============ */}
        {related && related.length > 0 && (
          <section className="pt-16">
            <span className="eyebrow">Also in {listing.area}</span>
            <h2 className="font-display mt-2 text-2xl tracking-tight">
              Similar properties nearby
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
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

type Inquiry = {
  _id: string;
  name: string;
  message: string;
  _creationTime: number;
};

function InquiryPanel({
  listingId,
  inquiries,
}: {
  listingId: Id<"listings">;
  inquiries: Inquiry[] | undefined;
}) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!name && user?.name) setName(user.name);
    if (!email && user?.email) setEmail(user.email);
  }, [user, name, email]);

  const sendInquiry = useMutation(api.inquiries.send);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      await sendInquiry({
        listingId,
        name,
        email,
        phone: phone || undefined,
        message,
      });
      toast.success("Message sent", {
        description: "Our team will reply to you shortly.",
      });
      setMessage("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="clay-card clay-md flex h-full flex-col gap-4 p-6">
      <div className="flex items-center gap-2.5">
        <span className="clay-icon clay-sheen size-10 bg-primary text-primary-foreground">
          <MessageSquare className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-lg leading-tight">
            Message our team
          </h2>
          <p className="text-xs text-muted-foreground">
            We usually reply within one business day.
          </p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 rounded-[1.25rem]" />
      ) : !isAuthenticated ? (
        <div className="clay-well flex flex-1 flex-col items-center justify-center gap-3 rounded-[1.25rem] px-6 py-8 text-center">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Sign in to ask about this property. Your message goes straight to
            the agent handling it.
          </p>
          <Button
            onClick={() =>
              navigate(
                `/auth?returnTo=${encodeURIComponent(
                  `${window.location.pathname}`,
                )}`,
              )
            }
            className="clay-btn clay-btn-primary mt-1 rounded-full px-6"
          >
            Sign in to continue
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="clay-input h-11 shadow-none"
            />
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (optional)"
              type="tel"
              className="clay-input h-11 shadow-none"
            />
          </div>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            type="email"
            required
            className="clay-input h-11 shadow-none"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about viewing times, service charges, the neighborhood — anything."
            required
            rows={4}
            maxLength={2000}
            className="clay-input resize-none shadow-none"
          />
          <Button
            type="submit"
            disabled={sending}
            className="clay-btn clay-btn-primary h-11 rounded-full"
          >
            <Send className="size-4" />
            {sending ? "Sending…" : "Send message"}
          </Button>
        </form>
      )}

      {/* Inquiry trail */}
      {inquiries && inquiries.length > 0 && (
        <div className="mt-2 border-t border-border pt-4">
          <p className="eyebrow">
            Recent messages ({inquiries.length})
          </p>
          <ul className="mt-3 flex max-h-64 flex-col gap-3 overflow-y-auto pr-1">
            {inquiries.map((inquiry) => (
              <li key={inquiry._id} className="clay-well rounded-2xl p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{inquiry.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(inquiry._creationTime).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short" },
                    )}
                  </p>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {inquiry.message}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
