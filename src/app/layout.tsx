import type { Metadata } from "next";
import { Providers } from "./providers";
import { AppSidebar } from "@/components/main-cms/sidebar/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import "./globals.css";
import { LinkHeader } from '../components/main-cms/sidebar/link-header';

export const metadata: Metadata = {
  title: "Fleetify : Test",
  description: "Attendance management system",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                  />
                  <LinkHeader />
                </div>
              </header>
              {children}
            </SidebarInset>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
