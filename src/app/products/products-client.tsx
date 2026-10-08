"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchTerm } from "@/lib/utils/safe-content";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/ui/product-card";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useCart } from "@/providers/cart-provider";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import type { Product, Category, Brand } from "@/types";

export default function ProductsClient() {
  const params = useSearchParams();
  return <ProductsCatalog key={params.toString()} />;
}

function ProductsCatalog() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [page, setPage] = useState(1);
  const pageSize = 24;
  const [selectedBrand, setSelectedBrand] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error: queryError1 } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (queryError1) throw queryError1;
      return data as Category[];
    },
  });

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data, error: queryError2 } = await supabase
        .from("brands")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (queryError2) throw queryError2;
      return data as Brand[];
    },
  });

  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "products",
      selectedCategory,
      selectedBrand,
      sortBy,
      searchQuery,
      page,
    ],
    enabled: !selectedCategory || Boolean(categories),
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(
          `
          *,
          category:categories(*),
          brand:brands(*)
        `,
        )
        .eq("is_active", true);

      if (selectedCategory) {
        const category = categories?.find(
          (category) =>
            category.id === selectedCategory ||
            category.slug === selectedCategory,
        );
        if (!category) return [];
        query = query.eq("category_id", category.id);
      }
      if (selectedBrand) {
        query = query.eq("brand_id", selectedBrand);
      }
      if (searchQuery) {
        query = query.ilike("name", `%${searchTerm(searchQuery)}%`);
      }

      switch (sortBy) {
        case "price_asc":
          query = query.order("price", { ascending: true });
          break;
        case "price_desc":
          query = query.order("price", { ascending: false });
          break;
        case "name":
          query = query.order("name", { ascending: true });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query
        .order("id")
        .range((page - 1) * pageSize, page * pageSize - 1);
      if (error) throw error;
      return data as Product[];
    },
  });

  const handleAddToCart = (product: Product) => {
    if (
      product.availability === "out_of_stock" ||
      (product.availability !== "pre_order" && product.stock === 0)
    ) {
      toast.error(`${product.name} is out of stock`);
      return;
    }
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const clearFilters = () => {
    setPage(1);
    setSelectedCategory("");
    setSelectedBrand("");
    setSearchQuery("");
    setSortBy("newest");
  };

  const hasActiveFilters =
    selectedCategory || selectedBrand || searchQuery || sortBy !== "newest";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Products
          </h1>
          <p className="text-gray-500 mt-2">
            Browse repair tools, replacement screens, and spare parts.
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              aria-label="Search products"
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search products..."
              className="input-field pl-12"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={sortBy}
              aria-label="Sort products"
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="input-field w-auto"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
            <button
              aria-label="Toggle product filters"
              aria-expanded={showFilters}
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-outline px-4 ${showFilters ? "bg-blue-600 text-white" : ""}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-full flex-shrink-0 space-y-6 rounded-xl border bg-white p-4 md:w-64">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
                <div className="space-y-2">
                  {categories?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => (
                        setSelectedCategory(
                          selectedCategory === cat.id ? "" : cat.id,
                        ),
                        setPage(1)
                      )}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat.id
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Brand</h3>
                <div className="space-y-2">
                  {brands?.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => (
                        setSelectedBrand(
                          selectedBrand === brand.id ? "" : brand.id,
                        ),
                        setPage(1)
                      )}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedBrand === brand.id
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-ghost text-sm flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <ErrorState onRetry={refetch} />
            ) : !products || products.length === 0 ? (
              <EmptyState
                icon={<Smartphone className="w-10 h-10 text-gray-400" />}
                title="No products found"
                description={
                  searchQuery
                    ? `No results for "${searchQuery}"`
                    : "Products will appear here once added."
                }
                action={
                  hasActiveFilters ? (
                    <button onClick={clearFilters} className="btn-outline">
                      Clear Filters
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  {products.length} product{products.length !== 1 ? "s" : ""}{" "}
                  found
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <nav
          aria-label="Product pages"
          className="mt-8 flex items-center justify-center gap-4"
        >
          <button
            disabled={page === 1}
            onClick={() => setPage((value) => value - 1)}
            className="btn-outline disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm">Page {page}</span>
          <button
            disabled={(products?.length || 0) < pageSize}
            onClick={() => setPage((value) => value + 1)}
            className="btn-outline disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  );
}
