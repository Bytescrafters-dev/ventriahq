"use client";
import { Suspense } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import { useOrders } from "@/hooks/useOrders";
import { OrderStatus, PaymentStatus } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { OrdersFilters } from "./components/OrdersFilters";
import { Edit } from "lucide-react";

export const ResolvePaymentStatus = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.COD:
      return "Cash on delivery";
    case PaymentStatus.PAID:
      return "Paid";
    case PaymentStatus.REFUNDED:
      return "Refunded";
    case PaymentStatus.UNPAID:
      return "Unpaid";
    default:
      return "Unresolved";
  }
};

export const ResolveOrderStatus = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.CANCELED:
      return <Badge className="bg-red-600">Canceled</Badge>;
    case OrderStatus.CONFIRMED:
      return <Badge className="bg-blue-600">Confirmed</Badge>;
    case OrderStatus.DELIVERED:
      return <Badge className="bg-green-600">Delivered</Badge>;
    case OrderStatus.SHIPPED:
      return <Badge className="bg-purple-600">Shipped</Badge>;
    case OrderStatus.PENDING:
      return <Badge className="bg-orange-600">Pending</Badge>;
    default:
      return null;
  }
};

const LIMIT = 10;

const OrdersContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const q = searchParams.get("q") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const paymentStatus = searchParams.get("paymentStatus") ?? undefined;

  const { data, isLoading, error } = useOrders({
    page,
    limit: LIMIT,
    q,
    status: status as OrderStatus,
    paymentStatus: paymentStatus as PaymentStatus,
  });
  const setPage = (next: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", next.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Order Number</TableHead>
              <TableHead className="font-bold">Customer Name</TableHead>
              <TableHead className="font-bold">Phone</TableHead>
              <TableHead className="font-bold">Items</TableHead>
              <TableHead className="font-bold">Created Date</TableHead>
              <TableHead className="font-bold">Payment Status</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: LIMIT }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : data?.data?.length ? (
              data.data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <Link href={`/orders/update/${order.id}`}>
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.storeUserId
                      ? `${order.storeUser?.firstName} ${order.storeUser?.lastName}`
                      : `${order.customerName}`}
                  </TableCell>
                  <TableCell>
                    {(order.storeUserId
                      ? order.storeUser?.phone
                      : order.customerPhone) || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order._count.items || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(order.createdAt, "yyyy-MM-dd") || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-semibold">
                    {ResolvePaymentStatus(order.paymentStatus)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {ResolveOrderStatus(order.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/orders/update/${order.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteClick(supplier.id, supplier.name)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.total > LIMIT && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * LIMIT + 1}–
            {Math.min(page * LIMIT, data.total)} of {data.total} leads
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page * LIMIT >= data.total}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default function OrdersPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <Button asChild size="sm">
          <Link href="/orders/create">
            <IconPlus className="mr-2" />
            New Order
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-4">
            <Suspense fallback={<Skeleton className="h-20 w-full" />}>
              <OrdersFilters />
            </Suspense>
          </CardContent>
        </Card>

        <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
          <OrdersContent />
        </Suspense>
      </div>
    </div>
  );
}
