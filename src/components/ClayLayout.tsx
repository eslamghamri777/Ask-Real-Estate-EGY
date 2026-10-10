import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import askMark from "@/assets/ask-mark.svg";
import { useMutation, useQuery } from "convex/react";
import { Search, UserRound, MessageCircle, Phone, Facebook, Instagram, Sparkles } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Link } from "react-router";

/**
 * Header search — the magnifier button takes the customer straight to the
 * listings page, where the available filters live above the results:
 * purpose, area, property type, bedrooms, finish, developer, and delivery time.
 */
function HeaderSearch() {
  return (
    <Link
      to="/listings"
      aria-label="Search properties"
      className="clay-btn clay-btn-primary h-10 shrink-0 rounded-full px-3 sm:px-5"
    >
      <Search className="size-4" />
      <span className="hidden sm:inline">Search Properties</span>
    </Link>
  );
}

/**
 * Ask Real Estate WhatsApp line — 0115 236 6255 (+20 115 236 6255).
 * Used until the creator saves a number in the studio's "Connected socials"
 * card; the saved value takes over automatically.
 */
export const DEFAULT_WHATSAPP_NUMBER = "201152366255";

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

/**
 * Optional page-specific content rendered in the middle of the top bar —
 * between the Ask Real Estate brand and the right-side actions (e.g. the
 * listings page puts its Primary/Resale/Rent purpose toggle here).
 */
export function ClayHeader({ middle }: { middle?: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const isCreator = useQuery(api.creator.isCreator);
  const ensureCreator = useMutation(api.creator.ensureCreatorForEmail);

  // As soon as the designated creator email signs in (from anywhere), grant
  // the admin role — the studio link and edit buttons then appear instantly.
  // The server no-ops for every other email.
  useEffect(() => {
    if (isAuthenticated && isCreator === false) {
      void ensureCreator().catch(() => undefined);
    }
  }, [isAuthenticated, isCreator, ensureCreator]);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="clay-card clay-sm mx-auto flex max-w-6xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3">
        <Link to="/" aria-label="Ask Real Estate home" className="clay-squish flex shrink-0 items-center gap-2 sm:gap-2.5">
          <img
            src={askMark}
            alt=""
            className="size-9 sm:size-10"
          />
          <span className="hidden font-display text-lg tracking-tight sm:block">
            Ask Real Estate
          </span>
        </Link>

        {middle}

        {/* Right-side actions: Search Properties next to Sign in, on the right edge of the page. */}
        <div className="ml-auto flex items-center gap-2">
          <HeaderSearch />
          {/* The studio editor: only the designated creator email (the site
              editor) sees this option after signing in. */}
          {isCreator && (
            <Button
              asChild
              aria-label="Open studio"
              className="clay-btn clay-btn-light h-10 shrink-0 rounded-full px-3 py-0 font-semibold has-[>svg]:px-3 sm:px-5 sm:has-[>svg]:px-5"
            >
              <Link to="/creator">
                <Sparkles className="size-4" />
                <span className="hidden sm:inline">Studio</span>
              </Link>
            </Button>
          )}
          <Button
            asChild
            aria-label={isAuthenticated ? "My account" : "Sign in"}
            className="clay-btn clay-btn-primary h-10 shrink-0 rounded-full px-3 py-0 font-semibold has-[>svg]:px-3 sm:px-5 sm:has-[>svg]:px-5"
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

/** 201152366255 → 0115 236 6255 for display; falls back to raw digits. */
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
    <footer className="mx-auto w-full max-w-6xl px-3 pb-6 pt-12 sm:px-4 sm:pb-8 sm:pt-16">
      <div className="clay-card flex flex-col items-center gap-4 px-5 py-8 text-center sm:px-8 sm:py-10">
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
