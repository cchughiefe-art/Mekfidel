import { createClient } from "@/lib/supabase/client";

export const BUCKETS = [
  "logos",
  "products",
  "banners",
  "gallery",
  "blog",
  "icons",
  "uploads",
] as const;
export type StorageBucket = (typeof BUCKETS)[number];

export function getStorageUrl(bucket: StorageBucket, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export function getPublicUrl(bucket: StorageBucket, path: string): string {
  if (!path) return "";
  return getStorageUrl(bucket, path);
}

export async function uploadFile(
  bucket: StorageBucket,
  file: File,
  folder?: string,
): Promise<{ url: string; path: string } | null> {
  if (file.size > 10 * 1024 * 1024)
    throw new Error("Choose a file smaller than 10 MB");
  if (
    ["image/png", "image/jpeg", "image/webp"].includes(file.type) &&
    file.size > 300 * 1024
  )
    file = await compressImage(file, 1920, 0.8);
  const form = new FormData();
  form.set("file", file);
  form.set("bucket", bucket);
  if (folder) form.set("folder", folder);
  const response = await fetch("/api/upload", { method: "POST", body: form });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Upload failed");
  return { url: result.url, path: result.path };
}

export async function deleteFile(
  bucket: StorageBucket,
  path: string,
): Promise<boolean> {
  const response = await fetch("/api/upload", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bucket, path }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "File deletion failed");
  return true;
}

export async function listFiles(
  bucket: StorageBucket,
  folder?: string,
): Promise<{ name: string; url: string }[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder || "", {
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) throw error;

    return (data || []).map((file) => ({
      name: file.name,
      url: getPublicUrl(bucket, folder ? `${folder}/${file.name}` : file.name),
    }));
  } catch (error) {
    console.error("List error:", error);
    throw error instanceof Error ? error : new Error("Could not load files");
  }
}

export async function uploadCompressedImage(
  bucket: StorageBucket,
  file: File,
  maxWidth = 1920,
  quality = 0.8,
): Promise<{ url: string; path: string } | null> {
  try {
    const compressed = await compressImage(file, maxWidth, quality);
    return await uploadFile(bucket, compressed);
  } catch (error) {
    console.error("Compressed upload error:", error);
    throw error instanceof Error ? error : new Error("Upload failed");
  }
}

function compressImage(
  file: File,
  maxWidth: number,
  quality: number,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not decode the image"));
      if (!e.target?.result) {
        reject(new Error("Could not read the image"));
        return;
      }
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Image processing is unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, "") + ".webp",
                {
                  type: "image/webp",
                  lastModified: Date.now(),
                },
              );
              resolve(compressedFile);
            } else {
              reject(new Error("Compression failed"));
            }
          },
          "image/webp",
          quality,
        );
      };
    };
    reader.onerror = reject;
  });
}
