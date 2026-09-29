import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { Home, MessageCircle, Search, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router";

const navLinks = [
  { to: "/listings?purpose=sale", label: "Buy" },
  { to: "/listings?purpose=rent", label: "Rent" },
  { to: "/listings", label: "All properties" },
];

/** Ask Real Estate WhatsApp line — 0100 953 3599 (+20 100 953 3599 international). */
export function whatsappUrl(message?: string): string {
  const base = "https://wa.me/201009533599";
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function ClayHeader() {
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
          {navLinks.map((link) => (
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

export function ClayFooter() {
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
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-full px-4 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <MessageCircle className="size-4" />
            Contact us · 0100 953 3599
          </a>
        </div>
        <p className="text-xs text-muted-foreground/70">
          © {new Date().getFullYear()} Ask Real Estate · Cairo, Egypt
        </p>
      </div>
    </footer>
  );
}
