import { describe, expect, test } from "bun:test";

// Test the pagination logic extracted from the component
// We can't easily test React components with Bun, so we test the core logic

/**
 * Replicated pagination logic from Pagination.tsx
 * This is the getPageNumbers function extracted for testing
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
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
}

describe("getPageNumbers", () => {
  describe("small page counts (no ellipsis)", () => {
    test("single page", () => {
      expect(getPageNumbers(1, 1)).toEqual([1]);
    });

    test("two pages", () => {
      expect(getPageNumbers(1, 2)).toEqual([1, 2]);
    });

    test("three pages", () => {
      expect(getPageNumbers(2, 3)).toEqual([1, 2, 3]);
    });

    test("seven pages (threshold)", () => {
      expect(getPageNumbers(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });
  });

  describe("large page counts with ellipsis", () => {
    test("8 pages, current at start", () => {
      const result = getPageNumbers(1, 8);
      expect(result).toEqual([1, 2, "ellipsis", 8]);
    });

    test("8 pages, current at page 2", () => {
      const result = getPageNumbers(2, 8);
      expect(result).toEqual([1, 2, 3, "ellipsis", 8]);
    });

    test("8 pages, current at page 3", () => {
      const result = getPageNumbers(3, 8);
      expect(result).toEqual([1, 2, 3, 4, "ellipsis", 8]);
    });

    test("8 pages, current in middle (page 4)", () => {
      const result = getPageNumbers(4, 8);
      expect(result).toEqual([1, "ellipsis", 3, 4, 5, "ellipsis", 8]);
    });

    test("8 pages, current at page 5", () => {
      const result = getPageNumbers(5, 8);
      expect(result).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 8]);
    });

    test("8 pages, current at page 6", () => {
      const result = getPageNumbers(6, 8);
      expect(result).toEqual([1, "ellipsis", 5, 6, 7, 8]);
    });

    test("8 pages, current at page 7", () => {
      const result = getPageNumbers(7, 8);
      expect(result).toEqual([1, "ellipsis", 6, 7, 8]);
    });

    test("8 pages, current at end", () => {
      const result = getPageNumbers(8, 8);
      expect(result).toEqual([1, "ellipsis", 7, 8]);
    });
  });

  describe("larger page counts", () => {
    test("20 pages, current at page 1", () => {
      const result = getPageNumbers(1, 20);
      expect(result).toEqual([1, 2, "ellipsis", 20]);
    });

    test("20 pages, current at page 10", () => {
      const result = getPageNumbers(10, 20);
      expect(result).toEqual([1, "ellipsis", 9, 10, 11, "ellipsis", 20]);
    });

    test("20 pages, current at page 20", () => {
      const result = getPageNumbers(20, 20);
      expect(result).toEqual([1, "ellipsis", 19, 20]);
    });

    test("100 pages, current at page 50", () => {
      const result = getPageNumbers(50, 100);
      expect(result).toEqual([1, "ellipsis", 49, 50, 51, "ellipsis", 100]);
    });
  });

  describe("edge cases for ellipsis boundaries", () => {
    test("page 3 on 10 pages shows no leading ellipsis", () => {
      const result = getPageNumbers(3, 10);
      // Result should be [1, 2, 3, 4, "ellipsis", 10]
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(2); // no leading ellipsis - shows page 2 instead
      expect(result.filter(p => p === "ellipsis").length).toBe(1); // trailing ellipsis only
    });

    test("page 4 on 10 pages shows leading ellipsis", () => {
      const result = getPageNumbers(4, 10);
      expect(result[1]).toBe("ellipsis"); // leading ellipsis
    });

    test("second to last page shows no trailing ellipsis", () => {
      const result = getPageNumbers(8, 10);
      // Should be [1, "ellipsis", 7, 8, 9, 10]
      const lastEllipsisIndex = result.lastIndexOf("ellipsis");
      expect(lastEllipsisIndex).toBe(1); // only leading ellipsis
    });

    test("third from last page shows no trailing ellipsis", () => {
      const result = getPageNumbers(8, 10);
      // currentPage (8) < totalPages - 2 (8) is false, so no trailing ellipsis
      const trailingEllipsis = result.slice(-2).includes("ellipsis");
      expect(trailingEllipsis).toBe(false);
    });
  });

  describe("always includes first and last page", () => {
    test("first page is always 1", () => {
      expect(getPageNumbers(5, 10)[0]).toBe(1);
      expect(getPageNumbers(1, 10)[0]).toBe(1);
      expect(getPageNumbers(10, 10)[0]).toBe(1);
    });

    test("last page is always totalPages", () => {
      const result10 = getPageNumbers(5, 10);
      expect(result10[result10.length - 1]).toBe(10);

      const result20 = getPageNumbers(10, 20);
      expect(result20[result20.length - 1]).toBe(20);
    });
  });

  describe("current page neighborhood", () => {
    test("includes currentPage - 1", () => {
      const result = getPageNumbers(10, 20);
      expect(result).toContain(9);
    });

    test("includes currentPage", () => {
      const result = getPageNumbers(10, 20);
      expect(result).toContain(10);
    });

    test("includes currentPage + 1", () => {
      const result = getPageNumbers(10, 20);
      expect(result).toContain(11);
    });
  });
});

describe("pagination visibility", () => {
  test("should not render for single page (return empty behavior)", () => {
    // In the actual component, totalPages <= 1 returns null
    // Here we test that our logic handles it correctly
    const pages = getPageNumbers(1, 1);
    expect(pages.length).toBe(1);
  });

  test("returns valid array for zero pages edge case", () => {
    const pages = getPageNumbers(1, 0);
    expect(pages).toEqual([]);
  });
});
