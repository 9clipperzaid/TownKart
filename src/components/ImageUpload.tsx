import { useRef, useState } from "react";
import { ImagePlus, Trash2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { userErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { compressImageForUpload } from "@/lib/image-compression";

type Bucket =
  | "store-logos"
  | "store-banners"
  | "product-images"
  | "marketplace-banners"
  | "category-images";

export function ImageUpload({
  label,
  bucket,
  value,
  onChange,
}: {
  label: string;
  bucket: Bucket;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function storagePathFromPublicUrl(url: string) {
    try {
      const path = new URL(url).pathname;
      const marker = `/storage/v1/object/public/${bucket}/`;
      const markerIndex = path.indexOf(marker);

      if (markerIndex === -1) return null;

      return decodeURIComponent(path.slice(markerIndex + marker.length));
    } catch {
      return null;
    }
  }

  async function deleteStoredImage(url: string) {
    const path = storagePathFromPublicUrl(url);
    if (!path) return;

    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  }

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file");
      return;
    }
    setUploading(true);
    try {
      const previousUrl = value;
      const compressed = await compressImageForUpload(file);
      const name = compressed.file.name;
      const { error } = await supabase.storage.from(bucket).upload(name, compressed.file, {
        cacheControl: "31536000",
        contentType: "image/webp",
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(name);
      onChange(data.publicUrl);
      if (previousUrl && previousUrl !== data.publicUrl) {
        await deleteStoredImage(previousUrl);
      }
      const sizeKb = (compressed.compressedBytes / 1024).toFixed(1);
      toast.success(`Image uploaded as WebP (${sizeKb} KB)`);
    } catch (e) {
      toast.error(userErrorMessage(e, "Upload failed"));
    } finally {
      setUploading(false);
      setDragging(false);
    }
  }

  async function removeImage() {
    if (!value) return;

    setDeleting(true);
    try {
      await deleteStoredImage(value);
      onChange("");
      toast.success("Image deleted");
    } catch (e) {
      toast.error(userErrorMessage(e, "Delete failed"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        {value && (
          <Button type="button" size="sm" variant="ghost" disabled={deleting} onClick={removeImage}>
            <Trash2 className="h-3.5 w-3.5" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) void upload(file);
        }}
        className={`flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-3 text-center transition ${
          dragging ? "border-primary bg-primary/5" : "border-border bg-background"
        }`}
      >
        {value ? (
          <div className="relative w-full">
            <img src={value} alt={label} className="max-h-40 w-full rounded-lg object-cover" />
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
              <ImagePlus className="h-3.5 w-3.5" />
              Replace image
            </span>
          </div>
        ) : (
          <span className="flex flex-col items-center gap-2 py-6 text-sm text-muted-foreground">
            {uploading ? (
              <X className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <UploadCloud className="h-6 w-6 text-primary" />
            )}
            {uploading ? "Uploading..." : "Upload from gallery or drag & drop"}
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
}
