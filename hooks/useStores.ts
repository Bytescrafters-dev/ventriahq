import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Store } from "@/types/store";
import { getErrorMessage } from "@/lib/utils";

export interface StoreCreateInput {
  name: string;
  slug: string;
  domain?: string;
  defaultCurrency?: string;
  supportEmail?: string;
  logoUrl?: string;
}

const fetchAllStores = async (): Promise<Store[]> => {
  const response = await fetch("/api/proxy/stores");
  if (!response.ok) {
    throw new Error("Failed to fetch stores");
  }
  return response.json();
};

const fetchStoreById = async (id: string): Promise<Store> => {
  const response = await fetch(`/api/proxy/stores/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch store");
  }
  return response.json();
};

const createStore = async (data: StoreCreateInput): Promise<Store> => {
  const response = await fetch("/api/proxy/stores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create store");
  }
  return response.json();
};

const updateStoreById = async (
  id: string,
  data: Partial<Store>,
): Promise<Store> => {
  const response = await fetch(`/api/proxy/stores/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update store");
  }
  return response.json();
};

export const useStores = () => {
  return useQuery<Store[], Error>({
    queryKey: ["stores"],
    queryFn: fetchAllStores,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStore = (id: string) => {
  return useQuery<Store, Error>({
    queryKey: ["store", id],
    queryFn: () => fetchStoreById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreCreateInput) => createStore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
};

export const useUpdateStore = () => {
  const queryClient = useQueryClient();

  const updateStore = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Store> }) =>
      updateStoreById(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      queryClient.invalidateQueries({ queryKey: ["store"] });
    },
  });

  return {
    updateStore: updateStore.mutateAsync,
    isUpdating: updateStore.isPending,
    isUpdatingError: getErrorMessage(updateStore.error),
  };
};
