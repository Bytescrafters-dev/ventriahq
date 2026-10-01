"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export interface OrderLine {
  lineId?: string;
  variantId: string;
  productTitle: string;
  variantTitle: string;
  sku: string;
  qty: number;
  costPerUnit?: number;
}

interface Props {
  lines: OrderLine[];
  onRemove: (variantId: string) => void;
  onUpdate: (
    variantId: string,
    updates: Partial<Pick<OrderLine, "qty" | "costPerUnit">>,
  ) => void;
  parentComponent?: string;
  currency: string;
}

export const ParentComponent = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
};

export const OrderLinesTable = ({
  lines,
  onRemove,
  onUpdate,
  currency,
  parentComponent = ParentComponent.CREATE,
}: Props) => {
  const total = lines.reduce((sum, line) => {
    if (line.costPerUnit !== undefined) {
      return sum + line.qty * line.costPerUnit;
    }
    return sum;
  }, 0);

  const hasAnyCost = lines.some((l) => l.costPerUnit !== undefined);

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Product</TableHead>
            <TableHead className="font-semibold">Variant</TableHead>
            <TableHead className="font-semibold">SKU</TableHead>
            <TableHead className="font-semibold w-24">Quantity</TableHead>
            <TableHead className="font-semibold w-64">Cost / Unit</TableHead>
            <TableHead className="font-semibold w-28">Line Total</TableHead>
            <TableHead className="w-32" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line) => {
            const lineTotal =
              line.costPerUnit !== undefined
                ? (line.qty * line.costPerUnit).toFixed(2)
                : null;

            return (
              <TableRow key={line.variantId}>
                <TableCell className="font-medium">
                  {line.productTitle}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {line.variantTitle}
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">
                  {line.sku}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={1}
                    value={line.qty}
                    className="h-8 w-20"
                    onChange={(e) =>
                      onUpdate(line.variantId, {
                        qty: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                    disabled={parentComponent === ParentComponent.UPDATE}
                  />
                </TableCell>
                <TableCell className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.costPerUnit ?? ""}
                    placeholder="—"
                    className="h-8 w-28"
                    onChange={(e) =>
                      onUpdate(line.variantId, {
                        costPerUnit: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    disabled={parentComponent === ParentComponent.UPDATE}
                  />
                </TableCell>
                <TableCell className="text-right pr-4 text-muted-foreground">
                  {lineTotal !== null ? `${currency} ${lineTotal}` : "—"}
                </TableCell>
                <TableCell className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(line.variantId)}
                    disabled={parentComponent === ParentComponent.UPDATE}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {hasAnyCost && (
        <div className="flex justify-end px-4 py-3 border-t bg-muted/30">
          <span className="text-sm font-semibold">
            {`Order Total: ${currency} ${total.toFixed(2)}`}
          </span>
        </div>
      )}
    </div>
  );
};
