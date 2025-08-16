"use client"

import * as React from "react"

import { NavMain } from "@/components/main-cms/sidebar/nav-main"
import { NavUser } from "@/components/main-cms/sidebar/nav-user"
import { HeaderSidebar } from "@/components/main-cms/sidebar/header-sidebar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { listMenu } from "@/constant"

const userData = {
  name: "ristianaditya",
  email: "ristianaditya35@gmail.com",
  avatar: "/avatars/shadcn.jpg",
}

function useNavMainItems() {
  return React.useMemo(() => listMenu, []);
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navMainItems = useNavMainItems();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <HeaderSidebar />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
      </SidebarContent>
      <DropdownMenuSeparator />
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
