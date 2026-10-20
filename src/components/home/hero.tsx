import Link from "next/link";
import {
  ArrowUpRight,
  ScanLine,
  Wrench,
  Layers3,
  ArrowRight,
  Check,
} from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { safeUrl } from "@/lib/utils/safe-content";

type HeroProps = {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  buttonText?: string;
  buttonUrl?: string;
};
export function HeroSection({
  title,
  subtitle,
  description,
  image,
  buttonText,
  buttonUrl,
}: HeroProps = {}) {
  return (
    <section className="store-hero">
      <div className="container-custom py-12 sm:py-16 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div className="relative z-10">
            <p className="eyebrow mb-6 text-lime-300">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-300" /> THE
              REPAIR SUPPLY DESK
            </p>
            <h1 className="max-w-2xl text-[2.75rem] font-semibold leading-[1.06] tracking-[-0.055em] text-white sm:text-6xl xl:text-7xl">
              {title || (
                <>
                  Better parts.
                  <br />
                  Better <span className="text-lime-300">repairs.</span>
                </>
              )}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
              {description ||
                subtitle ||
                "Replacement screens, specialist tools and spare parts. Find what fits, build your order, and confirm the details with our team."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={safeUrl(buttonUrl || "/products")}
                className="inline-flex items-center gap-5 rounded-xl bg-lime-300 px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-lime-200"
              >
                {buttonText || "Explore the catalogue"}
                <ArrowUpRight className="h-5 w-5" />
              </Link>
              <Link
                href="/phone-screen-compatibility"
                className="inline-flex items-center gap-3 rounded-xl border border-white/20 px-5 py-3.5 text-sm font-medium text-white hover:bg-white/10"
              >
                <ScanLine className="h-5 w-5" />
                Find a screen match
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-300">
              {[
                "Model compatibility help",
                "Staff-confirmed orders",
                "Prices in naira",
              ].map((text) => (
                <span key={text} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-lime-300" />
                  {text}
                </span>
              ))}
            </div>
          </div>
          <div className="hero-display relative min-h-[350px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] sm:min-h-[420px]">
            <div className="absolute left-6 top-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />
              Parts. Precision. Possibility.
            </div>
            {image ? (
              <OptimizedImage
                src={safeUrl(image, "")}
                alt={title || "Repair tools and replacement parts"}
                loading="eager"
                className="absolute inset-0 h-full w-full object-contain p-12"
              />
            ) : (
              <div aria-hidden="true" className="parts-art">
                <div className="parts-plate plate-back" />
                <div className="parts-plate plate-middle">
                  <div className="board-chip" />
                  <span className="board-track" />
                </div>
                <div className="parts-plate plate-screen">
                  <div className="screen-island" />
                  <div className="screen-orbit" />
                  <span className="screen-word">
                    MAKE IT
                    <br />
                    WORK.
                  </span>
                  <span className="screen-small">MEKFIDEL / PARTS & TOOLS</span>
                </div>
                <div className="tool-driver" />
              </div>
            )}
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/80 p-4 backdrop-blur">
              <div>
                <p className="text-sm font-semibold text-white">
                  The right part starts here.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Check your model before you order.
                </p>
              </div>
              <ScanLine className="h-7 w-7 text-lime-300" />
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 bg-white/[0.025]">
        <div className="container-custom grid divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            {
              icon: Layers3,
              title: "Replacement screens",
              text: "Find your next screen assembly",
              url: "/products",
            },
            {
              icon: Wrench,
              title: "Tools for your workbench",
              text: "Equip your next repair",
              url: "/products",
            },
            {
              icon: ScanLine,
              title: "Check before you buy",
              text: "Explore model compatibility",
              url: "/phone-screen-compatibility",
            },
          ].map(({ icon: Icon, ...item }) => (
            <Link
              key={item.title}
              href={item.url}
              className="group flex items-center gap-4 px-2 py-5 sm:px-6"
            >
              <Icon className="h-6 w-6 shrink-0 text-lime-300" />
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs text-slate-400">{item.text}</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
