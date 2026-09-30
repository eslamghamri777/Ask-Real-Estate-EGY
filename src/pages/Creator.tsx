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
  Facebook,
  ImagePlus,
  Instagram,
  KeyRound,
  Loader2,
  LockKeyhole,
  MessageCircle,
  Pencil,
  Plus,
  Share2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { TikTokIcon } from "@/components/ClayLayout";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

const TYPES = ["apartment", "villa", "chalet", "penthouse", "duplex", "studio", "townhouse"];

const DELIVERY_OPTIONS = [
  { value: "immediate", label: "Immediate" },
  { value: "6m", label: "6 months" },
  { value: "12m", label: "12 months" },
  { value: "2y", label: "2 years" },
  { value: "3y", label: "3 years" },
  { value: "4y", label: "4 years" },
] as const;

const FINISH_OPTIONS = [
  { value: "core-shell", label: "Core & Shell / Unfinished" },
  { value: "semi-finished", label: "Semi-Finished" },
  { value: "fully-finished", label: "Fully Finished" },
  { value: "finished-furnished", label: "Finished-Furnished" },
] as const;

/** Photos above this size are rejected with a clear message instead of failing mid-upload. */
const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8 MB

type CreatorPost = {
  _id: string;
  slug: string;
  title: string;
  description: string;
  purpose: "primary" | "resale" | "rent";
  type: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  amenities: string[];
  featured: boolean;
  deliveryTime: string | null;
  finish: string | null;
  photos: { url: string; storageId?: Id<"_storage"> }[];
  cover: string | null;
};

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
  const posts = useQuery(api.creator.myPosts);
  const [searchParams, setSearchParams] = useSearchParams();
  // Deep links like /creator?edit=<slug> (the public "Edit" buttons on
  // listing cards and detail pages link here) resolve by derivation — the
  // URL is the single source of truth. All URL writes happen in event
  // handlers (Edit click, save/cancel), so no sync effect is needed.
  const editSlug = searchParams.get("edit");
  const editing = posts?.find((p) => p.slug === editSlug) ?? null;

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
          {editing ? "Edit a property" : "Publish a property"}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {editing
            ? "Update the details below — the property's web address stays the same."
            : "Everything you publish appears instantly in the public catalog. Pricing stays internal — customers message the team for it."}
        </p>
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <PropertyForm
          key={editing?._id ?? "new"}
          initial={editing ?? undefined}
          onDone={() => setSearchParams({}, { replace: true })}
        />
        <PostManager
          editingId={editing?._id ?? null}
          onEdit={(post) => setSearchParams({ edit: post.slug }, { replace: true })}
        />
      </div>

      <SocialsCard />
    </main>
  );
}

/* ============ Access gate (creator email only) ============ */

function AccessGate({ signedIn }: { signedIn: boolean }) {
  const ensureCreator = useMutation(api.creator.ensureCreatorForEmail);

  // Signing in with the designated creator email auto-grants access on mount.
  useEffect(() => {
    if (!signedIn) return;
    void ensureCreator().catch(() => undefined);
  }, [signedIn, ensureCreator]);

  return (
    <div className="clay-card clay-md px-8 py-10 text-center">
      <span className="clay-icon clay-sheen mx-auto size-14 bg-primary text-primary-foreground">
        <LockKeyhole className="size-6" />
      </span>
      <h1 className="font-display mt-4 text-2xl">Creator access</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {signedIn
          ? "This account doesn't have creator access. Only the Ask Real Estate team account can publish and edit posts."
          : "Sign in with the team account to publish and edit property posts."}
      </p>

      {!signedIn && (
        <div className="mt-6">
          <EmailPasswordForm onSignedIn={() => undefined} />
        </div>
      )}
    </div>
  );
}

/* ============ Email + password sign-in ============ */

