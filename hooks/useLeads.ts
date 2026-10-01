import { useCurrentStore } from "@/contexts/storeProvider";
import { Lead } from "@/types/leads";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UseLeadsParams {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
  source?: string;
  dateType?: "createdAt" | "followupDate";
  dateFrom?: Date;
  dateTo?: Date;
}

export interface CreateLeadInput {
  fullName: string;
  phone: string;
  email?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  source?: string;
  productSKUs?: string[];
  note?: string;
  followUpDate?: string;
  assignedToId?: string;
}

interface LeadsResponse {
  data: Lead[];
  total: number;
  page: number;
  limit: number;
}

interface UpdateLeadInput {
  fullName?: string;
  phone?: string;
  email?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  source?: string;
  productSKUs?: string[];
  note?: string;
  followUpDate?: string;
  assignedToId?: string;
  status: string;
}

export interface BulkCreateResponse {
  imported: number;
  failed: number;
  errors: { row: number; reason: string }[];
}

export const useLeads = ({
  page = 1,
  limit = 10,
  status,
  q,
  source,
  dateType = "createdAt",
  dateFrom,
  dateTo,
}: UseLeadsParams = {}) => {
  const currentStore = useCurrentStore();

  return useQuery({
    //queryKey: ["leads", currentStore?.id, page, limit, status, q, source],
    queryKey: [
      "leads",
      currentStore?.id,
      { page, limit, status, q, source, dateType, dateFrom, dateTo },
    ],
    queryFn: async (): Promise<LeadsResponse> => {
      if (!currentStore?.id) {
        throw new Error("No store selected");
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (status) params.append("status", status);
      if (q) params.append("q", q);
      if (source) params.append("source", source);
      if (dateFrom)
        params.append(
          dateType === "createdAt" ? "createdAtFrom" : "followupFrom",
          dateFrom.toISOString(),
        );
      if (dateTo)
        params.append(
          dateType === "createdAt" ? "createdAtTo" : "followupTo",
          dateTo.toISOString(),
        );

      const response = await fetch(
        `/api/proxy/leads/store/${currentStore.slug}?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }

      return response.json();
    },
    enabled: !!currentStore?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLead = (leadId: string) => {
  return useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      const response = await fetch(`/api/proxy/leads/${leadId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch lead");
      }

      return response.json();
    },
    enabled: !!leadId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  const currentStore = useCurrentStore();

  return useMutation({
    mutationFn: async (data: CreateLeadInput) => {
      if (!currentStore?.id) {
        throw new Error("No store selected");
      }

      const response = await fetch(
        `/api/proxy/leads/store/${currentStore.slug ?? "anonymous"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create lead");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["leads", currentStore?.id],
      });
    },
  });
};

export const useBulkCreateLeads = () => {
  const queryClient = useQueryClient();
  const currentStore = useCurrentStore();

  return useMutation({
    mutationFn: async (
      leads: CreateLeadInput[],
    ): Promise<BulkCreateResponse> => {
      const response = await fetch(
        `/api/proxy/leads/store/${currentStore?.slug ?? "anonymous"}/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ leads }),
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to bulk create leads");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["leads", currentStore?.id],
      });
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  const currentStore = useCurrentStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLeadInput }) => {
      const response = await fetch(`/api/proxy/leads/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update lead");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["leads", currentStore?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["lead"],
      });
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  const currentStore = useCurrentStore();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const response = await fetch(`/api/proxy/leads/${leadId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to delete lead");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["leads", currentStore?.id],
      });
    },
  });
};
