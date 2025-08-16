"use client"

import { type LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { pageActiveStore } from "@/stores/store"

export function NavMain({
  items,
}: {
  items: {
    titleName: string,
    title: boolean,
    menuList: {
      title: string,
      url: string,
      icon: LucideIcon,
    }[]
  }[]
}) {
  const router = useRouter()
  const { pageActive } = pageActiveStore()
  return (
    <SidebarGroup>
      {items.map((item) => (
        <div key={item.titleName}>
          {item.title && <SidebarGroupLabel className="text-gray-900">{item.titleName}</SidebarGroupLabel>}
          {item.menuList.map((menu) => (
          <SidebarMenu key={menu.title}>
              <SidebarMenuItem className="text-gray-700">
                <SidebarMenuButton tooltip={menu.title} isActive={menu.title == pageActive} onClick={() => router.push(menu.url)} className="h-11">
                  {menu.icon && <menu.icon className="text-indigo-700"/>}
                  <span className="font-medium">{menu.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
          </SidebarMenu>
          ))}
        </div>
      ))}
    </SidebarGroup>
  )
}
