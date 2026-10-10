import { PRIMARY_DEVELOPERS } from "@/lib/filters";

export type DeveloperProfile = {
  heading: string;
  detail: string;
  source?: { label: string; url: string };
};

/** Public profile notes; wording distinguishes verified projects from company claims. */
export const DEVELOPER_PROFILES = {
  "Mountain View": {
    heading: "Community spotlight · Kingsway",
    detail: "Mountain View describes Kingsway in West Cairo as a villa community centered on a Polo Country Club, with polo, tennis and equestrian amenities.",
    source: { label: "Kingsway · Mountain View", url: "https://www.mountainviewegypt.com/projects/kingsway-october" },
  },
  "Palm Hills Developments": {
    heading: "Community spotlight · Badya",
    detail: "Badya is Palm Hills' large mixed-use development in 6th of October City. Published area figures vary between company pages, so we leave out an unconfirmed total.",
    source: { label: "Badya · Palm Hills", url: "https://www.palmhillsdevelopments.com/en-us/home" },
  },
  SODIC: {
    heading: "Company focus",
    detail: "SODIC describes a portfolio of large-scale communities spanning West Cairo, East Cairo and the North Coast.",
    source: { label: "About SODIC", url: "https://www.sodic.com/about-us" },
  },
  "Emaar Misr": {
    heading: "Community spotlight · Marassi",
    detail: "Marassi North Coast is Emaar Misr's coastal destination with 23 residential villages and an international marina.",
    source: { label: "Marassi North Coast · Emaar Misr", url: "https://www.emaarmisr.com/our-communities/marassi-north-coast/" },
  },
  "La Vista Developments": {
    heading: "Portfolio spotlight · El Patio Sola",
    detail: "La Vista lists El Patio Sola as a residential project in El Shorouk; its portfolio page shows the project under construction.",
    source: { label: "El Patio Sola · La Vista", url: "https://lavista-developments.com/portfolio/el-patio-sola/" },
  },
  "Madinet Masr": {
    heading: "Community spotlight · Sarai",
    detail: "Sarai is Madinet Masr's mixed-use development along Suez Road in East Cairo, near the New Administrative Capital.",
    source: { label: "Sarai · Madinet Masr", url: "https://madinetmasr.com/en/projects/sarai" },
  },
  "City Edge Developments": {
    heading: "Project spotlight · Maspero Triangle",
    detail: "City Edge's Maspero Triangle plan covers 327,000 square metres and includes 24 mixed-use plots.",
    source: { label: "Maspero Triangle · City Edge", url: "https://cityedgedevelopments.com/location/maspero-triangle-en/" },
  },
  "Tatweer Misr": {
    heading: "Portfolio spotlight · IL Monte Galala",
    detail: "IL Monte Galala is Tatweer Misr's coastal destination in Ain Sokhna, designed into the mountain landscape.",
    source: { label: "IL Monte Galala · Tatweer Misr", url: "https://tatweermisr.com/destinations/il-monte-galala" },
  },
  "Lake View": {
    heading: "Project identity note · LakeView Residence",
    detail: "El Hazek has published construction work on LakeView Residence. That supports a construction association, but does not establish the developer or owner; confirm the operator for each project.",
    source: { label: "El Hazek · LakeView Residence", url: "https://www.facebook.com/EUCelhazekconstruction/videos/a-brief-impression-of-one-of-our-landmark-projects-lakeview-residence-located-in/574343964080387/" },
  },
  "ORA Developers": {
    heading: "Community spotlight · ZED East",
    detail: "ZED East is ORA's New Cairo community. ORA's pages publish conflicting overall area figures, so we avoid repeating an unconfirmed total.",
    source: { label: "ZED East · ORA Developers", url: "https://www.oradevelopers.com/properties/zed-east" },
  },
  Saada: {
    heading: "Portfolio note · Saada New Cairo",
    detail: "Contemporary reporting identifies Saada New Cairo as a project by Horizon Egypt Developments. We confirm the operator for each current launch before sharing details.",
    source: { label: "Daily News Egypt · Saada launch", url: "https://www.dailynewsegypt.com/2023/09/11/saada-new-cairo-new-real-estate-project-by-horizon-egypt-developments-with-egp-36bn-investment/" },
  },
  "PRE Developments": {
    heading: "Portfolio focus",
    detail: "PRE's published portfolio includes The Brooks and Stone Residence in New Cairo, as well as Jebal in Ain Sokhna.",
    source: { label: "Projects · PRE Developments", url: "https://predevelopments.com/" },
  },
  "Modon Developments": {
    heading: "Portfolio spotlight · Green River Tower",
    detail: "Green River Tower is a commercial project associated with Egypt's Modon Developments in the New Administrative Capital.",
    source: { label: "Green River Tower · Zawya", url: "https://www.zawya.com/en/sponsored-content/projects-egypts-modon-developments-to-launch-green-river-tower-in-new-administrative-capital-385913" },
  },
  "Hassan Allam Properties": {
    heading: "Community spotlight · SwanLake West",
    detail: "SwanLake West is a 173-feddan residential community in West Cairo, with landscaped parks and lagoons.",
    source: { label: "SwanLake West · Hassan Allam Properties", url: "https://www.hap.com.eg/projects/swanlake-west/" },
  },
  Kattameya: {
    heading: "Developer identity note",
    detail: "The label “Kattameya” may refer to Katameya Heights, but the developer identity is not clear from the public sources reviewed. Ask our team to confirm the operator for a specific project before relying on this label.",
  },
  Nouvara: {
    heading: "Project identity note · Giza Downtown",
    detail: "Public listings mention Giza Downtown under the similarly spelled “Novara Developments” name. We have not verified that it is the same entity as this “Nouvara” label, so our team will confirm the operator before quoting project details.",
    source: { label: "Giza Downtown · Property Finder", url: "https://www.propertyfinder.eg/en/new-projects/novara-developments/giza-downtown" },
  },
  Marakez: {
    heading: "Project spotlight · District 5",
    detail: "Public reporting identifies District 5 in Katameya as a Marakez project. Confirm its current scope, availability and status with our team.",
    source: { label: "Daily News Egypt · District 5", url: "https://www.dailynewsegypt.com/2019/03/27/marakez-invests-egp-6bn-in-district-5-project/" },
  },
  "The Waterway Developments": {
    heading: "Portfolio focus",
    detail: "The Waterway's published portfolio spans residential and commercial properties, serviced apartments and hotels; listed projects may have different completion and availability statuses.",
    source: { label: "Projects · The Waterway", url: "https://waterway.eg/" },
  },
  "Tameer Development": {
    heading: "Company background",
    detail: "Tameer traces its history to 1954, when it began as a government-owned organisation focused on affordable housing.",
    source: { label: "About Tameer", url: "https://tameer.com.eg/about-tameer/" },
  },
  "Il Cazar": {
    heading: "Company background",
    detail: "Il Cazar says it was established in 2019 under the name Go Khozam, with a flagship project in Heliopolis.",
    source: { label: "Il Cazar", url: "https://ilcazar.com/" },
  },
  Mayan: {
    heading: "Project identity note · Mayan New Cairo",
    detail: "The developer identity for Mayan New Cairo could not be confirmed from reliable readable sources. Our team can verify the operator for a specific project before sharing details.",
    source: { label: "Mayan New Cairo project page", url: "https://www.mayannewcairo.com/" },
  },
  "Sky AD Developments": {
    heading: "Project spotlight · Residence Eight",
    detail: "Sky AD announced Residence Eight in the New Administrative Capital as its first project in Egypt.",
    source: { label: "Residence Eight announcement · Sky AD", url: "https://skyabudhabi.ae/news-and-press/sky-ad-developments-inaugurates-residence-eight-project-in-the-new-capital" },
  },
  "Al Ahly Sabbour": {
    heading: "Company background",
    detail: "Al Ahly Sabbour dates its real-estate story to 1994, when it set out to establish an engineering consultancy firm.",
    source: { label: "About Al Ahly Sabbour", url: "https://www.alahlysabbour.com/en" },
  },
  "Landmark (LMD)": {
    heading: "Project spotlight · One Ninety",
    detail: "One Ninety is LMD's mixed-use New Cairo destination, planned with residential, office, retail, dining and hotel uses.",
    source: { label: "One Ninety project profile · Hill International", url: "https://www.hillintl.com/project/1-ninety/" },
  },
} satisfies Record<(typeof PRIMARY_DEVELOPERS)[number], DeveloperProfile>;

export function developerProfile(name: string): DeveloperProfile {
  return DEVELOPER_PROFILES[name as keyof typeof DEVELOPER_PROFILES] ?? {
    heading: "Portfolio details",
    detail: "Ask our team for current project availability, locations, prices and payment plans for this developer.",
  };
}
