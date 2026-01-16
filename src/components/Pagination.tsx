import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsisThreshold = 7;

    if (totalPages <= showEllipsisThreshold) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="gap-2 px-4 hover:shadow-[0_0_15px_rgba(234,179,8,0.5)] hover:border-yellow-500/50 active:shadow-[0_0_20px_rgba(234,179,8,0.7)] transition-all duration-200"
      >
        <ChevronLeft className="w-5 h-5" />
        Previous
      </Button>

      {pages.map((pageNum, idx) =>
        pageNum === "ellipsis" ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
        ) : (
          <Button
            key={pageNum}
            variant={pageNum === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(pageNum)}
            className="min-w-[2.5rem] hover:shadow-[0_0_15px_rgba(234,179,8,0.5)] hover:border-yellow-500/50 active:shadow-[0_0_20px_rgba(234,179,8,0.7)] transition-all duration-200"
          >
            {pageNum}
          </Button>
        )
      )}

      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="gap-2 px-4 hover:shadow-[0_0_15px_rgba(234,179,8,0.5)] hover:border-yellow-500/50 active:shadow-[0_0_20px_rgba(234,179,8,0.7)] transition-all duration-200"
      >
        Next
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
