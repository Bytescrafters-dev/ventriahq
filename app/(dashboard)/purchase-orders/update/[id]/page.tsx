"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { SupplierSelector } from "../../components/SupplierSelector";
import { Supplier } from "@/types/supplier";
import { ProductSearch } from "../../components/ProductSearch";
import {
  OrderLinesTable,
  OrderLine,
  ParentComponent,
} from "../../components/OrderLinesTable";
import { OrderDetailsForm } from "../../components/OrderDetailsForm";
import {
  useUpdatePurchaseOrder,
  usePurchaseOrder,
  useReceivePurchaseOrder,
  useRejectPurchaseOrder,
} from "@/hooks/usePurchaseOrders";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "../../page";
import { Skeleton } from "@/components/ui/skeleton";
import { PurchaseOrderStatus } from "@/types/purchaseOrder";
import DeleteDialog from "@/components/delete-confirmation-dialog";

const UpdatePurchaseOrderPage = () => {
  const router = useRouter();
  const params = useParams();
  const purchaseOrderId = params.id as string;

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [currency, setCurrency] = useState("");
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [invoiceRef, setInvoiceRef] = useState("");
  const [note, setNote] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<
    Date | undefined
  >(undefined);
  const [rejectDialog, setRejectDialog] = useState({
    isOpen: false,
  });

  const {
    data: purchaseOrder,
    isLoading: purchaseOrderLoading,
    isError: purchaseOrderError,
  } = usePurchaseOrder(purchaseOrderId);

  const {
    mutateAsync: updatePurchaseOrder,
    isPending,
    isError,
  } = useUpdatePurchaseOrder(purchaseOrderId);

  const { mutateAsync: receivePurchaseOrder, isError: receiveError } =
    useReceivePurchaseOrder(purchaseOrderId);

  const {
    mutateAsync: rejectPurchaseOrder,
    isPending: rejectPending,
    isError: rejectError,
  } = useRejectPurchaseOrder(purchaseOrderId);

  const orderStatus = purchaseOrder?.status ?? PurchaseOrderStatus.UNRESOLVED;
  const editable =
    orderStatus === PurchaseOrderStatus.UNRESOLVED ||
    orderStatus === PurchaseOrderStatus.CREATED;

  useEffect(() => {
    if (purchaseOrder) {
      setSelectedSupplier(purchaseOrder.supplier ?? null);
      setLines(
        purchaseOrder.lines.map((l) => ({
          lineId: l.id,
          variantId: l.variantId,
          productTitle: l.variant.product.title,
          variantTitle: l.variant.title,
          sku: l.variant.sku,
          orderedQty: l.orderedQty,
          costPerUnit: l.costPerUnit ?? undefined,
          receivedQty: l.receivedQty ?? undefined,
        })),
      );
      setInvoiceRef(purchaseOrder.invoiceRef);
      setNote(purchaseOrder.note ?? "");
      setCurrency(purchaseOrder.currency);
      setExpectedDeliveryDate(
        purchaseOrder.expectedDeliveryDate
          ? new Date(purchaseOrder.expectedDeliveryDate)
          : undefined,
      );
    }
  }, [purchaseOrder]);

  const handleAddLine = (line: OrderLine) => {
    setLines((prev) => {
      const existingIndex = prev.findIndex(
        (l) => l.variantId === line.variantId,
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = line;
        return updated;
      }
      return [...prev, line];
    });
  };

  const handleRemoveLine = (variantId: string) => {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId));
  };

  const handleUpdateLine = (
    variantId: string,
    updates: Partial<Pick<OrderLine, "orderedQty" | "costPerUnit">>,
  ) => {
    setLines((prev) =>
      prev.map((l) => (l.variantId === variantId ? { ...l, ...updates } : l)),
    );
  };

  const handleRejectConfirm = async () => {
    try {
      await rejectPurchaseOrder();
      setRejectDialog({ isOpen: false });
      toast.success("Purchase order rejected successfully");
      router.push("/purchase-orders");
    } catch {}
  };

  const handleSubmit = async () => {
    if (lines.length === 0) {
      toast.error("Add at least one product line before updating the order.");
      return;
    }

    const currentLineIds = new Set(lines.map((l) => l.lineId).filter(Boolean));

    const updateLines = lines
      .filter((l) => l.lineId)
      .map((l) => ({
        lineId: l.lineId!,
        orderedQty: l.orderedQty,
        costPerUnit: l.costPerUnit ?? undefined,
      }));

    const addLines = lines
      .filter((l) => !l.lineId)
      .map((l) => ({
        variantId: l.variantId,
        orderedQty: l.orderedQty,
        costPerUnit: l.costPerUnit ?? undefined,
      }));

    const removeLineIds = (purchaseOrder?.lines ?? [])
      .filter((l) => !currentLineIds.has(l.id))
      .map((l) => l.id);

    await updatePurchaseOrder({
      supplierId: selectedSupplier?.id,
      invoiceRef,
      note,
      currency,
      expectedDeliveryDate: expectedDeliveryDate?.toISOString(),
      updateLines,
      addLines,
      removeLineIds,
    });
    toast.success("Purchase order updated successfully!");
  };

  useEffect(() => {
    if (purchaseOrderError) {
      toast.error("Failed to fetch purchase order!");
    }

    if (isError) {
      toast.error("Failed to update purchase order!");
    }

    if (receiveError) {
      toast.error("Failed to receive items!");
    }

    if (rejectError) {
      toast.error("Failed to reject purchaseOrder!");
    }
  }, [receiveError, rejectError, isError, purchaseOrderError]);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href="/purchase-orders">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Purchase Orders
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">
            {purchaseOrderLoading
              ? "Purchase Order"
              : purchaseOrder?.orderNumber}
          </h1>
          {purchaseOrder?.status && (
            <Badge className={`${getStatusColor(purchaseOrder?.status ?? "")}`}>
              {purchaseOrder?.status}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {purchaseOrderLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : (
          <SupplierSelector
            orderStatus={orderStatus}
            selected={selectedSupplier}
            onSelect={setSelectedSupplier}
          />
        )}

        {purchaseOrderLoading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : (
          <OrderDetailsForm
            currency={currency}
            setCurrency={setCurrency}
            invoiceRef={invoiceRef}
            note={note}
            expectedDeliveryDate={expectedDeliveryDate}
            onInvoiceRefChange={setInvoiceRef}
            onNoteChange={setNote}
            onExpectedDeliveryDateChange={setExpectedDeliveryDate}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Order Lines
              {lines.length > 0 && (
                <span className="ml-2 text-muted-foreground font-normal text-sm">
                  ({lines.length} {lines.length === 1 ? "item" : "items"})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          {purchaseOrderLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : (
            <CardContent className="space-y-4">
              {editable && (
                <ProductSearch lines={lines} onAddLine={handleAddLine} />
              )}

              {lines.length > 0 ? (
                <OrderLinesTable
                  currency={currency}
                  lines={lines}
                  onRemove={handleRemoveLine}
                  onUpdate={handleUpdateLine}
                  onReceive={async (lineId, receivedQty, costPerUnit) => {
                    await receivePurchaseOrder({
                      currency,
                      lines: [{ lineId, receivedQty, costPerUnit }],
                    });
                  }}
                  parentComponent={ParentComponent.UPDATE}
                  orderStatus={orderStatus}
                />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6 border rounded-md border-dashed">
                  Search for a product above to add order lines.
                </p>
              )}
            </CardContent>
          )}
        </Card>

        <div className="flex justify-end gap-4 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/purchase-orders")}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setRejectDialog({ isOpen: true })}
          >
            Reject Purchase Order
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={lines.length === 0 || isPending}
          >
            {isPending && <Loader2Icon className="animate-spin" />}
            {isPending ? "Updating..." : "Update Purchase Order"}
          </Button>
        </div>
      </div>
      <DeleteDialog
        isOpen={rejectDialog.isOpen}
        onOpenChange={() => setRejectDialog({ isOpen: false })}
        isLoading={rejectPending}
        onConfirm={handleRejectConfirm}
        title="Delete Purchase Order"
        description={`Are you sure you want to reject "${purchaseOrder?.orderNumber}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default UpdatePurchaseOrderPage;
