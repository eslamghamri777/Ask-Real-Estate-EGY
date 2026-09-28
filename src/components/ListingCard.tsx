import { Badge } from "@/components/ui/badge";
import { Bath, BedDouble, Expand, MapPin } from "lucide-react";
import { Link } from "react-router";

export type Listing = {
  _id: string;
  slug: string;
  title: string;
  purpose: "sale" | "rent";
  type: string;
  area: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  photos: string[];
};

export function formatPrice(price: number, purpose: Listing["purpose"]) {
  return purpose === "rent"
    ? `${(price / 1000).toFixed(0)}K EGP/mo`
    : `${(price / 1_000_000).toFixed(2).replace(/\.00$/, "")}M EGP`;
}

const chipHues = ["bg-clay-mint", "bg-clay-sky", "bg-clay-blush", "bg-clay-lilac"];

export function ListingCard({ listing }: { listing: Listing }) {
  const typeHue = chipHues[listing.type.length % chipHues.length];

  return (
    <Link
      to={`/listing/${listing.slug}`}
      className="clay-card clay-card-hover group block overflow-hidden"
    >
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={listing.photos[0]}
            alt={listing.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <span className="clay-chip absolute left-3 top-3 bg-primary text-primary-foreground px-3 py-1.5 text-xs">
          {listing.purpose === "sale" ? "For sale" : "For rent"}
        </span>
        <span className="clay-chip absolute right-3 top-3 bg-card text-foreground px-3 py-1.5 text-xs capitalize">
          {listing.type}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold leading-snug">{listing.title}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {listing.area}, Cairo
            </p>
          </div>
          <p className="shrink-0 text-right text-base font-extrabold text-primary">
            {formatPrice(listing.price, listing.purpose)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="clay-chip bg-secondary px-3 py-1.5 text-xs">
            <BedDouble className="size-3.5" />
            {listing.bedrooms} beds
          </span>
          <span className="clay-chip bg-secondary px-3 py-1.5 text-xs">
            <Bath className="size-3.5" />
            {listing.bathrooms} baths
          </span>
          <span className={`clay-chip ${typeHue} px-3 py-1.5 text-xs`}>
            <Expand className="size-3.5" />
            {listing.areaSqm} m²
          </span>
        </div>
      </div>
    </Link>
  );
}
