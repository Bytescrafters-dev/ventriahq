"use client";

import { useState } from "react";
import { StoreCreateInput } from "@/hooks/useStores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { CURRENCIES, TIMEZONES } from "@/shared/constants/common";

const storeSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  slug: z.string().min(1, "Slug is required"),
  domain: z.string(),
  defaultCurrency: z.string().min(1, "Default currency is required"),
  timezone: z.string(),
  supportEmail: z.union([z.literal(""), z.email("Invalid email address")]),
});
type StoreForm = z.infer<typeof storeSchema>;

export function StoreGeneralTab({
  onSave,
  isCreating,
}: {
  onSave: (data: StoreCreateInput) => void;
  isCreating?: boolean;
}) {
  //const [uploadState, setForm] = useState<Store>(store);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm<StoreForm>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: "",
      slug: "",
      domain: "",
      defaultCurrency: CURRENCIES[0].value,
      supportEmail: "",
    },
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  //   const set = (field: keyof Store, value: string) =>
  //     setForm((prev) => ({ ...prev, [field]: value }));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    //set("logoUrl", url);
  };

  const generateSlug = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setValue("slug", slug);
  };

  const onSubmit = (values: StoreForm) => {
    const { name, slug, domain, defaultCurrency, supportEmail } = values;

    onSave({ name, slug, domain, defaultCurrency, supportEmail, logoUrl: "" });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      {/* Logo */}
      <div className="space-y-2">
        <Label>Logo</Label>
        <div className="flex items-center gap-4">
          {logoPreview ? (
            <Image
              src={logoPreview}
              alt="Store logo"
              width={64}
              height={64}
              className="rounded-md object-cover border"
            />
          ) : (
            <div className="w-16 h-16 rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground">
              No logo
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            className="max-w-xs"
            onChange={handleLogoChange}
          />
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...register("name")}
          onChange={(e) => generateSlug(e.target.value)}
          required
        />
      </div>

      {/* Slug (read-only) */}
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" {...register("slug")} required />
      </div>

      {/* Domain */}
      <div className="space-y-2">
        <Label htmlFor="domain">Domain</Label>
        <Input
          id="domain"
          {...register("domain")}
          placeholder="e.g. store.example.com"
        />
      </div>

      {/* Support Email */}
      <div className="space-y-2">
        <Label htmlFor="supportEmail">Support Email</Label>
        <Input
          id="supportEmail"
          type="email"
          {...register("supportEmail")}
          placeholder="support@example.com"
        />
      </div>

      {/* Currency */}
      <div className="space-y-2">
        <Label>Default Currency</Label>
        <Select
          value={watch("defaultCurrency")}
          onValueChange={(v) =>
            setValue("defaultCurrency", v as StoreForm["defaultCurrency"])
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((currency) => (
              <SelectItem key={currency.value} value={currency.value}>
                {currency.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timezone */}
      <div className="space-y-2">
        <Label>Timezone</Label>
        <Select
          value={watch("timezone")}
          onValueChange={(v) =>
            setValue("timezone", v as StoreForm["timezone"])
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isCreating}>
        {isCreating ? (
          <>
            <Loader2Icon className="animate-spin" />
            Please wait
          </>
        ) : (
          "Create Store"
        )}
      </Button>
    </form>
  );
}
