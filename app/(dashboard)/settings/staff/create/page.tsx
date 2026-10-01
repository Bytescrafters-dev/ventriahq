"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Loader2Icon, Minus, Plus } from "lucide-react";
import { useCreateStaffMember } from "@/hooks/useStaff";
import Link from "next/link";
import PasswordInput from "@/components/common/PasswordInput";
import { AdminRole } from "@/types/profile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStores } from "@/hooks/useStores";
import { Badge } from "@/components/ui/badge";
import { Store } from "@/types/store";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentStore } from "@/contexts/storeProvider";
import { usePermissions } from "@/hooks/auth/usePermissions";

export const ROLE_OPTIONS = [
  { label: "Manager", value: AdminRole.MANAGER },
  { label: "Staff", value: AdminRole.VIEWER },
];

const schema = z
  .object({
    email: z.email("Invalid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string(),
    password: z.string(),
    confirmPassword: z.string(),
    phone: z.string(),
    role: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type Form = z.infer<typeof schema>;

const CreateStaffMember = () => {
  const router = useRouter();
  const currentStore = useCurrentStore();
  const { isOwner, isManager } = usePermissions();

  const [storeIds, setStoreIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      phone: "",
      role: AdminRole.VIEWER,
    },
  });

  const { data, isLoading, isError: storesError } = useStores();

  const {
    mutateAsync: createStaffMember,
    isPending,
    isError,
  } = useCreateStaffMember();

  const onSubmit = async (values: Form) => {
    const { email, password, firstName, lastName, role, phone } = values;

    try {
      await createStaffMember({
        email,
        password,
        firstName,
        lastName,
        role,
        phone,
        storeIds,
      });

      reset({
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
        phone: "",
        role: AdminRole.VIEWER,
      });
      toast.success("Staff member created successfully!");
    } catch {}
  };

  const isAlreadyAdded = (id: string) => storeIds.some((l) => l === id);

  const handleAddStore = (store: Store) => {
    if (storeIds.includes(store.id)) return;

    const newStores = storeIds.map((id) => id);
    newStores.push(store.id);

    setStoreIds(newStores);
  };

  const handleRemoveStore = (store: Store) => {
    if (storeIds.length === 1) {
      toast.error("Staff should assigned with at least 1 store!");
      return;
    }
    const newStores = storeIds.filter((id) => id !== store.id);

    setStoreIds(newStores);
  };

  useEffect(() => {
    if (currentStore) {
      setStoreIds((prev) =>
        prev.includes(currentStore.id) ? prev : [...prev, currentStore.id],
      );
    }
  }, [currentStore]);

  useEffect(() => {
    if (isError) toast.error("Failed to create staff member!");

    if (isError) toast.error("Failed to load stores!");
  }, [isError, storesError]);

  const getRoleOptions = () => {
    if (isOwner) return ROLE_OPTIONS;
    if (isManager)
      return ROLE_OPTIONS.filter(({ value }) => value === AdminRole.VIEWER);
    return [];
  };

  return (
    <div className="p-4 md:p-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
        <Link href="/settings/staff">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Staff members
        </Link>
      </Button>

      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Create Staff Member</h1>
      </div>

      <Card className="max-w">
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 max-w-2xl"
          >
            <div className="flex gap-4">
              <Label
                htmlFor="email"
                className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="flex-1">
                <Input
                  id="email"
                  {...register("email")}
                  placeholder="Staff email"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <Label
                htmlFor="firstName"
                className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                First Name <span className="text-red-500">*</span>
              </Label>
              <div className="flex-1">
                <Input
                  id="firstName"
                  {...register("firstName")}
                  placeholder="First name"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Label
                htmlFor="lastName"
                className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Last name"
              />
            </div>

            <div className="flex gap-4">
              <Label
                htmlFor="phone"
                className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                Contact Number
              </Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="Contact number"
              />
            </div>
            <div className="flex gap-4">
              <Label className="w-40 min-w-40 text-sm font-medium leading-none flex items-center">
                Role
              </Label>
              <Select
                value={watch("role")}
                onValueChange={(v) => {
                  if (v) setValue("role", v as Form["role"]);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getRoleOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="my-4 text-sm text-muted-foreground">
              Create a temporary password and share it with the new staff
              member. They will be required to reset their password upon their
              first login.
            </p>

            <div className="flex gap-4">
              <Label
                htmlFor="password"
                className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                Temporary password
              </Label>
              <PasswordInput
                id="password"
                {...register("password")}
                placeholder="Password"
              />
            </div>

            <div className="flex gap-4">
              <Label
                htmlFor="confirmPassword"
                className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                Confirm Password
              </Label>
              <div className="flex-1">
                <PasswordInput
                  id="confirmPassword"
                  {...register("confirmPassword")}
                  placeholder="Confirm password"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
            <p className="mb-4 text-sm text-muted-foreground mt-8">
              Assign one or more stores to the new staff member. At least one
              store must be assigned during creation. Additional stores can be
              assigned later if required.
            </p>

            <div className="overflow-x-auto">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow className="border-b text-left">
                    <TableHead className="px-4 py-2 font-medium text-muted-foreground">
                      Store
                    </TableHead>
                    <TableHead className="px-4 py-2 w-24 font-medium text-muted-foreground text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading
                    ? Array.from({ length: 2 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    : data &&
                      data.map((store) => {
                        if (!store.id) return null;
                        const added = isAlreadyAdded(store.id);

                        return (
                          <TableRow
                            key={store.id}
                            className={`border-b last:border-0 ${added ? "bg-muted/20" : ""}`}
                          >
                            <TableCell className="px-4 py-2.5">
                              <span>{store.name}</span>
                              {added && (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 text-xs py-0"
                                >
                                  Assigned
                                </Badge>
                              )}
                            </TableCell>

                            <TableCell className="px-4 py-2.5 flex justify-end">
                              {added ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-24"
                                  onClick={() => handleRemoveStore(store)}
                                >
                                  <Minus className="h-3 w-3 mr-1" />
                                  Remove
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="default"
                                  className="h-8 w-24"
                                  onClick={() => handleAddStore(store)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Assign
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/suppliers")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2Icon className="animate-spin" />}
                {isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateStaffMember;
