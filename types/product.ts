import {
  VariantInventory,
  VariantPrice,
  ProductVariant,
} from "@/hooks/useProductVariants";
import { ProductOption } from "@/hooks/useProductOptions";
import { ProductImage } from "@/types/productImage";

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  profileId: string;
  active: boolean;
  storeId: string;
  createdAt: string;
  updatedAt: string;

  // Nested relationships from API response
  category?: {
    id: string;
    name: string;
  };
  profile?: {
    id: string;
    name: string;
  };
  images?: ProductImage[];
  options?: ProductOption[];
  variants?: ProductVariant[];
  _count: {
    variants: number;
  };
}

export interface VariantMasterTemplate {
  skuPattern: string;
  titlePattern: string;
  barcodePattern: string;
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  active: boolean;
  prices: VariantPrice[];
  inventory: VariantInventory;
}

export interface productSearchVariant {
  id: string;
  title: string;
  sku: string;
  inventory: {
    quantity: number;
  };
  prices?: {
    currency: string;
    amount: number; // in cents
  }[];
}

export interface ProductsSearch {
  id: string;
  storeId: string;
  title: string;
  slug: string;
  description: string;
  active: boolean;
  variants: productSearchVariant[];
  _count: {
    variants: number;
  };
}
