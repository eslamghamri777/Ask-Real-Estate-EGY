import { ClayFooter, ClayHeader } from "@/components/ClayLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import {
  ImagePlus,
  KeyRound,
  Loader2,
  LockKeyhole,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

const TYPES = ["apartment", "villa", "penthouse", "duplex", "studio", "townhouse"];

export default function Creator() {
  return (
    <div className="flex min-h-screen flex-col">
      <ClayHeader />
      <CreatorBody />
      <ClayFooter />
    </div>
  );
}

function CreatorBody() {
  const { isLoading, isAuthenticated } = useAuth();
  const isCreator = useQuery(api.creator.isCreator);

  if (isLoading || isCreator === undefined) {
    return (
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-10">
        <Skeleton className="h-24 w-full rounded-[1.5rem]" />
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-[1.5rem]" />
          <Skeleton className="h-96 rounded-[1.5rem]" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !isCreator) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-10">
        <AccessGate signedIn={isAuthenticated} />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-10">
      <header className="clay-card clay-md p-6 sm:p-8">
        <p className="eyebrow">Creator studio</p>
        <h1 className="font-display mt-2 text-3xl tracking-tight">
          Publish a property
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Everything you publish appears instantly in the public catalog.
          Pricing stays internal — customers message the team for it.
        </p>
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <PublishForm />
        <PostManager />
      </div>
    </main>
  );
}

/* ============ Access gate ============ */

function AccessGate({ signedIn }: { signedIn: boolean }) {
  const hasCode = useQuery(api.creator.hasAccessCode);
  const redeem = useMutation(api.creator.redeemAccessCode);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const ok = await redeem({ code });
      if (ok) {
        toast.success("Creator access granted");
      } else {
        setError("That code isn't right. Check it and try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="clay-card clay-md px-8 py-10 text-center">
      <span className="clay-icon clay-sheen mx-auto size-14 bg-primary text-primary-foreground">
        <LockKeyhole className="size-6" />
      </span>
      <h1 className="font-display mt-4 text-2xl">Creator access</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {signedIn
          ? "This area is for the Ask Real Estate team. Enter the access code to unlock publishing."
          : "Sign in first, then enter your creator access code to unlock publishing."}
      </p>

      {!signedIn ? (
        <Button asChild className="clay-btn clay-btn-primary mt-6 rounded-full px-6">
          <Link to="/auth?returnTo=%2Fcreator">Sign in</Link>
        </Button>
      ) : hasCode === false ? (
        <p className="clay-well mt-6 rounded-2xl px-4 py-3 text-sm text-muted-foreground">
          No access code is configured on the server yet. Set the
          <span className="mx-1 font-mono text-xs">CREATOR_ACCESS_CODE</span>
          environment variable, then return here.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Access code"
            required
            className="clay-input h-11 text-center shadow-none"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            disabled={busy}
            className="clay-btn clay-btn-primary h-11 rounded-full"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <KeyRound className="size-4" />
            )}
            Unlock studio
          </Button>
        </form>
      )}
    </div>
  );
}

/* ============ Publish form ============ */

type Pending = { storageId: Id<"_storage">; url: string; name: string };

