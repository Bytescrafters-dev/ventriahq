"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { useLeads } from "@/hooks/useLeads";
import { LEAD_CAMPAIGN, LEAD_STATUS } from "@/types/leads";
import { LeadsFilters } from "./components/LeadsFilters";
import { IconPlus } from "@tabler/icons-react";

export const getCampaignStyles = (campaign: LEAD_CAMPAIGN) => {
  switch (campaign) {
    case LEAD_CAMPAIGN.FACEBOOK:
      return "bg-blue-800 text-white";
    case LEAD_CAMPAIGN.INSTAGRAM:
      return "bg-pink-800 text-white";
    case LEAD_CAMPAIGN.TIKTOK:
      return "bg-black text-white";
    case LEAD_CAMPAIGN.WHATSAPP:
      return "bg-green-800 text-white";
    case LEAD_CAMPAIGN.GOOGLE:
      return "bg-gray-100 text-red-800";
    case LEAD_CAMPAIGN.OTHER:
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getStatusStyles = (status: string) => {
  switch (status) {
    case LEAD_STATUS.NEW:
      return "bg-blue-100 text-blue-800";
    case LEAD_STATUS.CONTACTED:
      return "bg-yellow-100 text-yellow-800";
    case LEAD_STATUS.NO_ANSWER:
      return "bg-red-100 text-red-800";
    case LEAD_STATUS.INTERESTED:
      return "bg-green-100 text-green-800";
    case LEAD_STATUS.ORDERED:
      return "bg-purple-100 text-purple-800";
    case LEAD_STATUS.NOT_INTERESTED:
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const LIMIT = 10;

function LeadsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const q = searchParams.get("q") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const source = searchParams.get("source") ?? undefined;
  const dateType = (searchParams.get("dateType") ?? "createdAt") as
    | "createdAt"
    | "followupDate";

  const parseDateParam = (str: string | null): Date | undefined => {
    if (!str) return undefined;
    const d = parse(str, "yyyy-MM-dd", new Date());
    return isValid(d) ? d : undefined;
  };

  const dateFrom = parseDateParam(searchParams.get("dateFrom"));
  const dateTo = parseDateParam(searchParams.get("dateTo"));

  const { data, isLoading, isError } = useLeads({
    page,
    limit: LIMIT,
    q,
    status,
    source,
    dateType,
    dateFrom,
    dateTo,
  });

  const setPage = (next: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", next.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  if (isError) {
    return (
      <div className="text-destructive text-sm py-8 text-center">
        Failed to load leads.
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Contact No</TableHead>
              <TableHead className="font-bold">Email</TableHead>
              <TableHead className="font-bold">Source</TableHead>
              <TableHead className="font-bold">Created Date</TableHead>
              <TableHead className="font-bold">Followup Date</TableHead>
              <TableHead className="font-bold">Assigned To</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: LIMIT }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.data?.length ? (
              data.data.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    <Link href={`/leads/update/${lead.id}`}>
                      {lead.fullName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.phone}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.email || "—"}
                  </TableCell>
                  <TableCell>
                    {lead.source ? (
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${getCampaignStyles(lead.source)}`}
                      >
                        {lead.source}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(lead.createdAt), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.followUpDate || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.assignedToId || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${getStatusStyles(lead.status)}`}
                    >
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center items-center">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/leads/update/${lead.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {}}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground py-10"
                >
                  No leads found
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
}

export default function LeadsPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leads</h1>
        <Button asChild size="sm">
          <Link href="/leads/create">
            <IconPlus className="mr-2" />
            Create Lead
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-4">
            <Suspense fallback={<Skeleton className="h-20 w-full" />}>
              <LeadsFilters />
            </Suspense>
          </CardContent>
        </Card>

        <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
          <LeadsContent />
        </Suspense>
      </div>
    </div>
  );
}
