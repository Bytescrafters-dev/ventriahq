"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2Icon, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams, useRouter } from "next/navigation";
import { useLead, useUpdateLead } from "@/hooks/useLeads";
import { toast } from "sonner";
import { ProductSearch } from "../../components/productSearch";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/common/DatePicker";
import { format } from "date-fns";
import { LEAD_CAMPAIGN, LEAD_STATUS } from "@/types/leads";
import { getStatusStyles } from "../../page";
import { Skeleton } from "@/components/ui/skeleton";

export const CAMPAIGN_OPTIONS = [
  { label: "Facebook", value: LEAD_CAMPAIGN.FACEBOOK },
  { label: "Instagram", value: LEAD_CAMPAIGN.INSTAGRAM },
  { label: "Google", value: LEAD_CAMPAIGN.GOOGLE },
  { label: "TikTok", value: LEAD_CAMPAIGN.TIKTOK },
  { label: "WhatsApp", value: LEAD_CAMPAIGN.WHATSAPP },
  { label: "Other", value: LEAD_CAMPAIGN.OTHER },
];

const LEAD_STATUS_OPTIONS = [
  { label: "New", value: LEAD_STATUS.NEW },
  { label: "Contacted", value: LEAD_STATUS.CONTACTED },
  { label: "Interested", value: LEAD_STATUS.INTERESTED },
  { label: "Not Interested", value: LEAD_STATUS.NOT_INTERESTED },
  { label: "No Answer", value: LEAD_STATUS.NO_ANSWER },
  { label: "Ordered", value: LEAD_STATUS.ORDERED },
];

const schema = z.object({
  fullName: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.union([z.literal(""), z.email("Invalid email address")]),
  address1: z.string(),
  address2: z.string(),
  state: z.string(),
  postalCode: z.string(),
  note: z.string(),
  followUpDate: z.string(),
  city: z.string(),
  country: z.string(),
});

type Form = z.infer<typeof schema>;

