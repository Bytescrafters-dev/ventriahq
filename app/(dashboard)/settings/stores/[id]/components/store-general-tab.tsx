"use client";

import { useEffect, useState } from "react";
import { Store } from "@/types/store";
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
  domain: z.string(),
  defaultCurrency: z.string().min(1, "Default currency is required"),
  timezone: z.string(),
  supportEmail: z.union([z.literal(""), z.email("Invalid email address")]),
});
type StoreForm = z.infer<typeof storeSchema>;

export function StoreGeneralTab({
  store,
  onSave,
  isUpdating,
}: {
  store: Store;
  onSave: (updated: Partial<Store>) => void;
  isUpdating?: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm<StoreForm>({
    resolver: zodResolver(storeSchema),
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(store.logoUrl);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
  };

  useEffect(() => {
    if (store) {
      setValue("name", store.name);
      setValue("domain", store.domain ?? "");
      setValue("defaultCurrency", store.defaultCurrency);
      setValue("timezone", store.timezone ?? "");
      setValue("supportEmail", store.supportEmail ?? "");
    }
  }, [store, setValue]);

  const onSubmit = (values: StoreForm) => {
    const updatedtore = {
      name: values.name,
      domain: values.domain ?? null,
      defaultCurrency: values.defaultCurrency,
      timezone: values.timezone ?? null,
      supportEmail: values.supportEmail ?? null,
    };
    onSave(updatedtore);
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
        <Input id="name" {...register("name")} required />
      </div>

      {/* Slug (read-only) */}
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" value={store.slug} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground">
          Slug cannot be changed after creation.
        </p>
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

      <Button type="submit" disabled={isUpdating}>
        {isUpdating ? (
          <>
            <Loader2Icon className="animate-spin" />
            Please wait
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}
