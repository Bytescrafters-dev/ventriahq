"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

export const StaffFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Keep a ref to the latest searchParams to avoid stale closure in effects
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const [debouncedSearch] = useDebounce(searchInput, 300);
  const isFirstRender = useRef(true);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    // Reset to page 1 on any filter change
    if (!("page" in updates)) params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Sync debounced search to URL (skip initial render to avoid overwriting URL on mount)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    updateParams({ q: debouncedSearch || null });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or phone..."
          className="pl-9 pr-9"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        {searchInput && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setSearchInput("")}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
