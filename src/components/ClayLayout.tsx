import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import {
  AREAS,
  DELIVERY_OPTIONS,
  FINISH_OPTIONS,
  PRIMARY_DEVELOPERS,
  TYPES,
  type Purpose,
} from "@/lib/filters";
import { useAuth } from "@/hooks/use-auth";
import askMark from "@/assets/ask-mark.svg";
import { useMutation, useQuery } from "convex/react";
import { Search, UserRound, MessageCircle, Phone, Facebook, Instagram } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

const navLinks = [
  { to: "/listings?purpose=primary", label: "Primary sale" },
  { to: "/listings?purpose=resale", label: "Resale" },
  { to: "/listings?purpose=rent", label: "Rent" },
  { to: "/listings", label: "All properties" },
];

// ---------- Header search: every filter in one place ----------

/** All filterable fields the header's search dialog can set. */
type SearchState = {
  purpose: Purpose;
  area: string;
  type: string;
  bedrooms: string;
  delivery: string;
  developer: string;
  finish: string;
  q: string;
};

const EMPTY_SEARCH: SearchState = {
  purpose: "all",
  area: "",
  type: "",
  bedrooms: "0",
  delivery: "",
  developer: "",
  finish: "",
  q: "",
};

/** Read the /listings filters out of a query string, for prefilling the dialog. */
function searchStateFromParams(sp: URLSearchParams): SearchState {
  const p = sp.get("purpose");
  return {
    purpose:
      p === "primary" || p === "resale" || p === "rent" ? p : "all",
    area: sp.get("area") || "",
    type: sp.get("type") || "",
    bedrooms: String(Number(sp.get("bedrooms")) || 0),
    delivery: sp.get("delivery") || "",
    developer: sp.get("developer") || "",
    finish: sp.get("finish") || "",
    q: sp.get("q") || "",
  };
}

/**
 * Header search — a magnifier button that opens a dialog offering every
 * filter the catalog supports (purpose, area, type, bedrooms, finish, and
 * developer + delivery for primary sale), plus a keyword. Submitting jumps
 * to /listings with the selection in the URL; the Listings page already
 * reads filters from there. Opening it on /listings prefills the current
 * filters so the user can tweak rather than start over.
 */