function EmailPasswordForm({ onSignedIn }: { onSignedIn: () => void }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signIn("password", { email, password, flow: "signIn" });
      onSignedIn();
    } catch {
      setError("Couldn't sign in with those details.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 text-left">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Team email"
        required
        autoComplete="email"
        className="clay-input h-11 shadow-none"
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        minLength={8}
        autoComplete="current-password"
        className="clay-input h-11 shadow-none"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="submit"
        disabled={submitting}
        className="clay-btn clay-btn-primary h-11 rounded-full"
      >
        {submitting ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
        Sign in
      </Button>
    </form>
  );
}

/* ============ Publish / edit form ============ */

type Pending = { storageId?: Id<"_storage">; url: string; name: string };

function PropertyForm({
  initial,
  onDone,
}: {
  initial?: CreatorPost;
  onDone: () => void;
}) {
  const isEdit = initial !== undefined;
  const areaOptions = useQuery(api.listings.areas);
  const generateUploadUrl = useMutation(api.creator.generatePhotoUploadUrl);
  const createPost = useMutation(api.creator.createPost);
  const editPost = useMutation(api.creator.editPost);

  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>(
    initial?.photos.map((p) => ({ storageId: p.storageId, url: p.url, name: "" })) ?? [],
  );
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [purpose, setPurpose] = useState<"primary" | "resale" | "rent">(
    initial?.purpose ?? "primary",
  );
  const [type, setType] = useState(initial?.type ?? "apartment");
  const [area, setArea] = useState(initial?.area ?? "");
  const [bedrooms, setBedrooms] = useState(String(initial?.bedrooms ?? 2));
  const [bathrooms, setBathrooms] = useState(String(initial?.bathrooms ?? 1));
  const [areaSqm, setAreaSqm] = useState(initial ? String(initial.areaSqm) : "");
  const [amenities, setAmenities] = useState(initial?.amenities.join(", ") ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [deliveryTime, setDeliveryTime] = useState(initial?.deliveryTime ?? "");
  const [finish, setFinish] = useState(initial?.finish ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          setError(`"${file.name}" isn't an image — skipped.`);
          continue;
        }
        if (file.size > MAX_PHOTO_BYTES) {
          setError(
            `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB — photos must be under 8 MB.`,
          );
          continue;
        }
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok) {
          throw new Error(`Upload failed for "${file.name}".`);
        }
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
    setSaving(true);
    setError(null);
    try {
      const fields = {
        title,
        description,
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
        deliveryTime: (deliveryTime || undefined) as
          | "immediate"
          | "6m"
          | "12m"
          | "2y"
          | "3y"
          | "4y"
          | undefined,
        finish: (finish || undefined) as
          | "core-shell"
          | "semi-finished"
          | "fully-finished"
          | "finished-furnished"
          | undefined,
        photoIds: pending.flatMap((p) => (p.storageId ? [p.storageId] : [])),
      };
      if (initial) {
        await editPost({ id: initial._id as Id<"listings">, ...fields });
        toast.success("Saved", {
          description: "Your changes are live in the catalog.",
        });
      } else {
        await createPost(fields);
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
        setDescription("");
        setPending([]);
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saving failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="clay-card clay-md p-6">
      <h2 className="font-display flex items-center gap-2 text-xl">
        {isEdit ? <Pencil className="size-5 text-primary" /> : <Plus className="size-5 text-primary" />}
        {isEdit ? "Edit post" : "New post"}
      </h2>
      {isEdit && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          Editing “{initial.title}” — its web address stays the same.
        </p>
      )}

      <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
        {/* Photos */}
        <div className="clay-well rounded-[1.25rem] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Photos</p>
            <label className="clay-btn clay-btn-light cursor-pointer rounded-full px-4 py-2 text-xs">
              <ImagePlus className="size-4" />
              {uploading ? "Uploading…" : isEdit ? "Add more photos" : "Add photos"}
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
              {pending.map((p, i) => (
                <div key={`${p.url}-${i}`} className="relative">
                  <img
                    src={p.url}
                    alt={p.name || "Property photo"}
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-semibold">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => setPending((list) => list.filter((x) => x !== p))}
                    className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-card shadow-md"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              {isEdit
                ? "Remove photos you no longer want, or add new ones."
                : "Upload one or more images — the first becomes the cover."}
            </p>
          )}
        </div>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Property title — e.g. Seafront Chalet on the North Coast"
          required
          minLength={4}
          className="clay-input h-11 shadow-none"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          placeholder="Describe the property — light, layout, the street, what makes it special."
          className="clay-input resize-none shadow-none"
        />

        <div className="clay-well flex w-fit flex-wrap items-center gap-1 rounded-full p-1.5">
          {(["primary", "resale", "rent"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPurpose(p)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                purpose === p ? "bg-card clay-sm" : "text-muted-foreground"
              }`}
            >
              {p === "primary" ? "Primary sale" : p === "resale" ? "Resale" : "For rent"}
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
            placeholder="Area — e.g. New Cairo"
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
          placeholder="Amenities, comma-separated — e.g. Sea view, Elevator"
          className="clay-input h-11 shadow-none"
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            value={deliveryTime || "any-delivery"}
            onValueChange={(v) => setDeliveryTime(v === "any-delivery" ? "" : v)}
          >
            <SelectTrigger className="h-11 rounded-full border-none bg-card px-5 text-sm shadow-none">
              <SelectValue placeholder="Delivery time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any-delivery">Delivery time (optional)</SelectItem>
              {DELIVERY_OPTIONS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={finish || "any-finish"}
            onValueChange={(v) => setFinish(v === "any-finish" ? "" : v)}
          >
            <SelectTrigger className="h-11 rounded-full border-none bg-card px-5 text-sm shadow-none">
              <SelectValue placeholder="Finish" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any-finish">Finish (optional)</SelectItem>
              {FINISH_OPTIONS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={saving || uploading || pending.length === 0}
            className="clay-btn clay-btn-primary h-11 flex-1 rounded-full"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isEdit ? (
              <Pencil className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
            {saving
              ? "Saving…"
              : isEdit
                ? "Save changes"
                : pending.length === 0
                  ? "Add at least one photo"
                  : "Publish post"}
          </Button>
          {isEdit && (
            <Button
              type="button"
              onClick={onDone}
              disabled={saving}
              className="clay-btn clay-btn-light h-11 rounded-full px-5"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </section>
  );
}

/* ============ Post manager ============ */

function PostManager({
  editingId,
  onEdit,
}: {
  editingId: string | null;
  onEdit: (post: CreatorPost) => void;
}) {
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
              className={`clay-well flex items-center gap-3 rounded-2xl p-3 ${
                editingId === post._id ? "ring-2 ring-primary" : ""
              }`}
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
                  {post.area} · {post.type} · {" "}
                  {post.purpose === "rent"
                    ? "Rent"
                    : post.purpose === "primary"
                      ? "Primary"
                      : "Resale"}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => onEdit(post)}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                      editingId === post._id
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Pencil className="mr-1 inline size-3" />
                    Edit
                  </button>
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

/* ============ Connected socials ============ */

function SocialsCard() {
  const current = useQuery(api.siteSettings.getForEdit);

  return (
    <section className="clay-card clay-md mt-6 p-6">
      <h2 className="font-display flex items-center gap-2 text-xl">
        <Share2 className="size-5 text-primary" />
        Connected socials
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Paste your page links — they appear in the footer and the contact
        section across the website. Leave a field empty to hide it.
      </p>

      {current === undefined ? (
        <Skeleton className="mt-4 h-40 rounded-2xl" />
      ) : (
        <SocialsForm
          key={socialsFormKey(current ?? EMPTY_SOCIALS)}
          initial={current ?? EMPTY_SOCIALS}
        />
      )}
    </section>
  );
}

const EMPTY_SOCIALS = {
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  whatsappNumber: "",
};

/** Fingerprint of the saved values — changes when the server values change, remounting the form so it re-seeds. */
function socialsFormKey(current: {
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  whatsappNumber: string;
}) {
  return JSON.stringify([
    current.facebookUrl,
    current.instagramUrl,
    current.tiktokUrl,
    current.whatsappNumber,
  ]);
}

function SocialsForm({
  initial,
}: {
  initial: {
    facebookUrl: string;
    instagramUrl: string;
    tiktokUrl: string;
    whatsappNumber: string;
  };
}) {
  const saveSocials = useMutation(api.siteSettings.saveSocials);
  const [facebookUrl, setFacebookUrl] = useState(initial.facebookUrl);
  const [instagramUrl, setInstagramUrl] = useState(initial.instagramUrl);
  const [tiktokUrl, setTiktokUrl] = useState(initial.tiktokUrl);
  const [whatsappNumber, setWhatsappNumber] = useState(initial.whatsappNumber);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await saveSocials({ facebookUrl, instagramUrl, tiktokUrl, whatsappNumber });
      toast.success("Socials connected", {
        description: "Your profiles now appear across the website.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saving failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <Facebook className="size-4 text-[#1877F2]" />
                Facebook page
              </span>
              <Input
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/YourPage"
                type="url"
                className="clay-input h-11 shadow-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <Instagram className="size-4 text-[#C13584]" />
                Instagram profile
              </span>
              <Input
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/YourPage"
                type="url"
                className="clay-input h-11 shadow-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <TikTokIcon className="size-4 text-foreground" />
                TikTok profile
              </span>
              <Input
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                placeholder="https://tiktok.com/@YourPage"
                type="url"
                className="clay-input h-11 shadow-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <MessageCircle className="size-4 text-primary" />
                WhatsApp number
              </span>
              <Input
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="0100 953 3599"
                type="tel"
                className="clay-input h-11 shadow-none"
              />
            </label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={saving}
            className="clay-btn clay-btn-primary h-11 w-fit rounded-full px-7"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
            {saving ? "Saving…" : "Save social links"}
          </Button>
        </form>
  );
}
