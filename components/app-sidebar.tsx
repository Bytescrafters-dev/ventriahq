"use client";

import React from "react";
import {
  IconDashboard,
  IconListDetails,
  IconBallVolleyball,
  IconUsersPlus,
  IconPackages,
  IconShoppingCart,
  IconTopologyStar3,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const navMain = [
  {
    title: "Dashboard",
    url: "/",
    icon: IconDashboard,
    collapsible: false,
    items: [],
  },
  {
    title: "Product Categories",
    url: "/product-categories",
    icon: IconListDetails,
    collapsible: true,
    items: [
      { title: "View Product Categories", url: "/product-categories" },
      { title: "Add Product Category", url: "/product-categories/create" },
    ],
  },
  {
    title: "Products",
    url: "/products",
    icon: IconBallVolleyball,
    collapsible: true,
    items: [
      { title: "View Products", url: "/products" },
      { title: "Add Product", url: "/products/create" },
    ],
  },
  {
    title: "Inventory",
    url: "/purchase-orders",
    icon: IconPackages,
    collapsible: true,
    items: [
      { title: "Purchase Orders", url: "/purchase-orders" },
      { title: "Stock Receipts", url: "/stock-receipts" },
    ],
  },
  {
    title: "Orders",
    url: "/orders",
    icon: IconShoppingCart,
    collapsible: true,
    items: [
      { title: "View Orders", url: "/orders" },
      { title: "New Order", url: "/orders/create" },
    ],
  },
  {
    title: "Suppliers",
    url: "/suppliers",
    icon: IconUsersPlus,
    collapsible: true,
    items: [
      { title: "View Suppliers", url: "/suppliers" },
      { title: "Add Supplier", url: "/suppliers/create" },
    ],
  },
  {
    title: "Leads",
    url: "/leads",
    icon: IconTopologyStar3,
    collapsible: true,
    items: [
      { title: "View Leads", url: "/leads" },
      { title: "Import Leads", url: "/leads/import" },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="#">
                <span className="text-xl font-semibold">Smart Wallets</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
