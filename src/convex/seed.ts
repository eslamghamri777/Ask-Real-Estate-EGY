import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * Seeds the listings table with sample Cairo properties for v1 browsing.
 * Safe to run repeatedly: it skips seeding when listings already exist.
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
    slug: "zamalek-nile-view-apartment",
    title: "Nile-View Apartment in Classic Zamalek",
    purpose: "sale",
    type: "apartment",
    area: "Zamalek",
    price: 9500000,
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 185,
    blurb:
      "A bright third-floor apartment on a leafy Zamalek street with sweeping Nile views from the living room balcony. Original 1960s parquet floors, renovated kitchen, and walking distance to Cairo Tower and Gezira Club.",
    amenities: ["Nile view", "Elevator", "Balcony", "Central A/C", "Storage room"],
    featured: true,
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1600&q=80",
    ],
  },
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
    slug: "maadi-quiet-garden-apartment",
    title: "Ground-Floor Flat with Garden Access, Maadi",
    purpose: "rent",
    type: "apartment",
    area: "Maadi",
    price: 28000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 140,
    blurb:
      "A quiet ground-floor apartment on a tree-lined Maadi Sarayat street with direct garden access. Recently renovated with a modern open kitchen — ideal for expat couples near Maadi Club.",
    amenities: ["Garden access", "Pet friendly", "Central A/C", "Fitted kitchen"],
    photos: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    slug: "sheikh-zayed-townhouse",
    title: "Modern Townhouse near Zayed's 90th Street",
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
    slug: "downtown-loft-kazakhstan",
    title: "Downtown Loft off Talaat Harb Square",
    purpose: "rent",
    type: "studio",
    area: "Downtown",
    price: 18000,
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 75,
    blurb:
      "A characterful studio loft in a restored 1920s downtown building, five minutes from Talaat Harb. High ceilings, steel-frame windows, and Cairo's best cafés and cinemas on your doorstep.",
    amenities: ["High ceilings", "Restored building", "Walk to cafés", "Fast internet"],
    photos: [
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    slug: "new-cairo-duplex-90th",
    title: "Family Duplex on New Cairo's 90th Street",
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
    slug: "zamalek-furnished-rental",
    title: "Furnished One-Bedroom by Gezira Club",
    purpose: "rent",
    type: "apartment",
    area: "Zamalek",
    price: 35000,
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 95,
    blurb:
      "A fully furnished, move-in-ready one-bedroom a short walk from Gezira Club and the Nile corniche. Includes weekly housekeeping, all utilities, and fast internet with flexible lease terms.",
    amenities: ["Fully furnished", "Weekly housekeeping", "Utilities included", "Flexible lease"],
    featured: true,
    photos: [
      "https://images.unsplash.com/photo-1522444195799-478538b28823?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    slug: "maadi-villa-for-rent",
    title: "Detached Villa with Pool in Degla Maadi",
    purpose: "rent",
    type: "villa",
    area: "Maadi",
    price: 85000,
    bedrooms: 5,
    bathrooms: 5,
    areaSqm: 480,
    blurb:
      "A detached family villa in Degla Maadi with private pool, mature garden, and staff quarters. Rented unfurnished with three dedicated parking spots on a quiet cul-de-sac.",
    amenities: ["Private pool", "Mature garden", "Staff quarters", "3 parking spots"],
    photos: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1613490493576-6f7a7a2f4e93?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    slug: "heliopolis-classic-apartment",
    title: "High-Ceiling Classic Flat near Corinthia",
    purpose: "rent",
    type: "apartment",
    area: "Heliopolis",
    price: 22000,
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 170,
    blurb:
      "A classic Heliopolis apartment with original high ceilings and hardwood floors, renovated bathrooms and a modern fitted kitchen. Steps from the tram and Korba's cafés.",
    amenities: ["Original ceilings", "Near tram", "Renovated bathrooms", "Fitted kitchen"],
    photos: [
      "https://images.unsplash.com/photo-1560449750-8c5d4f16e19f?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1560449514-8e6f1f1f1e5a?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    slug: "downtown-renovated-two-bed",
    title: "Renovated Two-Bedroom on Mohamed Mahmoud",
    purpose: "rent",
    type: "apartment",
    area: "Downtown",
    price: 16500,
    bedrooms: 2,
    bathrooms: 1,
    areaSqm: 110,
    blurb:
      "A freshly renovated second-floor apartment downtown with a French balcony overlooking a quiet side street. Great for students and young professionals near AUC's Tahrir campus.",
    amenities: ["French balcony", "Recently renovated", "Near metro", "Young professionals"],
    photos: [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    slug: "sheikh-zayed-golf-villa",
    title: "Golf-View Villa in Zayed's Palm Hills",
    purpose: "sale",
    type: "villa",
    area: "Sheikh Zayed",
    price: 26900000,
    bedrooms: 5,
    bathrooms: 6,
    areaSqm: 520,
    blurb:
      "A five-bedroom villa overlooking the golf course in Palm Hills with BUA of 520 sqm. L-shape living, home office, pool with sundeck, and smart-home wiring throughout.",
    amenities: ["Golf view", "Private pool", "Smart home", "Home office", "Sundeck"],
    photos: [
      "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1600&q=80",
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
