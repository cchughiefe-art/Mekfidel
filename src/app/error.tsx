"use client";
import Link from "next/link";
export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div role="alert" className="container-custom py-20 text-center">
      <h1 className="text-2xl font-bold">This page could not be loaded</h1>
      <p className="mt-3 text-gray-600">
        Please try again. If it keeps happening, contact the shop.
      </p>
      <div className="mt-6 flex justify-center gap-4">
        <button onClick={() => retry()} className="btn-primary">
          Try again
        </button>
        <Link href="/contact" className="btn-outline">
          Contact us
        </Link>
      </div>
    </div>
  );
}
