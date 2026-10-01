"use client";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, X } from "lucide-react";
import { useDebounce } from "use-debounce";
import { useSeachProducts } from "@/hooks/useProducts";
import { productSearchVariant, ProductsSearch } from "@/types/product";

interface Props {
  lines: string[];
  onAddLine: (sku: string) => void;
}

export const ProductSearch = ({ lines, onAddLine }: Props) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductsSearch | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useSeachProducts(debouncedSearch);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (product: ProductsSearch) => {
    setSelectedProduct(product);
    setSearch(product.title);
    setShowDropdown(false);
  };

  const handleClearProduct = () => {
    setSelectedProduct(null);
    setSearch("");
  };

  const handleAddLine = (variant: productSearchVariant) => {
    if (!selectedProduct || !variant.id) return;

    onAddLine(variant.sku);
  };

  const isAlreadyAdded = (sku: string) => lines.some((l) => l === sku);

  const variants = selectedProduct?.variants ?? [];

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products to add..."
            className="pl-9 pr-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowDropdown(true);
              if (!e.target.value) {
                setSelectedProduct(null);
              }
            }}
            onFocus={() => {
              if (search) setShowDropdown(true);
            }}
          />
          {search && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={handleClearProduct}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {showDropdown && search && !selectedProduct && (
          <div className="absolute top-full mt-1 left-0 right-0 z-10 bg-background border rounded-md shadow-md overflow-hidden">
            {isLoading ? (
              <div className="p-3 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="p-3 text-sm text-destructive">
                Failed to load products
              </div>
            ) : data?.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">
                No products found
              </div>
            ) : (
              data?.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className="w-full text-left px-3 py-2.5 hover:bg-muted text-sm transition-colors border-b last:border-0"
                  onMouseDown={() => handleSelectProduct(product)}
                >
                  <span className="font-medium">{product.title}</span>
                  <span className="text-muted-foreground ml-2 text-xs">
                    {product._count?.variants ?? 0} variants
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {selectedProduct && (
        <div className="border rounded-md overflow-hidden">
          <div className="bg-muted/50 px-4 py-2.5 flex items-center justify-between">
            <span className="text-sm font-medium">{selectedProduct.title}</span>
          </div>

          {variants.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground text-center">
              No variants available for this product
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-2 font-medium text-muted-foreground">
                      Variant
                    </th>
                    <th className="px-4 py-2 font-medium text-muted-foreground">
                      SKU
                    </th>
                    <th className="px-4 py-2 font-medium text-muted-foreground">
                      Stock
                    </th>
                    <th className="px-4 py-2 w-24" />
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant) => {
                    if (!variant.id) return null;
                    const added = isAlreadyAdded(variant.id);
                    const displayTitle = variant.title;

                    return (
                      <tr
                        key={variant.id}
                        className={`border-b last:border-0 ${added ? "bg-muted/20" : ""}`}
                      >
                        <td className="px-4 py-2.5">
                          <span>{displayTitle}</span>
                          {added && (
                            <Badge
                              variant="secondary"
                              className="ml-2 text-xs py-0"
                            >
                              Added
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">
                          {variant.sku}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge
                            variant={
                              variant.inventory.quantity === 0
                                ? "destructive"
                                : variant.inventory.quantity < 5
                                  ? "outline"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {variant.inventory.quantity}
                          </Badge>
                        </td>

                        <td className="px-4 py-2.5">
                          <Button
                            type="button"
                            size="sm"
                            variant={added ? "outline" : "default"}
                            className="h-8"
                            onClick={() => handleAddLine(variant)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {added ? "Update" : "Add"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
