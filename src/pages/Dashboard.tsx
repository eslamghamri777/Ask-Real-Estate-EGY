import { ClayFooter, ClayHeader } from "@/components/ClayLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ClayHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <div className="flex flex-col gap-8">
          <header className="clay-card clay-md flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                Your saved space
              </p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
                Welcome{user?.name ? `, ${user.name}` : ""}
              </h1>
            </div>
            <Button
              type="button"
              className="clay-btn clay-btn-light h-11 gap-2 self-start rounded-full px-6"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </header>

          <Card className="clay-card clay-md shadow-none">
            <CardHeader>
              <div className="clay-icon clay-sheen mb-3 size-11 bg-clay-mint text-foreground">
                <LayoutDashboard className="size-5" />
              </div>
              <CardTitle>Browsing is open to everyone</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">
              Version 1 of Ask Real Estate is all about browsing listings with
              photos — no account needed. Saved homes and inquiries are on the
              roadmap; your account keeps you signed in for what's next.
            </CardContent>
            <CardFooter>
              <Button
                asChild
                className="clay-btn clay-btn-primary h-11 rounded-full px-6"
              >
                <Link to="/listings">Browse listings</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <ClayFooter />
    </div>
  );
}
