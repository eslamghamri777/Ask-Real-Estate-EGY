import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Home, Search, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router";

const navLinks = [
  { to: "/listings?purpose=sale", label: "Buy" },
  { to: "/listings?purpose=rent", label: "Rent" },
  { to: "/listings", label: "All listings" },
];

export function ClayHeader() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <div className="clay-card clay-sm mx-auto flex max-w-6xl items-center gap-3 px-5 py-3">
        <Link to="/" className="clay-squish flex items-center gap-2.5">
          <span className="clay-icon clay-sheen size-10 bg-primary text-primary-foreground">
            <Home className="size-5" />
          </span>
          <span className="hidden text-lg font-extrabold tracking-tight sm:block">
            Ask Real Estate
          </span>
        </Link>

        <nav className="mx-auto hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} label={link.label} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link to="/listings" className="md:hidden" aria-label="Browse listings">
            <span className="clay-icon clay-sheen size-10 bg-clay-mint text-foreground">
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
                {isAuthenticated ? "My space" : "Sign in"}
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
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
        isActive
          ? "clay-sheen bg-secondary text-foreground shadow-sm"
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
      <div className="clay-card flex flex-col items-center gap-4 px-8 py-8 text-center">
        <div className="flex items-center gap-2">
          <span className="clay-icon clay-sheen size-9 bg-primary text-primary-foreground">
            <Home className="size-4" />
          </span>
          <span className="text-base font-extrabold tracking-tight">
            Ask Real Estate
          </span>
        </div>
        <p className="max-w-md text-sm text-muted-foreground">
          Homes for sale and rent across Cairo — from Zamalek's leafy streets
          to New Cairo's gated compounds. Version 1: browse listings, simply.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-semibold">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-full px-4 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-muted-foreground/70">
          © {new Date().getFullYear()} Ask Real Estate · Cairo, Egypt
        </p>
      </div>
    </footer>
  );
}
