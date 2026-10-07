import {
  ClayFooter,
  ClayHeader,
  useSiteSocials,
  whatsappUrl,
} from "@/components/ClayLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { formatPhoneForDisplay, normalizeEgyptianPhone } from "@/convex/phone";
import {
  deskSearch,
  hasRequirements,
  readRequestFilters,
  requestSummary,
} from "@/lib/primaryRequest";
import { useAction } from "convex/react";
import { ArrowLeft, Check, Loader2, MessageCircle, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";

/**
 * The second half of the Primary Sale request desk.
 *
 * /listings collects the requirements; this page adds the customer's name and
 * WhatsApp number, then the submitRequest action delivers the compiled request
 * to the team's WhatsApp from the server. Nothing opens on the customer's side
 * and they never have to confirm a send.
 */

export default function PropertyRequest() {
  const [searchParams] = useSearchParams();
  const filters = useMemo(
    () => readRequestFilters(searchParams),
    [searchParams],
  );
  const rows = useMemo(() => requestSummary(filters), [filters]);
  const ready = hasRequirements(filters);
  const deskUrl = deskSearch(filters);

  const submitRequest = useAction(api.requestDelivery.submitRequest);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  // Set when the server-side WhatsApp handoff fails: the lead is stored, but
  // the team only gets it if we offer the customer a one-tap manual send.
  const [manualReason, setManualReason] = useState<string | null>(null);
  const socials = useSiteSocials();

  // Pre-filled text for the WhatsApp handoff, mirroring what the server would
  // have sent: the customer's details plus the requirements they picked.
  const manualMessage = [
    "New primary-sale request — Ask Real Estate",
    "",
    `Name: ${`${firstName} ${lastName}`.trim() || "(not given)"}`,
    `My WhatsApp: ${normalizeEgyptianPhone(phone) || phone}`,
    "",
    ...rows.map((row) => `${row.label}: ${row.value}`),
  ].join("\n");
  const manualUrl = whatsappUrl(socials.whatsappNumber, manualMessage);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;

    const first = firstName.trim();
    const last = lastName.trim();
    if (!first || !last) {
      setError("Please enter your first and last name.");
      return;
    }
    const normalized = normalizeEgyptianPhone(phone);
    if (!normalized) {
      setError("That WhatsApp number doesn't look right — try 01012345678.");
      return;
    }

    setError(null);
    setPending(true);
    try {
      const result = await submitRequest({
        firstName: first,
        lastName: last,
        phone: normalized,
        area: filters.area || undefined,
        type: filters.type || undefined,
        bedrooms: filters.bedrooms || undefined,
        delivery: filters.delivery || undefined,
        developer: filters.developer || undefined,
        finish: filters.finish || undefined,
        keyword: filters.keyword || undefined,
      });
      setSentTo(normalized);
      if (!result.delivered) setManualReason(result.reason ?? "delivery-failed");
      // Take the customer straight to WhatsApp with their request already
      // filled in, so they confirm the send themselves. Same-tab navigation
      // (not a pop-up) is never blocked by the browser.
      window.location.href = manualUrl;
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We couldn't send your request — please try again.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ClayHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-10 pb-16">
        <Link
          to={deskUrl}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to the request desk
        </Link>

        <header className="mt-6 max-w-2xl">
          <span className="eyebrow">Primary sale — direct from the developer</span>
          <h1 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
            Where should we send your options?
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Add your name and WhatsApp number. Your request goes straight to our
            team's WhatsApp — you don't need to message us or confirm anything
            yourself. A person replies with matching options and prices.
          </p>
        </header>

        {!ready ? (
          <div className="clay-card clay-md mt-8 max-w-lg px-8 py-10 text-center">
            <span className="clay-icon clay-sheen mx-auto size-14 bg-clay-blush">
              <MessageCircle className="size-6" />
            </span>
            <h2 className="font-display mt-4 text-xl">
              Tell us what you're looking for first
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Pick an area, a property type or any other requirement on the
              request desk, then come back here to send it.
            </p>
            <Button
              asChild
              className="clay-btn clay-btn-primary mt-6 rounded-full px-6"
            >
              <Link to="/listings?purpose=primary">Open the request desk</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            {/* What the team will receive */}
            <section className="clay-card clay-md p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg">Your requirements</h2>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Sent to our team
                  </p>
                </div>
                <Link
                  to={deskUrl}
                  className="shrink-0 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Edit
                </Link>
              </div>

              <dl className="mt-5 space-y-3">
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-baseline justify-between gap-4 border-b border-border pb-3 last:border-none last:pb-0"
                  >
                    <dt className="text-sm text-muted-foreground">
                      {row.label}
                    </dt>
                    <dd className="text-right text-sm font-semibold">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-6 rounded-2xl bg-secondary px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                Enjoy <span className="font-display italic">0%</span> brokerage
                fees on primary sales — our advisory is paid by the developer,
                not by you.
              </p>
            </section>

            {/* Contact details */}
            <section className="clay-card clay-md p-6">
              {sentTo ? (
                <div className="py-2 text-center">
                  <span className="clay-icon clay-sheen mx-auto size-14 bg-primary text-primary-foreground">
                    <Check className="size-6" />
                  </span>
                  <h2 className="font-display mt-4 text-2xl">
                    Request received
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Our team has your requirements and will reply on WhatsApp to{" "}
                    <span className="font-semibold text-foreground">
                      {formatPhoneForDisplay(sentTo)}
                    </span>
                    . Nothing else is needed from you.
                  </p>
                  {manualReason && (
                    <div className="mt-6 rounded-2xl bg-secondary px-5 py-4 text-left">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        One tap to be sure
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        Your request is saved on our side. WhatsApp should open
                        with your request already filled in — just press send.
                        If it didn't open, use the button below.
                      </p>
                      <Button
                        asChild
                        className="clay-btn clay-btn-primary mt-3 w-full rounded-full px-6"
                      >
                        <a
                          href={manualUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="size-4" />
                          Send it on WhatsApp
                        </a>
                      </Button>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Button
                      asChild
                      className="clay-btn clay-btn-primary rounded-full px-6"
                    >
                      <Link to={deskUrl}>Back to the desk</Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      className="clay-btn clay-btn-light rounded-full px-6"
                    >
                      <Link to="/listings">Browse properties</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h2 className="font-display text-lg">Your details</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      We only use these to send you the options you asked for.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        autoComplete="given-name"
                        placeholder="Sara"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={pending}
                        className="clay-input shadow-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        autoComplete="family-name"
                        placeholder="Ahmed"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={pending}
                        className="clay-input shadow-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Your WhatsApp number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="01012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={pending}
                      className="clay-input shadow-none"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Egyptian numbers work as 010… — or include your country
                      code.
                    </p>
                  </div>

                  {error && (
                    <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={pending}
                    className="clay-btn clay-btn-primary h-12 w-full rounded-full px-7"
                  >
                    {pending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Sending your request…
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        Send my request
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    After you submit, WhatsApp opens with your request already
                    filled in — all you do is press send.
                  </p>
                </form>
              )}
            </section>
          </div>
        )}
      </main>

      <ClayFooter />
    </div>
  );
}
