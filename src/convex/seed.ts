import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * Seeds the listings table with sample properties across the Ask Real Estate
 * destinations for v1 browsing. Safe to run repeatedly: it skips seeding when
 * listings already exist.
 */

type Seed = {
  slug: string;
  title: string;
  purpose: "sale" | "rent";
  type: string;
  area: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  blurb: string;
  amenities: string[];
  featured?: boolean;
  photos: string[];
};

const Listings: Seed[] = [
  {
    slug: "new-cairo-family-villa",
    title: "Standalone Villa with Private Garden, New Cairo",
    purpose: "sale",
    type: "villa",
    area: "New Cairo",
    price: 32000000,
    bedrooms: 5,
    bathrooms: 4,
    areaSqm: 450,
    blurb:
      "A standalone family villa in a gated New Cairo compound with a private garden and pool. Five bedrooms, a maid's room, and a finished basement — ten minutes from AUC and Cairo Festival City Mall.",
    amenities: ["Private pool", "Garden", "Gated compound", "Maid's room", "2-car garage"],
    featured: true,
    photos: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    slug: "new-cairo-duplex-90th",
    title: "Family Duplex off New Cairo's 90th Street",
    purpose: "sale",
    type: "duplex",
    area: "New Cairo",
    price: 17800000,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 310,
    blurb:
      "A sprawling duplex minutes from 90th Street with schools and hospitals close by. Two living rooms, a breakfast kitchen plus formal dining, and a shared compound garden for the kids.",
    amenities: ["Two living rooms", "Near schools", "Compound gym", "Guest parking"],
    photos: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    slug: "new-cairo-garden-apartment-rent",
    title: "Bright Garden Apartment in New Cairo",
    purpose: "rent",
    type: "apartment",
    area: "New Cairo",
    price: 30000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 150,
    blurb:
      "A light-filled first-floor apartment overlooking the compound garden in New Cairo. Modern open kitchen, built-in wardrobes, and a short drive to Cairo Festival City and Palm Hills.",
    amenities: ["Garden view", "Compound security", "Central A/C", "Fitted kitchen"],
    photos: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    slug: "sheikh-zayed-townhouse",
    title: "Modern Townhouse in Sheikh Zayed Compound",
    purpose: "sale",
    type: "townhouse",
    area: "Sheikh Zayed",
    price: 14500000,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 280,
    blurb:
      "A corner townhouse in a mid-size Sheikh Zayed compound with playground and clubhouse. Bright double-height living space, family kitchen, and a rooftop terrace built for Cairo's mild evenings.",
    amenities: ["Rooftop terrace", "Compound clubhouse", "Playground", "Covered parking"],
    featured: true,
    photos: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    slug: "sheikh-zayed-golf-villa",
    title: "Golf-View Villa in Sheikh Zayed",
    purpose: "sale",
    type: "villa",
    area: "Sheikh Zayed",
    price: 26900000,
    bedrooms: 5,
    bathrooms: 6,
    areaSqm: 520,
    blurb:
      "A five-bedroom villa overlooking the golf course in Sheikh Zayed with BUA of 520 sqm. L-shape living, home office, pool with sundeck, and smart-home wiring throughout.",
    amenities: ["Golf view", "Private pool", "Smart home", "Home office", "Sundeck"],
    photos: [
      "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1613490493576-6f7a7a2f4e93?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    slug: "new-capital-skyline-apartment",
    title: "Skyline Apartment in the New Administrative Capital",
    purpose: "sale",
    type: "apartment",
    area: "New Administrative Capital",
    price: 8500000,
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 180,
    blurb:
      "A high-floor apartment in a new tower overlooking the Green River park in the New Administrative Capital. Smart-home ready, gym and pool in the building, minutes from the Government District.",
    amenities: ["Park view", "Tower gym & pool", "Smart home", "Underground parking"],
    featured: true,
    photos: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    slug: "new-capital-furnished-rental",
    title: "Furnished Two-Bedroom in the New Capital",
    purpose: "rent",
    type: "apartment",
    area: "New Administrative Capital",
    price: 20000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 130,
    blurb:
      "A fully furnished two-bedroom in the New Administrative Capital, move-in ready for families relocating to the Government District. Includes utilities, high-speed internet, and parking.",
    amenities: ["Fully furnished", "Utilities included", "Fast internet", "Parking"],
    photos: [
      "https://images.unsplash.com/photo-1522444195799-478538b28823?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    slug: "north-coast-seafront-chalet",
    title: "Seafront Chalet on the North Coast",
    purpose: "sale",
    type: "chalet",
    area: "North Coast",
    price: 12000000,
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 160,
    blurb:
      "A directly seafront chalet in a gated North Coast village with a private terrace steps from the beach. Open-plan living, two master bedrooms, and full summer services.",
    amenities: ["Direct sea view", "Private beach", "Gated village", "Summer services"],
    featured: true,
    photos: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    slug: "north-coast-family-chalet-rent",
    title: "Family Chalet for Summer Rent, North Coast",
    purpose: "rent",
    type: "chalet",
    area: "North Coast",
    price: 85000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 120,
    blurb:
      "A fully furnished chalet for the summer season in a lively North Coast village — lagoon views, pools, and a short walk to the beach. Flexible monthly terms June through September.",
    amenities: ["Furnished", "Lagoon view", "Pools & beach", "Flexible term"],
    photos: [
      "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    slug: "ain-sokhna-sea-view-chalet",
    title: "Sea-View Chalet in Ain Sokhna",
    purpose: "sale",
    type: "chalet",
    area: "Ain Sokhna",
    price: 9500000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 130,
    blurb:
      "A panoramic sea-view chalet on the Ain Sokhna hills, an hour from Cairo. Wraparound terrace, hotel-managed services, and year-round rentals potential.",
    amenities: ["Panoramic sea view", "Hotel services", "Large terrace", "Year-round use"],
    featured: true,
    photos: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    slug: "ain-sokhna-villa-rent",
    title: "Weekend Villa with Pool in Ain Sokhna",
    purpose: "rent",
    type: "villa",
    area: "Ain Sokhna",
    price: 70000,
    bedrooms: 4,
    bathrooms: 4,
    areaSqm: 380,
    blurb:
      "A four-bedroom private villa in Ain Sokhna with its own pool and mountain backdrop — ideal for weekend escapes from Cairo. Rented furnished with weekly housekeeping.",
    amenities: ["Private pool", "Furnished", "Weekly housekeeping", "Mountain view"],
    photos: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    slug: "heliopolis-sun-penthouse",
    title: "Rooftop Penthouse with Terrace in Heliopolis",
    purpose: "sale",
    type: "penthouse",
    area: "Heliopolis",
    price: 12750000,
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 230,
    blurb:
      "A private-roof penthouse steps from the Basilica with a 90 sqm wraparound terrace. Fully renovated in 2023 with floor-to-ceiling windows and skyline views over Heliopolis.",
    amenities: ["Private terrace", "Panoramic views", "Elevator", "New A/C units", "Private roof"],
    photos: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    slug: "el-shorouk-garden-villa",
    title: "Detached Garden Villa in El Shorouk",
    purpose: "sale",
    type: "villa",
    area: "El Shorouk",
    price: 18500000,
    bedrooms: 5,
    bathrooms: 4,
    areaSqm: 400,
    blurb:
      "A detached villa on a generous lot in El Shorouk with a mature garden and room for a pool. Quiet family street, international schools nearby, easy access to the Suez Road.",
    amenities: ["Mature garden", "Room for pool", "Near schools", "Quiet street"],
    photos: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    slug: "madinaty-apartment-rent",
    title: "Modern Apartment in Madinaty",
    purpose: "rent",
    type: "apartment",
    area: "Madinaty",
    price: 25000,
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 165,
    blurb:
      "A three-bedroom apartment in Madinaty overlooking the golf extension. Compound pools and sports facilities on your doorstep, with malls and schools minutes away.",
    amenities: ["Golf view", "Compound pools", "Sports facilities", "Near malls"],
    featured: true,
    photos: [
      "https://images.unsplash.com/photo-1560449750-8c5d4f16e19f?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    slug: "madinaty-townhouse-sale",
    title: "Family Townhouse in Madinaty",
    purpose: "sale",
    type: "townhouse",
    area: "Madinaty",
    price: 13500000,
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 240,
    blurb:
      "A mid-unit townhouse in a quiet Madinaty cluster with a private garden and communal pools nearby. Efficient layout with a family lounge, guest WC, and two parking bays.",
    amenities: ["Private garden", "Near pools", "2 parking bays", "Family lounge"],
    photos: [
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?auto=format&fit=crop&w=1600&q=80",
    ],
  },
];

export const seedListings = internalMutation({
  args: {},
  returns: v.object({ inserted: v.number(), skipped: v.boolean() }),
  handler: async (ctx) => {
    const existing = await ctx.db.query("listings").first();
    if (existing) {
      return { inserted: 0, skipped: true };
    }
    for (const l of Listings) {
      await ctx.db.insert("listings", {
        slug: l.slug,
        title: l.title,
        description: l.blurb,
        purpose: l.purpose,
        type: l.type,
        area: l.area,
        price: l.price,
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        areaSqm: l.areaSqm,
        photos: l.photos,
        amenities: l.amenities,
        featured: l.featured,
      });
    }
    return { inserted: Listings.length, skipped: false };
  },
});

/**
 * ONE-TIME MIGRATION: replace the old Cairo-only seed with the new
 * destination catalog. Slug-precise and guarded — it only ever deletes the
 * twelve original demo listings and refuses to run once the new seed (or any
 * other listing) is present, so creator-published posts are never touched.
 * Delete this mutation after it has been run.
 */
const NEW_ONLY_SLUGS = new Set([
  "new-capital-skyline-apartment",
  "north-coast-seafront-chalet",
  "ain-sokhna-sea-view-chalet",
  "el-shorouk-garden-villa",
  "madinaty-apartment-rent",
]);
const OLD_SEED_SLUGS = new Set([
  "zamalek-nile-view-apartment",
  "new-cairo-family-villa",
  "maadi-quiet-garden-apartment",
  "sheikh-zayed-townhouse",
  "heliopolis-sun-penthouse",
  "downtown-loft-kazakhstan",
  "new-cairo-duplex-90th",
  "zamalek-furnished-rental",
  "maadi-villa-for-rent",
  "heliopolis-classic-apartment",
  "downtown-renovated-two-bed",
  "sheikh-zayed-golf-villa",
]);

export const migrateToNewDestinations = internalMutation({
  args: {},
  returns: v.object({ deleted: v.number(), inserted: v.number() }),
  handler: async (ctx) => {
    const all = await ctx.db.query("listings").collect();
    for (const l of all) {
      if (NEW_ONLY_SLUGS.has(l.slug)) {
        throw new Error(
          "Migration already applied — new-destination seed listings exist. Doing nothing.",
        );
      }
      if (!OLD_SEED_SLUGS.has(l.slug)) {
        throw new Error(
          `Refusing to run: found a non-seed listing ("${l.title}" in ${l.area}). This migration only clears the original demo data.`,
        );
      }
    }

    // No storage files are involved: the old seed uses legacy photo URLs.
    const inquiries = await ctx.db.query("inquiries").collect();
    for (const inquiry of inquiries) {
      await ctx.db.delete(inquiry._id);
    }
    for (const l of all) {
      await ctx.db.delete(l._id);
    }

    for (const l of Listings) {
      await ctx.db.insert("listings", {
        slug: l.slug,
        title: l.title,
        description: l.blurb,
        purpose: l.purpose,
        type: l.type,
        area: l.area,
        price: l.price,
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        areaSqm: l.areaSqm,
        photos: l.photos,
        amenities: l.amenities,
        featured: l.featured,
      });
    }
    return { deleted: all.length, inserted: Listings.length };
  },
});
