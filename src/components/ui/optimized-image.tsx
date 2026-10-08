import Image, { type ImageProps } from "next/image";
// Optimise trusted storage images; preserve externally hosted CMS assets without proxying arbitrary hosts.
export function OptimizedImage({
  width = 800,
  height = 800,
  alt,
  src,
  unoptimized,
  ...props
}: ImageProps) {
  const url = typeof src === "string" ? src : "";
  const trusted = /^https:\/\/[^/]+\.supabase\.(co|in)\//.test(url);
  return (
    <Image
      alt={alt}
      width={width}
      height={height}
      src={src}
      unoptimized={unoptimized ?? (!trusted && !url.startsWith("/"))}
      {...props}
    />
  );
}
