/**
 * The Primary Sale desk collects requirements only. Those requirements travel
 * to /request through the URL, and this module is the single place that reads,
 * writes and labels them — so the desk and the request page always agree.
 */

export const DELIVERY_VALUES = [
  "immediate",
  "6m",
  "12m",
  "2y",
  "3y",
  "4y",
] as const;

export const FINISH_VALUES = [
  "core-shell",
  "semi-finished",
  "fully-finished",
  "finished-furnished",
] as const;

export type Delivery = (typeof DELIVERY_VALUES)[number];
export type Finish = (typeof FINISH_VALUES)[number];

export const DELIVERY_LABELS: Record<Delivery, string> = {
  immediate: "Immediate",
  "6m": "Within 6 months",
  "12m": "Within 12 months",
  "2y": "Within 2 years",
  "3y": "Within 3 years",
  "4y": "Within 4 years",
};

export const FINISH_LABELS: Record<Finish, string> = {
  "core-shell": "Core & shell",
  "semi-finished": "Semi-finished",
  "fully-finished": "Fully finished",
  "finished-furnished": "Finished & furnished",
};

export type RequestFilters = {
  area: string;
  type: string;
  bedrooms: number;
  delivery: Delivery | "";
  developer: string;
  finish: Finish | "";
  keyword: string;
};

export function asDelivery(value: string): Delivery | "" {
  return (DELIVERY_VALUES as readonly string[]).includes(value)
    ? (value as Delivery)
    : "";
}

export function asFinish(value: string): Finish | "" {
  return (FINISH_VALUES as readonly string[]).includes(value)
    ? (value as Finish)
    : "";
}

/** Read the desk's requirements off the URL the desk navigated with. */
export function readRequestFilters(params: URLSearchParams): RequestFilters {
  return {
    area: params.get("area") ?? "",
    type: params.get("type") ?? "",
    bedrooms: Number(params.get("bedrooms")) || 0,
    delivery: asDelivery(params.get("delivery") ?? ""),
    developer: params.get("developer") ?? "",
    finish: asFinish(params.get("finish") ?? ""),
    keyword: (params.get("q") ?? "").trim(),
  };
}

/** The desk URL for these requirements, so "edit" lands on the same filters. */
export function deskSearch(filters: RequestFilters): string {
  const params = new URLSearchParams({ purpose: "primary" });
  if (filters.area) params.set("area", filters.area);
  if (filters.type) params.set("type", filters.type);
  if (filters.bedrooms) params.set("bedrooms", String(filters.bedrooms));
  if (filters.delivery) params.set("delivery", filters.delivery);
  if (filters.developer) params.set("developer", filters.developer);
  if (filters.finish) params.set("finish", filters.finish);
  if (filters.keyword) params.set("q", filters.keyword);
  return `/listings?${params.toString()}`;
}

/** Whether the customer actually picked anything worth sending. */
export function hasRequirements(filters: RequestFilters): boolean {
  return Boolean(
    filters.area ||
      filters.type ||
      filters.bedrooms ||
      filters.delivery ||
      filters.developer ||
      filters.finish ||
      filters.keyword,
  );
}

/** One row per requirement, for the review card on the request page. */
export function requestSummary(
  filters: RequestFilters,
): { label: string; value: string }[] {
  return [
    { label: "Area", value: filters.area || "Any" },
    {
      label: "Type",
      value: filters.type
        ? filters.type[0].toUpperCase() + filters.type.slice(1)
        : "Any",
    },
    {
      label: "Bedrooms",
      value: filters.bedrooms ? `${filters.bedrooms}+` : "Any",
    },
    {
      label: "Delivery",
      value: filters.delivery ? DELIVERY_LABELS[filters.delivery] : "Any",
    },
    { label: "Developer", value: filters.developer || "Any" },
    {
      label: "Finish",
      value: filters.finish ? FINISH_LABELS[filters.finish] : "Any",
    },
    ...(filters.keyword
      ? [{ label: "Keyword", value: filters.keyword }]
      : []),
  ];
}
