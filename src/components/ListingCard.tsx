import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Bath, BedDouble, Expand, MapPin, Pencil } from "lucide-react";
import { Link, useNavigate } from "react-router";

export type Listing = {
  _id: string;
  slug: string;
  title: string;
  purpose: "primary" | "resale" | "rent";
  type: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  deliveryTime?: string | null;
  finish?: string | null;
  photos: string[];
};

export const DELIVERY_LABELS: Record<string, string> = {
  immediate: "Immediate",
  "6m": "6 months",
  "12m": "12 months",
  "2y": "2 years",
  "3y": "3 years",
  "4y": "4 years",
};

export const FINISH_LABELS: Record<string, string> = {
  "core-shell": "Core & Shell / Unfinished",
  "semi-finished": "Semi-Finished",
  "fully-finished": "Fully Finished",
  "finished-furnished": "Finished-Furnished",
};

export function ListingCard({ listing }: { listing: Listing }) {
  // The team's Edit affordance — rendered only for the creator account;
  // every other visitor (and guests) never see it.
  const isCreator = useQuery(api.creator.isCreator);
  const navigate = useNavigate();

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
          {listing.purpose === "primary"
            ? "Primary sale"
            : listing.purpose === "resale"
              ? "Resale"
              : "For rent"}
        </span>
        {isCreator === true && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/creator?edit=${listing.slug}`);
            }}
            className="clay-icon clay-sheen clay-squish absolute right-3 top-3 size-9 bg-card/95 text-foreground"
            aria-label={`Edit ${listing.title}`}
          >
            <Pencil className="size-4" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg leading-snug">{listing.title}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {listing.area}, Egypt
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium capitalize text-primary">
            {listing.type}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          {listing.deliveryTime && (
            <>
              <span className="text-xs text-muted-foreground">
                Delivery: {DELIVERY_LABELS[listing.deliveryTime] ?? listing.deliveryTime}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
            </>
          )}
          {listing.finish && (
            <>
              <span className="text-xs text-muted-foreground">
                {FINISH_LABELS[listing.finish] ?? listing.finish}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
            </>
          )}
          <span className="text-xs text-muted-foreground">
            {listing.purpose === "rent"
              ? "Rent on request"
              : "Pricing on request"}
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
