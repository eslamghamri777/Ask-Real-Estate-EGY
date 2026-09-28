import { Bath, BedDouble, Expand, MapPin } from "lucide-react";
import { Link } from "react-router";

export type Listing = {
  _id: string;
  slug: string;
  title: string;
  purpose: "sale" | "rent";
  type: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  photos: string[];
};

export function ListingCard({ listing }: { listing: Listing }) {
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
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </div>
        <span className="clay-chip absolute left-3 top-3 bg-card/90 px-3 py-1.5 text-xs">
          {listing.purpose === "sale" ? "For sale" : "For rent"}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg leading-snug">{listing.title}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {listing.area}, Cairo
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium capitalize text-primary">
            {listing.type}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            {listing.purpose === "sale"
              ? "Pricing on request"
              : "Rent on request"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="clay-chip bg-secondary px-3 py-1.5 text-xs">
            <BedDouble className="size-3.5" />
            {listing.bedrooms} {listing.bedrooms === 1 ? "bed" : "beds"}
          </span>
          <span className="clay-chip bg-secondary px-3 py-1.5 text-xs">
            <Bath className="size-3.5" />
            {listing.bathrooms} {listing.bathrooms === 1 ? "bath" : "baths"}
          </span>
          <span className="clay-chip bg-secondary px-3 py-1.5 text-xs">
            <Expand className="size-3.5" />
            {listing.areaSqm} m²
          </span>
        </div>
      </div>
    </Link>
  );
}
