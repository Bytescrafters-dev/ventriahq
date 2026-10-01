"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  IconBuildingStore,
  IconUsers,
  IconChevronRight,
} from "@tabler/icons-react";

const SETTINGS_ITEMS = [
  {
    label: "Stores",
    description: "Manage your stores, domains, and currency settings.",
    icon: IconBuildingStore,
    href: "/settings/stores",
  },
  {
    label: "Staff",
    description: "Manage staff accounts and their access to the dashboard.",
    icon: IconUsers,
    href: "/settings/staff",
  },
  // {
  //   label: "Admins",
  //   description: "Manage admin accounts and permissions.",
  //   icon: IconShieldLock,
  //   href: "/admins",
  // },
];

const Settings = () => {
  return (
    <div className="p-4 md:p-8 ">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your application preferences and configurations.
        </p>
      </div>

      <Card className="py-0">
        <CardContent className="p-0">
          {SETTINGS_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-4 px-4 py-4 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none">
                      {item.label}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  </div>
                  <IconChevronRight
                    size={16}
                    className="text-muted-foreground shrink-0"
                  />
                </Link>
                {index < SETTINGS_ITEMS.length - 1 && <Separator />}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
