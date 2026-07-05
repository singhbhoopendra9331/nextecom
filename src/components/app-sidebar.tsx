"use client";

import * as React from "react";
import { AudioWaveform } from "lucide-react";
import type { AppUserRole } from "@/lib/auth/roles";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { data } from "@/data/sidebar-data";
import { getNavForRole } from "@/lib/auth/filter-nav";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user?: {
    name: string;
    email: string;
    avatar: string;
  };
  role?: AppUserRole;
};

export function AppSidebar({
  user = data.user,
  role,
  ...props
}: AppSidebarProps) {
  const navMain = React.useMemo(
    () => (role ? getNavForRole(role) : data.navMain),
    [role]
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 justify-center pointer-events-none">
          <AudioWaveform className="h-6 w-6" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
