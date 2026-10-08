"use client";

import { useQuery } from "@tanstack/react-query";
import { createElement } from "react";
import { getIcon, type LucideIcon } from "@/lib/utils/icon-mapper";
import { Smartphone } from "lucide-react";

interface IconRendererProps {
  library: "lucide" | "heroicons" | "tabler" | "uploaded";
  iconName: string;
  svgContent?: string; // For uploaded icons
  className?: string;
  size?: number;
  fallbackIcon?: LucideIcon;
}

export function IconRenderer({
  library,
  iconName,
  svgContent,
  className = "",
  size = 24,
  fallbackIcon: FallbackIcon,
}: IconRendererProps) {
  const { data: uploadedIcons } = useQuery({
    queryKey: ["uploaded-icons"],
    enabled: library === "uploaded" && !svgContent,
    queryFn: async () => {
      const response = await fetch("/api/icons");
      if (!response.ok) throw new Error("Could not load icons");
      return (await response.json()) as Array<{
        id: string;
        slug: string;
        svg_content: string;
      }>;
    },
  });
  const content =
    svgContent ||
    uploadedIcons?.find(
      (icon) => icon.id === iconName || icon.slug === iconName,
    )?.svg_content;
  if (library === "uploaded" && content) {
    return (
      // SVGs are already isolated inside an image context, with explicit intrinsic dimensions.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt=""
        src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(content)}`}
        className={`inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Handle Lucide icons
  const IconComponent = getIcon(iconName, library);

  if (IconComponent) {
    return createElement(IconComponent, { className, size });
  }

  // Fallback
  return FallbackIcon ? (
    <FallbackIcon className={className} size={size} />
  ) : (
    <Smartphone className={className} size={size} />
  );
}

// Simplified version for features/cards that only uses Lucide
interface SimpleIconProps {
  name: string;
  className?: string;
  size?: number;
}

export function SimpleIcon({
  name,
  className = "",
  size = 24,
}: SimpleIconProps) {
  const Icon = getIcon(name, "lucide");
  if (Icon) {
    return createElement(Icon, { className, size });
  }
  return <Smartphone className={className} size={size} />;
}
