"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { StoreCreateInput, useCreateStore } from "@/hooks/useStores";
import { ChevronLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreGeneralTab } from "./components/store-general-tab";

const CreateStore = () => {
  const router = useRouter();

  const { mutateAsync: createStore, isPending, isError } = useCreateStore();

  const onSave = async (data: StoreCreateInput) => {
    try {
      await createStore(data);
      toast.success("Store created successfully!");
      router.push("/settings/stores");
    } catch {}
  };

  useEffect(() => {
    if (isError) toast.error("Failed to create store");
  }, [isError]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Breadcrumb */}
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
        <Link href="/settings/stores">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Stores
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-center gap-3">
        {/* <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button> */}
        <h1 className="text-2xl font-semibold">Create Store</h1>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general">
        <TabsList className="w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <StoreGeneralTab onSave={onSave} isCreating={isPending} />
        </TabsContent>

        <TabsContent value="warehouses" className="mt-6">
          <p className="text-muted-foreground text-sm">
            Warehouse management coming soon.
          </p>
        </TabsContent>

        <TabsContent value="regions" className="mt-6">
          <p className="text-muted-foreground text-sm">
            Region management coming soon.
          </p>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6">
          <p className="text-muted-foreground text-sm">
            Shipping profile management coming soon.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default CreateStore;
