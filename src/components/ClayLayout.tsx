import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { Facebook, Home, Instagram, MessageCircle, Search, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router";

const navLinks = [
  { to: "/listings?purpose=primary", label: "Primary sale" },
  { to: "/listings?purpose=resale", label: "Resale" },
  { to: "/listings?purpose=rent", label: "Rent" },
  { to: "/listings", label: "All properties" },
];

/**
 * Default Ask Real Estate WhatsApp line — 0100 953 3599 (+20 100 953 3599).
 * Used until the creator saves a number in the studio's "Connected socials"
 * card; the saved value takes over automatically.
 */
export const DEFAULT_WHATSAPP_NUMBER = "201009533599";

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
          <span className="clay-icon clay-sheen size-10 bg-primary text-primary-foreground">
            <Home className="size-5" />
          </span>
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
          <Link to="/listings" className="md:hidden" aria-label="Browse properties">
            <span className="clay-icon clay-sheen size-10 bg-card text-foreground">
              <Search className="size-5" />
            </span>
          </Link>
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
        <div className="flex items-center gap-2">
          <span className="clay-icon clay-sheen size-9 bg-primary text-primary-foreground">
            <Home className="size-4" />
          </span>
          <span className="font-display text-base tracking-tight">
            Ask Real Estate
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
            <MessageCircle className="size-4" />
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
