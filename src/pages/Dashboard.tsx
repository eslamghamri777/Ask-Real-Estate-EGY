import { ClayFooter, ClayHeader } from "@/components/ClayLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { KeyRound, LayoutDashboard, LogOut, Search } from "lucide-react";
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
              <p className="eyebrow">Your account</p>
              <h1 className="font-display mt-2 text-3xl tracking-tight">
                Welcome{user?.name ? `, ${user.name}` : ""}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {user?.email
                  ? `Signed in as ${user.email}`
                  : "You're signed in and ready to enquire."}
              </p>
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

          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="clay-card clay-md shadow-none">
              <CardHeader>
                <div className="clay-icon clay-sheen mb-3 size-11 bg-primary text-primary-foreground">
                  <Search className="size-5" />
                </div>
                <CardTitle className="font-display text-lg">
                  Continue browsing
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                The full catalog is open to you — homes for sale and rent
                across Cairo, each one visited and photographed by our team.
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className="clay-btn clay-btn-primary h-11 rounded-full px-6"
                >
                  <Link to="/listings">Browse properties</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="clay-card clay-md shadow-none">
              <CardHeader>
                <div className="clay-icon clay-sheen mb-3 size-11 bg-secondary text-foreground">
                  <KeyRound className="size-5" />
                </div>
                <CardTitle className="font-display text-lg">
                  Why sign in?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                A signed-in account lets you message our team about any
                property and keeps your enquiries in one place as the platform
                grows.
              </CardContent>
            </Card>
          </div>

          <Card className="clay-card clay-md shadow-none">
            <CardHeader>
              <div className="clay-icon clay-sheen mb-3 size-11 bg-secondary text-foreground">
                <LayoutDashboard className="size-5" />
              </div>
              <CardTitle className="font-display text-lg">
                What's next
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">
              Saved searches, enquiry history, and viewing appointments are on
              the roadmap. For now, browse freely and message us about any
              home that interests you — a person will always reply.
            </CardContent>
          </Card>
        </div>
      </main>
      <ClayFooter />
    </div>
  );
}
