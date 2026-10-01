import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderItem, OrderStatus, PaymentStatus } from "@/types/order";

interface Props {
  items: OrderItem[];
  currency: string;
  discount: string;
  note: string;
  paymentStatus: PaymentStatus;
  canEdit?: boolean;
  showManageStatus?: boolean;
  orderStatus?: OrderStatus;
  orderStatusValue?: OrderStatus;
  onDiscountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onPaymentStatusChange: (value: PaymentStatus) => void;
  onChangeOrderStatus?: (value: OrderStatus) => void;
}

const getPaymentStatusOptions = (value: OrderStatus) => {
  switch (value) {
    case OrderStatus.PENDING:
      return [
        { label: "Unpaid", value: PaymentStatus.UNPAID },
        { label: "Cash on Delivery", value: PaymentStatus.COD },
        { label: "Paid", value: PaymentStatus.PAID },
      ];
    case OrderStatus.CONFIRMED:
      return [
        { label: "Cash on Delivery", value: PaymentStatus.COD },
        { label: "Paid", value: PaymentStatus.PAID },
      ];
    case OrderStatus.SHIPPED:
      return [
        { label: "Cash on Delivery", value: PaymentStatus.COD },
        { label: "Paid", value: PaymentStatus.PAID },
      ];
    case OrderStatus.DELIVERED:
      return [
        { label: "Cash on Delivery", value: PaymentStatus.COD },
        { label: "Paid", value: PaymentStatus.PAID },
      ];
    case OrderStatus.CANCELED:
      return [
        { label: "Unpaid", value: PaymentStatus.UNPAID },
        { label: "Cash on Delivery", value: PaymentStatus.COD },
        { label: "Paid", value: PaymentStatus.PAID },
      ];
    default:
      return [];
  }
};

const getOrderStatus = (value: OrderStatus) => {
  switch (value) {
    case OrderStatus.PENDING:
      return [
        { label: "Pending", value: OrderStatus.PENDING },
        { label: "Confirmed", value: OrderStatus.CONFIRMED },
        { label: "Canceled", value: OrderStatus.CANCELED },
      ];
    case OrderStatus.CONFIRMED:
      return [
        { label: "Confirmed", value: OrderStatus.CONFIRMED },
        { label: "Shipped", value: OrderStatus.SHIPPED },
        { label: "Canceled", value: OrderStatus.CANCELED },
      ];
    case OrderStatus.SHIPPED:
      return [
        { label: "Shipped", value: OrderStatus.SHIPPED },
        { label: "Delivered", value: OrderStatus.DELIVERED },
      ];
    case OrderStatus.DELIVERED:
      return [{ label: "Delivered", value: OrderStatus.DELIVERED }];
    case OrderStatus.CANCELED:
      return [
        { label: "Canceled", value: OrderStatus.CANCELED },
        { label: "Pending", value: OrderStatus.PENDING },
      ];
    default:
      return [];
  }
};

export const OrderSummary = ({
  items,
  currency,
  discount,
  note,
  paymentStatus,
  orderStatus = OrderStatus.PENDING,
  orderStatusValue = OrderStatus.PENDING,
  canEdit = true,
  showManageStatus = false,
  onDiscountChange,
  onNoteChange,
  onPaymentStatusChange,
  onChangeOrderStatus,
}: Props) => {
  const subtotal = items.reduce((sum, item) => {
    if (item.pricePerUnit !== undefined) {
      return sum + item.quantity * item.pricePerUnit;
    }
    return sum;
  }, 0);

  const discountAmount = parseFloat(discount) || 0;
  const total = Math.max(0, subtotal - discountAmount);
  const hasAnyPrice = items.some((i) => i.pricePerUnit !== undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Label className="w-40 min-w-40 text-sm font-medium leading-none flex items-center">
            Note
          </Label>
          <Textarea
            placeholder="Internal notes about this order..."
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            rows={3}
          />
        </div>

        {hasAnyPrice && (
          <>
            <div className="flex gap-4">
              <Label className="w-40 min-w-40 text-sm font-medium leading-none flex items-center">
                Discount ({currency})
              </Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                className="w-56"
                value={discount}
                disabled={!canEdit}
                onChange={(e) => onDiscountChange(e.target.value)}
              />
            </div>

            {showManageStatus && onChangeOrderStatus && (
              <div className="flex gap-4">
                <Label className="w-40 min-w-40 text-sm font-medium leading-none flex items-center">
                  Order Status
                </Label>
                <Select
                  value={orderStatusValue}
                  onValueChange={(v) => onChangeOrderStatus(v as OrderStatus)}
                >
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getOrderStatus(orderStatus).map(({ label, value }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-4">
              <Label className="w-40 min-w-40 text-sm font-medium leading-none flex items-center">
                Payment Status
              </Label>
              <Select
                value={paymentStatus}
                onValueChange={
                  orderStatusValue === OrderStatus.DELIVERED ||
                  orderStatusValue === OrderStatus.CANCELED
                    ? () => {}
                    : (v) => onPaymentStatusChange(v as PaymentStatus)
                }
              >
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getPaymentStatusOptions(orderStatusValue).map(
                    ({ label, value }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>
                  {currency} {subtotal.toFixed(2)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Discount</span>
                  <span>
                    - {currency} {discountAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold pt-1 border-t">
                <span>Total</span>
                <span>
                  {currency} {total.toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
