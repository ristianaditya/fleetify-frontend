"use client"
import * as React from "react"
import {
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  FlaskConical,
} from "lucide-react"

export function HeaderSidebar() {
  return (
      <SidebarMenuButton
        size="lg"
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
      >
        <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-indigo-900 text-indigo-50">
          <FlaskConical />
        </div>
        <div className="ml-1 grid flex-1 text-left text-sm">
            <span className="mb-0.5 truncate leading-tight font-semibold">Fleetify Test</span>
        </div>
      </SidebarMenuButton>
  )
}
