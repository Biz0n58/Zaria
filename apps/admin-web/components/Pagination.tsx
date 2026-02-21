import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: Props) {
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set("page", page.toString());
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex gap-2">
        {currentPage > 1 ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
          >
            <ChevronLeft size={16} />
            Previous
          </Link>
        ) : (
          <span className="px-3 py-2 border border-gray-200 rounded-md text-gray-400 flex items-center gap-1 cursor-not-allowed">
            <ChevronLeft size={16} />
            Previous
          </span>
        )}

        {currentPage < totalPages ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
          >
            Next
            <ChevronRight size={16} />
          </Link>
        ) : (
          <span className="px-3 py-2 border border-gray-200 rounded-md text-gray-400 flex items-center gap-1 cursor-not-allowed">
            Next
            <ChevronRight size={16} />
          </span>
        )}
      </div>
    </div>
  );
}
