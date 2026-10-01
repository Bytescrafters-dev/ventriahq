import React, { useState, useEffect } from "react";
import { ProductVariant, VariantPrice } from "@/hooks/useProductVariants";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Store } from "@/types/store";
import { CURRENCIES } from "@/shared/constants/common";

const VariantAccordionItem = ({
  variant,
  index,
  isUnsaved,
  store,
  onUpdate,
}: {
  variant: ProductVariant;
  index: number;
  isUnsaved: boolean;
  store: Store | null;
  onUpdate: (variant: ProductVariant, index: number) => void;
  onDelete: (variantId: string, index: number) => void;
}) => {
  const [editedVariant, setEditedVariant] = useState<ProductVariant>(variant);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditedVariant(variant);
    setHasChanges(false);
  }, [variant]);

  const updateVariant = (field: string, value: unknown) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setEditedVariant((prev) => {
        const parentValue = prev[parent as keyof ProductVariant];
        if (parentValue && typeof parentValue === "object") {
          return {
            ...prev,
            [parent]: {
              ...parentValue,
              [child]: value,
            },
          };
        }
        return prev;
      });
    } else {
      setEditedVariant((prev) => ({ ...prev, [field]: value }));
    }
    setHasChanges(true);
  };

  const addPrice = () => {
    setEditedVariant((prev) => ({
      ...prev,
      prices: [
        ...prev.prices,
        { currency: store?.defaultCurrency ?? "", amount: 0 },
      ],
    }));
    setHasChanges(true);
  };

  const removePrice = (index: number) => {
    setEditedVariant((prev) => ({
      ...prev,
      prices: prev.prices.filter((_, i) => i !== index),
    }));
    setHasChanges(true);
  };

  const updatePrice = (
    index: number,
    field: keyof VariantPrice,
    value: VariantPrice[keyof VariantPrice],
  ) => {
    setEditedVariant((prev) => ({
      ...prev,
      prices: prev.prices.map((price, i) =>
        i === index ? { ...price, [field]: value } : price,
      ),
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(editedVariant, index);
    setHasChanges(false);
  };

  const handleReset = () => {
    setEditedVariant(variant);
    setHasChanges(false);
  };

  const primaryPrice = editedVariant.prices[0];
  const totalStock =
    editedVariant.inventory.quantity + editedVariant.inventory.reserved;
  const hasLowStock =
    editedVariant.inventory.quantity <=
    editedVariant.inventory.lowStockThreshold;

  return (
    <AccordionItem
      value={`variant-${index}`}
      className="border rounded-lg mb-2"
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center w-full mr-4 text-sm">
          <span className="font-mono font-semibold text-gray-900">
            {editedVariant.title}
          </span>
          <span className="text-gray-600">
            {primaryPrice?.currency}{" "}
            {((primaryPrice?.amount || 0) / 100).toFixed(2)}
          </span>
          <span
            className={
              hasLowStock ? "text-red-600 font-medium" : "text-gray-600"
            }
          >
            Stock: {totalStock}
          </span>
          <div className="flex items-center gap-2">
            <Badge
              variant={editedVariant.active ? "default" : "secondary"}
              className="text-xs"
            >
              {editedVariant.active ? "Active" : "Inactive"}
            </Badge>
            {isUnsaved && (
              <Badge
                variant="outline"
                className="text-xs border-orange-500 text-orange-600"
              >
                Not Saved
              </Badge>
            )}
            {hasChanges && (
              <Badge variant="destructive" className="text-xs">
                Unsaved
              </Badge>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {[
              { value: "basic", Label: "Basic Info" },
              { value: "pricing", Label: "Pricing" },
              { value: "physical", Label: "Dimensions" },
              { value: "inventory", Label: "Inventory" },
            ].map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.Label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input
                  value={editedVariant.sku}
                  onChange={(e) => updateVariant("sku", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editedVariant.title || ""}
                  onChange={(e) => updateVariant("title", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Barcode</Label>
                <Input
                  value={editedVariant.barcode || ""}
                  onChange={(e) => updateVariant("barcode", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editedVariant.active.toString()}
                  onValueChange={(value) =>
                    updateVariant("active", value === "true")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Multi-Currency Pricing</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPrice}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Currency
              </Button>
            </div>
            <div className="space-y-3">
              {editedVariant.prices.map((price, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-center p-3 border rounded"
                >
                  <Select
                    value={price.currency}
                    onValueChange={(value) =>
                      updatePrice(index, "currency", value)
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={price.amount / 100}
                    onChange={(e) =>
                      updatePrice(
                        index,
                        "amount",
                        Math.round((parseFloat(e.target.value) || 0) * 100),
                      )
                    }
                    placeholder="0.00"
                    step="0.01"
                    className="flex-1"
                  />
                  {editedVariant.prices.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePrice(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Available Stock</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={editedVariant.inventory.quantity}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label>Reserved Stock</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={editedVariant.inventory.reserved}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label>Low Stock Threshold</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={editedVariant.inventory.lowStockThreshold}
                  onChange={(e) =>
                    updateVariant(
                      "inventory.lowStockThreshold",
                      parseInt(e.target.value) || 0,
                    )
                  }
                />
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">
                Total Stock:{" "}
                {editedVariant.inventory.quantity +
                  editedVariant.inventory.reserved}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="physical" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Weight (g)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={editedVariant.weightGrams || 0}
                  onChange={(e) =>
                    updateVariant("weightGrams", parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Length (cm)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={editedVariant.lengthCm || 0}
                  onChange={(e) =>
                    updateVariant("lengthCm", parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Width (cm)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={editedVariant.widthCm || 0}
                  onChange={(e) =>
                    updateVariant("widthCm", parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={editedVariant.heightCm || 0}
                  onChange={(e) =>
                    updateVariant("heightCm", parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end items-center pt-4 border-t mt-4">
          {/* <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(variant.id || "", index)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isUnsaved ? "Remove" : "Delete"}
          </Button> */}
          <div className="flex gap-2">
            {hasChanges && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
              {isUnsaved ? "Save Variant" : "Save Changes"}
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default VariantAccordionItem;
