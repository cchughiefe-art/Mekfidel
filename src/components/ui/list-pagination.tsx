"use client";
export function ListPagination({
  page,
  onPage,
  hasNext,
  loading,
}: {
  page: number;
  onPage: (page: number) => void;
  hasNext: boolean;
  loading?: boolean;
}) {
  return (
    <nav
      aria-label="List pages"
      className="flex flex-wrap items-center justify-center gap-4 py-4"
    >
      <button
        type="button"
        className="rounded-lg border bg-white px-4 py-2 disabled:opacity-40"
        disabled={page <= 1 || loading}
        onClick={() => onPage(page - 1)}
      >
        Previous
      </button>
      <span>Page {page}</span>
      <button
        type="button"
        className="rounded-lg border bg-white px-4 py-2 disabled:opacity-40"
        disabled={!hasNext || loading}
        onClick={() => onPage(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