const UpdateLeadPage = () => {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;

  const [productSKUs, setProductSKUs] = useState<string[]>([]);
  const [assignedToId, setAssignedToId] = useState<string | undefined>(
    undefined,
  );
  const [status, setStatus] = useState<LEAD_STATUS>(LEAD_STATUS.NEW);
  const [source, setSource] = useState<LEAD_CAMPAIGN>(LEAD_CAMPAIGN.OTHER);

  const { register, handleSubmit, reset, watch, setValue } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      note: "",
      followUpDate: "",
    },
  });

  const { data, isLoading, isError: loadingLeadError } = useLead(leadId);

  const { mutateAsync: updateLead, isPending, isError } = useUpdateLead();

  useEffect(() => {
    if (data) {
      reset({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email ?? "",
        address1: data.address1 ?? "",
        address2: data.address2 ?? "",
        city: data.city ?? "",
        state: data.state ?? "",
        country: data.country ?? "",
        postalCode: data.postalCode ?? "",
        note: data.note ?? "",
        followUpDate: data.followUpDate ?? "",
      });
      setStatus(data.status || LEAD_STATUS.NEW);
      setSource(data.source || LEAD_CAMPAIGN.OTHER);
      setProductSKUs(data.productSKUs ?? []);
      setAssignedToId(data.assignedToId ?? undefined);
    }
  }, [data, reset]);

  const onSubmit = async (values: Form) => {
    const {
      fullName,
      phone,
      email,
      address1,
      address2,
      city,
      state,
      country,
      postalCode,
      note,
      followUpDate,
    } = values;

    try {
      await updateLead({
        id: data.id,
        data: {
          fullName,
          phone,
          email: email !== "" ? email : undefined,
          address1,
          address2,
          city,
          state,
          country,
          postalCode,
          source,
          note,
          followUpDate: followUpDate !== "" ? followUpDate : undefined,
          productSKUs,
          assignedToId,
          status: status ?? "",
        },
      });
      reset({
        fullName: "",
        phone: "",
        email: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        note: "",
        followUpDate: "",
      });
      setProductSKUs([]);
      setAssignedToId(undefined);
      setStatus(LEAD_STATUS.NEW);
      toast.success("Lead created successfully!");
    } catch {}
  };

  useEffect(() => {
    if (isError) toast.error("Failed to update lead!");

    if (loadingLeadError) toast.error("Failed to load lead!");
  }, [isError, loadingLeadError]);

  const onAddProduct = (sku: string) => {
    if (!productSKUs.includes(sku)) setProductSKUs([...productSKUs, sku]);
  };

  console.log("status", status);
  console.log("campaign", source);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href="/leads">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Leads
          </Link>
        </Button>
        <div className="flex gap-4">
          <h1 className="text-2xl font-bold">Update Lead</h1>

          {!isLoading && (
            <Badge variant="outline" className={`${getStatusStyles(status)}`}>
              {LEAD_STATUS_OPTIONS.find((o) => o.value === status)?.label ??
                status}
            </Badge>
          )}
        </div>
      </div>
      <Card className="max-w">
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full rounded-xl" />
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex gap-4">
                <Label
                  htmlFor="fullName"
                  className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  Full Name<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="Customer name"
                  required
                />
              </div>

              <div className="flex gap-4">
                <div className="flex gap-4 w-1/2">
                  <Label
                    htmlFor="phone"
                    className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                  >
                    Contact Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="Contact number"
                    required
                  />
                </div>

                <div className="flex gap-4 w-1/2">
                  <Label
                    htmlFor="email"
                    className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    {...register("email")}
                    placeholder="Contact email"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Label
                  htmlFor="address1"
                  className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  Address Line 1
                </Label>
                <Input
                  id="address1"
                  {...register("address1")}
                  placeholder="Address line 1"
                />
              </div>
              <div className="flex gap-4">
                <Label
                  htmlFor="address2"
                  className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  Address Line 2
                </Label>
                <Input
                  id="address2"
                  {...register("address2")}
                  placeholder="Address line 2"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex gap-4">
                  <Label
                    htmlFor="city"
                    className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                  >
                    City
                  </Label>
                  <Input id="city" {...register("city")} placeholder="City" />
                </div>

                <div className="flex gap-4">
                  <Label
                    htmlFor="state"
                    className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                  >
                    State
                  </Label>
                  <Input
                    id="state"
                    {...register("state")}
                    placeholder="State"
                  />
                </div>

                <div className="flex gap-4">
                  <Label
                    htmlFor="country"
                    className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                  >
                    Country
                  </Label>
                  <Input
                    id="country"
                    {...register("country")}
                    placeholder="Country"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex gap-4">
                  <Label
                    htmlFor="postalCode"
                    className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                  >
                    Postal Code
                  </Label>
                  <Input
                    id="postalCode"
                    {...register("postalCode")}
                    placeholder="Postal Code"
                  />
                </div>

                <div className="flex gap-4">
                  <Label className="w-40 min-w-40 text-sm font-medium leading-none flex items-center">
                    Campaign Source
                  </Label>
                  <Select
                    value={source}
                    onValueChange={(v) => {
                      if (v) setSource(v as LEAD_CAMPAIGN);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMPAIGN_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex gap-4">
                  <Label
                    htmlFor="followUpDate"
                    className="w-40 min-w-40 text-sm font-medium leading-none flex items-center"
                  >
                    Followup Date
                  </Label>
                  <div className="flex-1 min-w-0">
                    <DatePicker
                      className="w-full"
                      value={
                        watch("followUpDate")
                          ? new Date(watch("followUpDate"))
                          : undefined
                      }
                      onChange={(date) =>
                        setValue(
                          "followUpDate",
                          date ? format(date, "yyyy-MM-dd") : "",
                        )
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Label
                    htmlFor="assignedTo"
                    className="w-40 min-w-40 text-sm font-medium leading-none flex items-center"
                  >
                    Assign To
                  </Label>
                  <Input
                    id="assignedTo"
                    value={assignedToId ?? ""}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    placeholder="Assigned to"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Label
                  htmlFor="note"
                  className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  Notes
                </Label>
                <Textarea id="note" {...register("note")} />
              </div>

              <ProductSearch lines={productSKUs} onAddLine={onAddProduct} />

              <div className="flex gap-4">
                <Label className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center">
                  Product SKUs
                </Label>
                <div>
                  {productSKUs.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {productSKUs.map((sku) => (
                        <Badge
                          key={sku}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {sku}
                          <button
                            type="button"
                            onClick={() =>
                              setProductSKUs(
                                productSKUs.filter((s) => s !== sku),
                              )
                            }
                            className="ml-0.5 rounded-sm hover:bg-secondary-foreground/20"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No products added
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex gap-4">
                  <Label
                    htmlFor="status"
                    className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                  >
                    Status
                  </Label>
                  <Select
                    value={status}
                    onValueChange={(value) => {
                      if (value) setStatus(value as LEAD_STATUS);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/leads")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2Icon className="animate-spin" />}
                  {isPending ? "Updating..." : "Update Lead"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateLeadPage;
