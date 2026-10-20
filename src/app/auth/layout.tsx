import Link from "next/link";
import {
  Layers3,
  ArrowUpRight,
  Package,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-[#10262c] p-12 text-white lg:flex xl:p-16">
        <Link
          href="/"
          className="flex items-center gap-3 text-2xl font-bold tracking-tight"
        >
          <Layers3 className="h-8 w-8 text-lime-300" />
          mekfidel.
        </Link>
        <div className="my-20 max-w-lg">
          <p className="eyebrow text-lime-300">THE BUSINESS WORKSPACE</p>
          <h2 className="mt-6 text-5xl font-semibold leading-tight tracking-[-0.045em]">
            More clarity.
            <br />
            Better control.
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-7 text-slate-300">
            Manage your catalogue, confirm orders and keep your storefront up to
            date. Everything your team needs, together.
          </p>
          <div className="mt-10 space-y-5">
            {[
              { icon: Package, label: "Inventory and orders" },
              { icon: LayoutDashboard, label: "Content and storefront" },
              { icon: ShieldCheck, label: "Access based on your team role" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 text-sm text-slate-300"
              >
                <Icon className="h-4 w-4 text-lime-300" />
                {label}
              </div>
            ))}
          </div>
        </div>
        <Link
          href="/"
          className="flex w-fit items-center gap-3 text-xs text-slate-300"
        >
          Back to the storefront
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </aside>
      <div>{children}</div>
    </div>
  );
}
