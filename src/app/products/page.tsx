import { Suspense } from "react";
import ProductsClient from "./products-client";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading products...</div>}>
      <ProductsClient />
    </Suspense>
  );
}