function PublishForm() {
  const areaOptions = useQuery(api.listings.areas);
  const generateUploadUrl = useMutation(api.creator.generatePhotoUploadUrl);
  const createPost = useMutation(api.creator.createPost);

  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState<"sale" | "rent">("sale");
  const [type, setType] = useState("apartment");
  const [area, setArea] = useState("");
  const [bedrooms, setBedrooms] = useState("2");
  const [bathrooms, setBathrooms] = useState("1");
  const [areaSqm, setAreaSqm] = useState("");
  const [amenities, setAmenities] = useState("");
  const [featured, setFeatured] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
        setPending((p) => [
          ...p,
          { storageId, url: URL.createObjectURL(file), name: file.name },
        ]);
      }
    } catch {
      setError("A photo failed to upload. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    setError(null);
    try {
      await createPost({
        title,
        description: (document.getElementById("post-description") as HTMLTextAreaElement)
          ?.value ?? "",
        purpose,
        type,
        area,
        bedrooms: Number(bedrooms) || 0,
        bathrooms: Number(bathrooms) || 0,
        areaSqm: Number(areaSqm) || 0,
        amenities: amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        featured,
        photoIds: pending.map((p) => p.storageId),
      });
      toast.success("Published", {
        description: "The property is now live in the catalog.",
      });
      setTitle("");
      setArea("");
      setAreaSqm("");
      setAmenities("");
      setBedrooms("2");
      setBathrooms("1");
      setFeatured(false);
      setPending([]);
      const desc = document.getElementById("post-description") as HTMLTextAreaElement | null;
      if (desc) desc.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publishing failed.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <section className="clay-card clay-md p-6">
      <h2 className="font-display flex items-center gap-2 text-xl">
        <Plus className="size-5 text-primary" />
        New post
      </h2>

      <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
        {/* Photos */}
        <div className="clay-well rounded-[1.25rem] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Photos</p>
            <label className="clay-btn clay-btn-light cursor-pointer rounded-full px-4 py-2 text-xs">
              <ImagePlus className="size-4" />
              {uploading ? "Uploading…" : "Add photos"}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => pickFiles(e.target.files)}
              />
            </label>
          </div>
          {pending.length > 0 ? (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {pending.map((p) => (
                <div key={p.storageId} className="relative">
                  <img
                    src={p.url}
                    alt={p.name}
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() =>
                      setPending((list) => list.filter((x) => x.storageId !== p.storageId))
                    }
                    className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-card shadow-md"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              Upload one or more images — the first becomes the cover.
            </p>
          )}
        </div>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Property title — e.g. Nile-View Apartment in Zamalek"
          required
          minLength={4}
          className="clay-input h-11 shadow-none"
        />

        <textarea
          id="post-description"
          required
          rows={3}
          placeholder="Describe the property — light, layout, the street, what makes it special."
          className="clay-input resize-none shadow-none"
        />

        <div className="clay-well flex w-fit items-center gap-1 rounded-full p-1.5">
          {(["sale", "rent"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPurpose(p)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                purpose === p ? "bg-card clay-sm" : "text-muted-foreground"
              }`}
            >
              {p === "sale" ? "For sale" : "For rent"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-11 rounded-full border-none bg-card px-5 text-sm shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="Area — e.g. Maadi"
            required
            list="creator-areas"
            className="clay-input h-11 shadow-none"
          />
          <datalist id="creator-areas">
            {(areaOptions ?? []).map((a) => (
              <option key={a.name} value={a.name} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            type="number"
            min={0}
            max={20}
            aria-label="Bedrooms"
            className="clay-input h-11 shadow-none"
          />
          <Input
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
            type="number"
            min={0}
            max={20}
            aria-label="Bathrooms"
            className="clay-input h-11 shadow-none"
          />
          <Input
            value={areaSqm}
            onChange={(e) => setAreaSqm(e.target.value)}
            type="number"
            min={5}
            max={5000}
            placeholder="m²"
            required
            aria-label="Area in square meters"
            className="clay-input h-11 shadow-none"
          />
        </div>

        <Input
          value={amenities}
          onChange={(e) => setAmenities(e.target.value)}
          placeholder="Amenities, comma-separated — e.g. Nile view, Elevator"
          className="clay-input h-11 shadow-none"
        />

        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="size-4 accent-[var(--primary)]"
          />
          <Sparkles className="size-4 text-primary" />
          Feature on the home page
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          disabled={publishing || uploading || pending.length === 0}
          className="clay-btn clay-btn-primary h-11 rounded-full"
        >
          {publishing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          {pending.length === 0 ? "Add at least one photo" : "Publish post"}
        </Button>
      </form>
    </section>
  );
}

/* ============ Post manager ============ */

type CreatorPost = {
  _id: string;
  slug: string;
  title: string;
  purpose: "sale" | "rent";
  type: string;
  area: string;
  featured: boolean;
  cover: string | null;
};

function PostManager() {
  const posts = useQuery(api.creator.myPosts);
  const setFeatured = useMutation(api.creator.setFeatured);
  const deletePost = useMutation(api.creator.deletePost);
  const [confirming, setConfirming] = useState<string | null>(null);

  const remove = async (id: string) => {
    try {
      await deletePost({ id: id as Id<"listings"> });
      toast.success("Post deleted");
      setConfirming(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  return (
    <section className="clay-card clay-md p-6">
      <h2 className="font-display text-xl">Published posts</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {posts === undefined
          ? "Loading…"
          : `${posts.length} ${posts.length === 1 ? "post" : "posts"} live`}
      </p>

      {posts === undefined ? (
        <div className="mt-4 flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="clay-well mt-4 rounded-2xl px-4 py-8 text-center text-sm text-muted-foreground">
          Nothing published yet. Your first post will appear here.
        </div>
      ) : (
        <ul className="mt-4 flex max-h-[36rem] flex-col gap-3 overflow-y-auto pr-1">
          {posts.map((post) => (
            <li
              key={post._id}
              className="clay-well flex items-center gap-3 rounded-2xl p-3"
            >
              {post.cover ? (
                <img
                  src={post.cover}
                  alt=""
                  className="size-14 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-card">
                  <ImagePlus className="size-5 text-muted-foreground" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{post.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {post.area} · {post.type} · {post.purpose === "sale" ? "Sale" : "Rent"}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <button
                    onClick={() =>
                      setFeatured({ id: post._id as Id<"listings">, featured: !post.featured })
                    }
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                      post.featured
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Sparkles className="mr-1 inline size-3" />
                    {post.featured ? "Featured" : "Feature"}
                  </button>
                  {confirming === post._id ? (
                    <>
                      <button
                        onClick={() => remove(post._id)}
                        className="rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-white"
                      >
                        Confirm delete
                      </button>
                      <button
                        onClick={() => setConfirming(null)}
                        className="rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                      >
                        Keep
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirming(post._id)}
                      className="rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="mr-1 inline size-3" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
