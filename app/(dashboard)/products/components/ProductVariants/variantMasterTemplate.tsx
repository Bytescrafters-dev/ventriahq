import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VariantMasterTemplate } from "@/types/product";
import { Separator } from "@/components/ui/separator";
import { ProductOption } from "@/hooks/useProductOptions";
import { ProductVariant, VariantPrice } from "@/hooks/useProductVariants";
import { CURRENCIES } from "@/shared/constants/common";

type Props = {
  setMasterTemplate: React.Dispatch<
    React.SetStateAction<VariantMasterTemplate>
  >;
  masterTemplate: VariantMasterTemplate;
  addPriceToTemplate: () => void;
  updateTemplatePrice: (
    index: number,
    field: keyof VariantPrice,
    value: VariantPrice[keyof VariantPrice],
  ) => void;
  removePriceFromTemplate: (index: number) => void;
  generateVariantsFromOptions: () => void;
  options: ProductOption[];
  generatedVariants: ProductVariant[];
  copyTemplateToAll: () => void;
  handleCreateVariants: () => Promise<void>;
  isCreating: boolean;
};

const VariantMasterTemplateCard = ({
  setMasterTemplate,
  masterTemplate,
  addPriceToTemplate,
  updateTemplatePrice,
  removePriceFromTemplate,
  generateVariantsFromOptions,
  generatedVariants,
  copyTemplateToAll,
  handleCreateVariants,
  isCreating,
}: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Product Variants</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enhanced Master Template */}
        <div className="space-y-4">
          <h4 className="font-medium">Enhanced Master Template</h4>

          {/* Basic Patterns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>SKU Pattern</Label>
              <Input
                value={masterTemplate.skuPattern}
                onChange={(e) =>
                  setMasterTemplate((prev) => ({
                    ...prev,
                    skuPattern: e.target.value,
                  }))
                }
                placeholder="PROD"
              />
            </div>
            <div className="space-y-2">
              <Label>Title Pattern</Label>
              <Input
                value={masterTemplate.titlePattern}
                onChange={(e) =>
                  setMasterTemplate((prev) => ({
                    ...prev,
                    titlePattern: e.target.value,
                  }))
                }
                placeholder="{SIZE} {COLOR} Product"
              />
            </div>
            <div className="space-y-2">
              <Label>Barcode Pattern</Label>
              <Input
                value={masterTemplate.barcodePattern}
                onChange={(e) =>
                  setMasterTemplate((prev) => ({
                    ...prev,
                    barcodePattern: e.target.value,
                  }))
                }
                placeholder="123456{HASH}"
              />
            </div>
          </div>

          {/* Multi-Currency Pricing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Default Pricing</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPriceToTemplate}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Currency
              </Button>
            </div>
            <div className="space-y-2">
              {masterTemplate.prices.map((price, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Select
                    value={price.currency}
                    onValueChange={(value) =>
                      updateTemplatePrice(index, "currency", value)
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
                      updateTemplatePrice(
                        index,
                        "amount",
                        Math.round((parseFloat(e.target.value) || 0) * 100),
                      )
                    }
                    placeholder="0.00"
                    className="flex-1"
                  />
                  {masterTemplate.prices.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePriceFromTemplate(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Physical Properties */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Weight (g)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={masterTemplate.weightGrams}
                onChange={(e) =>
                  setMasterTemplate((prev) => ({
                    ...prev,
                    weightGrams: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Length (cm)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={masterTemplate.lengthCm}
                onChange={(e) =>
                  setMasterTemplate((prev) => ({
                    ...prev,
                    lengthCm: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Width (cm)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={masterTemplate.widthCm}
                onChange={(e) =>
                  setMasterTemplate((prev) => ({
                    ...prev,
                    widthCm: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={masterTemplate.heightCm}
                onChange={(e) =>
                  setMasterTemplate((prev) => ({
                    ...prev,
                    heightCm: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>

          {/* Inventory Defaults */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Default Stock</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={masterTemplate.inventory.quantity}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label>Reserved Stock</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={masterTemplate.inventory.reserved}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label>Low Stock Threshold</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={masterTemplate.inventory.lowStockThreshold}
                onChange={(e) =>
                  setMasterTemplate((prev) => ({
                    ...prev,
                    inventory: {
                      ...prev.inventory,
                      lowStockThreshold: parseInt(e.target.value) || 0,
                    },
                  }))
                }
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex gap-4">
          <Button onClick={generateVariantsFromOptions}>
            <Plus className="w-4 h-4 mr-2" />
            Generate Variants
          </Button>
          {generatedVariants.length > 0 && (
            <>
              <Button variant="outline" onClick={copyTemplateToAll}>
                <Copy className="w-4 h-4 mr-2" />
                Apply Template to All
              </Button>
              <Button onClick={handleCreateVariants} disabled={isCreating}>
                {isCreating
                  ? "Creating..."
                  : `Create ${generatedVariants.length} Variants`}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
export default VariantMasterTemplateCard;
