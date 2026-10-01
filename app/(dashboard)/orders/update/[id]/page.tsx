"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { CustomerDetailsForm } from "../../components/CustomerDetailsForm";
import { OrderItemsSearch } from "../../components/OrderItemsSearch";
import { OrderItemsTable } from "../../components/OrderItemsTable";
import { OrderSummary } from "../../components/OrderSummary";
import { useOrder, useUpdateOrder } from "@/hooks/useOrders";
import {
  OrderItem,
  OrderStatus,
  PaymentStatus,
  UpdateOrderInput,
} from "@/types/order";
import { getDisplayPrice } from "@/lib/utils";
import { ResolveOrderStatus } from "../../page";
import { Skeleton } from "@/components/ui/skeleton";

const UpdateOrderPage = () => {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress1, setShippingAddress1] = useState("");
  const [shippingAddress2, setShippingAddress2] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [discount, setDiscount] = useState("");
  const [note, setNote] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    PaymentStatus.UNPAID,
  );
  const [status, setStatus] = useState<OrderStatus | null>(null);

  const {
    data,
    isLoading,
    isError: fetchingError,
    dataUpdatedAt,
    refetch,
  } = useOrder(orderId);

  const {
    mutateAsync: updateOrder,
    isPending,
    isError,
    error,
  } = useUpdateOrder();

  const handleCustomerChange = (field: string, value: string) => {
    const setters: Record<string, (v: string) => void> = {
      customerName: setCustomerName,
      customerPhone: setCustomerPhone,
      shippingAddress1: setShippingAddress1,
      shippingAddress2: setShippingAddress2,
      shippingCity: setShippingCity,
      shippingState: setShippingState,
      shippingPostalCode: setShippingPostalCode,
      shippingCountry: setShippingCountry,
    };
    setters[field]?.(value);
  };

  useEffect(() => {
    if (data) {
      setStatus(data.status);
      setCustomerName(
        data.storeUserId
          ? `${data.storeUser?.firstName} ${data.storeUser?.lastName}`
          : (data.customerName ?? "-"),
      );
      setCustomerPhone(
        data.storeUserId
          ? (data.storeUser?.phone ?? "-")
          : (data.customerPhone ?? "-"),
      );
      setShippingAddress1(data.shippingAddress1 ?? "");
      setShippingAddress2(data.shippingAddress2 ?? "");
      setShippingCity(data.shippingCity ?? "");
      setShippingState(data.shippingState ?? "");
      setShippingPostalCode(data.shippingPostalCode ?? "");
      setShippingCountry(data.shippingCountry ?? "");
      setDiscount(data.discount.toString() ?? "");
      setNote(data.note ?? "");
      setPaymentStatus(data.paymentStatus);
      if (data.items && data.items.length > 0) {
        const orderItems = data.items.map((item) => {
          return {
            variantId: item.variantId,
            productTitle: item.productTitle,
            variantTitle: item.variantTitle,
            sku: item.sku,
            quantity: item.quantity,
            pricePerUnit: getDisplayPrice(item.unitPrice),
          };
        });

        setItems(orderItems);
      }
    }
    // Re-sync the form on every fetch (including refetch after a failed update), not only when data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataUpdatedAt]);

  const handleAddItem = (item: OrderItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.variantId === item.variantId,
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = item;
        return updated;
      }
      return [...prev, item];
    });
  };

  const handleRemoveItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const handleUpdateItem = (
    variantId: string,
    updates: Pick<OrderItem, "quantity">,
  ) => {
    setItems((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, ...updates } : i)),
    );
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error("Add at least one product before creating the order.");
      return;
    }

    if (!status) {
      toast.error("Order status is not resolved");
      return;
    }

    const orderInput: UpdateOrderInput = {
      status,
      paymentStatus,
      // items: items.map((i) => ({
      //   variantId: i.variantId,
      //   quantity: i.quantity,
      // })),
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      shippingAddress1: shippingAddress1 || undefined,
      shippingAddress2: shippingAddress2 || undefined,
      shippingCity: shippingCity || undefined,
      shippingState: shippingState || undefined,
      shippingPostalCode: shippingPostalCode || undefined,
      shippingCountry: shippingCountry || undefined,
      note: note || undefined,
    };

    if (data?.status === OrderStatus.PENDING) {
      const updatedItems = items.map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
      }));
      orderInput.items = updatedItems;
    }

    await updateOrder({ id: orderId, data: orderInput });
    toast.success("Order updated successfully!");
  };

  useEffect(() => {
    if (fetchingError) {
      toast.error("Failed to fetch order");
    }

    if (isError) {
      toast.error(error.message || "Failed to update order");
      refetch();
    }
  }, [isError, fetchingError, error, refetch]);

  const canEditCustomerDetails =
    status === OrderStatus.PENDING || status === OrderStatus.CONFIRMED;
  const addEditOrderItems = status === OrderStatus.PENDING;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href="/orders">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Orders
          </Link>
        </Button>
        <div className="flex flex-1 gap-4">
          <h1 className="text-2xl font-bold">{`Order ${data?.orderNumber ?? ""}`}</h1>
          {status && ResolveOrderStatus(status)}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6">
          <CustomerDetailsForm
            customerName={customerName}
            customerPhone={customerPhone}
            shippingAddress1={shippingAddress1}
            shippingAddress2={shippingAddress2}
            shippingCity={shippingCity}
            shippingState={shippingState}
            shippingPostalCode={shippingPostalCode}
            shippingCountry={shippingCountry}
            onChange={handleCustomerChange}
            canEdit={canEditCustomerDetails}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Order Items
                {items.length > 0 && (
                  <span className="ml-2 text-muted-foreground font-normal text-sm">
                    ({items.length} {items.length === 1 ? "item" : "items"})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {addEditOrderItems && (
                <OrderItemsSearch items={items} onAddItem={handleAddItem} />
              )}
              {items.length > 0 ? (
                <OrderItemsTable
                  currency={data?.currency ?? ""}
                  items={items}
                  canEdit={addEditOrderItems}
                  onRemove={handleRemoveItem}
                  onUpdate={handleUpdateItem}
                />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6 border rounded-md border-dashed">
                  Search for a product above to add items.
                </p>
              )}
            </CardContent>
          </Card>

          <OrderSummary
            items={items}
            currency={data?.currency ?? ""}
            discount={discount}
            note={note}
            paymentStatus={paymentStatus}
            canEdit={addEditOrderItems}
            orderStatus={data ? data.status : OrderStatus.PENDING}
            orderStatusValue={status || OrderStatus.PENDING}
            showManageStatus
            onDiscountChange={setDiscount}
            onNoteChange={setNote}
            onPaymentStatusChange={setPaymentStatus}
            onChangeOrderStatus={setStatus}
          />

          <div className="flex justify-end gap-4 pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/orders")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={items.length === 0 || isPending}
            >
              {isPending && <Loader2Icon className="animate-spin" />}
              {isPending ? "Updating..." : "Update Order"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateOrderPage;
