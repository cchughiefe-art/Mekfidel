import { createClient } from '@/lib/supabase/client';

const BUCKETS = ['logos', 'products', 'banners', 'gallery', 'blog', 'icons', 'uploads'] as const;
export type StorageBucket = typeof BUCKETS[number];

export function getStorageUrl(bucket: StorageBucket, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export function getPublicUrl(bucket: StorageBucket, path: string): string {
  if (!path) return '';
  return getStorageUrl(bucket, path);
}

export async function uploadFile(
  bucket: StorageBucket,
  file: File,
  folder?: string
): Promise<{ url: string; path: string } | null> {
  try {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { url: publicUrl, path: filePath };
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

export async function deleteFile(
  bucket: StorageBucket,
  path: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

export async function listFiles(
  bucket: StorageBucket,
  folder?: string
): Promise<{ name: string; url: string }[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder || '', {
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) throw error;

    return (data || []).map(file => ({
      name: file.name,
      url: getPublicUrl(bucket, folder ? `${folder}/${file.name}` : file.name),
    }));
  } catch (error) {
    console.error('List error:', error);
    return [];
  }
}

export async function uploadCompressedImage(
  bucket: StorageBucket,
  file: File,
  maxWidth = 1920,
  quality = 0.8
): Promise<{ url: string; path: string } | null> {
  try {
    const compressed = await compressImage(file, maxWidth, quality);
    return await uploadFile(bucket, compressed);
  } catch (error) {
    console.error('Compressed upload error:', error);
    return null;
  }
}

function compressImage(file: File, maxWidth: number, quality: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/webp',
          quality
        );
      };
    };
    reader.onerror = reject;
  });
}