function HeaderSearch() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<SearchState>(EMPTY_SEARCH);

  const openDialog = () => {
    setState(
      location.pathname === "/listings"
        ? searchStateFromParams(new URLSearchParams(location.search))
        : EMPTY_SEARCH,
    );
    setOpen(true);
  };

  const set = <K extends keyof SearchState>(key: K, value: SearchState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const submit = () => {
    const params = new URLSearchParams();
    if (state.purpose !== "all") params.set("purpose", state.purpose);
    if (state.area) params.set("area", state.area);
    if (state.type) params.set("type", state.type);
    if (Number(state.bedrooms)) params.set("bedrooms", state.bedrooms);
    // Developer and delivery time only apply to primary (off-plan) sale.
    if (state.purpose === "primary" && state.delivery)
      params.set("delivery", state.delivery);
    if (state.purpose === "primary" && state.developer)
      params.set("developer", state.developer);
    if (state.finish) params.set("finish", state.finish);
    if (state.q.trim()) params.set("q", state.q.trim());
    const query = params.toString();
    setOpen(false);
    navigate(query ? `/listings?${query}` : "/listings");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={openDialog}
        aria-label="Search properties"
        className="clay-squish flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-md ring-2 ring-primary/30 transition-colors hover:bg-primary/90"
      >
        <Search className="size-4" />
        Search Properties
      </button>

      <DialogContent className="clay-card clay-lg max-h-[calc(100svh-2rem)] overflow-y-auto rounded-[1.75rem] border-none shadow-none sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-tight">
            Search & filter
          </DialogTitle>
          <DialogDescription>
            Pick any combination of filters — or just type a keyword. You can
            narrow things down again on the results page.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="grid grid-cols-2 gap-2.5">
            <Select
              value={state.purpose}
              onValueChange={(v) => set("purpose", v as Purpose)}
            >
              <SelectTrigger className="clay-sheen col-span-2 h-11 w-full rounded-full border-none bg-card px-4 text-sm font-semibold shadow-none">
                <SelectValue placeholder="Purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Buying &amp; renting</SelectItem>
                <SelectItem value="primary">Primary sale (off-plan)</SelectItem>
                <SelectItem value="resale">Resale</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
              </SelectContent>
            </Select>

            {state.purpose === "primary" && (
              <Select
                value={state.developer || "any-developer"}
                onValueChange={(v) =>
                  set("developer", v === "any-developer" ? "" : v)
                }
              >
                <SelectTrigger className="clay-sheen col-span-2 h-11 w-full rounded-full border-none bg-card px-4 text-sm font-semibold shadow-none">
                  <SelectValue placeholder="Developer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any-developer">Any developer</SelectItem>
                  {PRIMARY_DEVELOPERS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {state.purpose === "primary" && (
              <Select
                value={state.delivery || "any-delivery"}
                onValueChange={(v) =>
                  set("delivery", v === "any-delivery" ? "" : v)
                }
              >
                <SelectTrigger className="clay-sheen col-span-2 h-11 w-full rounded-full border-none bg-card px-4 text-sm font-semibold shadow-none">
                  <SelectValue placeholder="Delivery time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any-delivery">Any delivery time</SelectItem>
                  {DELIVERY_OPTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select
              value={state.area || "any-area"}
              onValueChange={(v) => set("area", v === "any-area" ? "" : v)}
            >
              <SelectTrigger className="clay-sheen h-11 w-full rounded-full border-none bg-card px-4 text-sm font-semibold shadow-none">
                <SelectValue placeholder="Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any-area">Any area</SelectItem>
                {AREAS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={state.type || "any-type"}
              onValueChange={(v) => set("type", v === "any-type" ? "" : v)}
            >
              <SelectTrigger className="clay-sheen h-11 w-full rounded-full border-none bg-card px-4 text-sm font-semibold shadow-none">
                <SelectValue placeholder="Property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any-type">Any type</SelectItem>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={state.bedrooms}
              onValueChange={(v) => set("bedrooms", v)}
            >
              <SelectTrigger className="clay-sheen h-11 w-full rounded-full border-none bg-card px-4 text-sm font-semibold shadow-none">
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n === 0 ? "Any beds" : `${n}+ beds`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={state.finish || "any-finish"}
              onValueChange={(v) =>
                set("finish", v === "any-finish" ? "" : v)
              }
            >
              <SelectTrigger className="clay-sheen h-11 w-full rounded-full border-none bg-card px-4 text-sm font-semibold shadow-none">
                <SelectValue placeholder="Finish" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any-finish">Any finish</SelectItem>
                {FINISH_OPTIONS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={state.q}
              onChange={(e) => set("q", e.target.value)}
              placeholder="Keyword — e.g. Nile view, furnished…"
              className="clay-input h-11 pl-10 shadow-none"
            />
          </div>

          <div className="mt-1 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setState(EMPTY_SEARCH)}
              className="clay-btn clay-btn-light flex-1 rounded-full px-4"
            >
              Clear
            </Button>
            <Button type="submit" className="clay-btn clay-btn-primary flex-1 rounded-full px-5">
              <Search className="size-4" />
              Search
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Default Ask Real Estate WhatsApp line — 0100 953 3599 (+20 100 953 3599).
 * Used until the creator saves a number in the studio's "Connected socials"
 * card; the saved value takes over automatically.
 */
export const DEFAULT_WHATSAPP_NUMBER = "201009533599";

/** TikTok brand glyph — lucide has no TikTok icon, so we ship our own. */
export function TikTokIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

/** Build a wa.me deep link, optionally with a pre-filled message. */
export function whatsappUrl(number: string | null | undefined, message?: string): string {
  const base = `https://wa.me/${number || DEFAULT_WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Convenience hook — the configured socials with the default fallback. */
export function useSiteSocials() {
  const settings = useQuery(api.siteSettings.getPublic);
  return {
    facebookUrl: settings?.facebookUrl ?? null,
    instagramUrl: settings?.instagramUrl ?? null,
    tiktokUrl: settings?.tiktokUrl ?? null,
    whatsappNumber: settings?.whatsappNumber ?? DEFAULT_WHATSAPP_NUMBER,
    loaded: settings !== undefined,
  };
}

export function ClayHeader() {
  const { isAuthenticated } = useAuth();
  const isCreator = useQuery(api.creator.isCreator);
  const ensureCreator = useMutation(api.creator.ensureCreatorForEmail);
  const location = useLocation();
  // Buy / Rent / All properties are only offered on the home page — once the
  // customer follows one, the header stays clean and the logo returns home.
  const onHomePage = location.pathname === "/";

  // As soon as the designated creator email signs in (from anywhere), grant
  // the admin role — the studio link and edit buttons then appear instantly.
  // The server no-ops for every other email.
  useEffect(() => {
    if (isAuthenticated && isCreator === false) {
      void ensureCreator().catch(() => undefined);
    }
  }, [isAuthenticated, isCreator, ensureCreator]);

  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <div className="clay-card clay-sm mx-auto flex max-w-6xl items-center gap-3 px-5 py-3">
        <Link to="/" className="clay-squish flex items-center gap-2.5">
          <img
            src={askMark}
            alt=""
            className="size-10"
          />
          <span className="hidden font-display text-lg tracking-tight sm:block">
            Ask Real Estate
          </span>
        </Link>

        <nav className="mx-auto hidden items-center gap-1 md:flex">
          {onHomePage &&
            navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} label={link.label} />
            ))}
          {isCreator === true && (
            <NavLink to="/creator" label="Creator studio" />
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <HeaderSearch />
          <Button
            asChild
            className="clay-btn clay-btn-primary h-10 rounded-full px-5"
          >
            <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
              <UserRound className="size-4" />
              <span className="hidden sm:inline">
                {isAuthenticated ? "My account" : "Sign in"}
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, label }: { to: string; label: string }) {
  const location = useLocation();
  const [path, query] = to.split("?");
  const isActive =
    location.pathname === path &&
    location.search === (query ? `?${query}` : "");

  return (
    <Link
      to={to}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}

/**
 * Tappable Facebook / Instagram / WhatsApp icon buttons, shown down the
 * pages. Each one opens the profile connected in the creator studio; links
 * not yet configured are hidden (WhatsApp always shows via its default).
 */
export function SocialIconLinks({ className = "" }: { className?: string }) {
  const socials = useSiteSocials();

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      {socials.facebookUrl && (
        <a
          href={socials.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ask Real Estate on Facebook"
          className="clay-icon clay-sheen clay-squish size-12 bg-card"
        >
          <Facebook className="size-5 text-[#1877F2]" />
        </a>
      )}
      {socials.instagramUrl && (
        <a
          href={socials.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ask Real Estate on Instagram"
          className="clay-icon clay-sheen clay-squish size-12 bg-card"
        >
          <Instagram className="size-5 text-[#C13584]" />
        </a>
      )}
      {socials.tiktokUrl && (
        <a
          href={socials.tiktokUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ask Real Estate on TikTok"
          className="clay-icon clay-sheen clay-squish size-12 bg-card"
        >
          <TikTokIcon className="size-5 text-foreground" />
        </a>
      )}
      <a
        href={whatsappUrl(socials.whatsappNumber)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Ask Real Estate on WhatsApp"
        className="clay-icon clay-sheen clay-squish size-12 bg-card"
      >
        <MessageCircle className="size-5 text-[#25D366]" />
      </a>
    </div>
  );
}

/** 201009533599 → 0100 953 3599 for display; falls back to raw digits. */
function formatLocalNumber(number: string): string {
  if (number.length === 12 && number.startsWith("20")) {
    const local = `0${number.slice(2)}`;
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  }
  return number;
}

export function ClayFooter() {
  const socials = useSiteSocials();

  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pb-8 pt-16">
      <div className="clay-card flex flex-col items-center gap-4 px-8 py-10 text-center">
        <div className="flex flex-col items-center gap-2">
          <img src={askMark} alt="" className="size-10" />
          <span className="font-display text-base tracking-tight">
            Ask Real Estate
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Heart of Cairo
          </span>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Property sales and lettings across Egypt. Every listing is verified
          by our team before it goes live — so what you see is what you'll
          find when you visit.
        </p>
        <SocialIconLinks className="mt-2" />

        <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-medium">
          <a
            href={whatsappUrl(socials.whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Phone className="size-4" />
            Contact us · {formatLocalNumber(socials.whatsappNumber)}
          </a>
        </div>
        <p className="text-xs text-muted-foreground/70">
          © {new Date().getFullYear()} Ask Real Estate · Egypt
        </p>
      </div>
    </footer>
  );
}
