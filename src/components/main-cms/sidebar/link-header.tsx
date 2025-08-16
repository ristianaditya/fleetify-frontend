"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { listMenu } from "@/constant";
import { pageActiveStore } from "@/stores/store"
import { useRouter } from "next/navigation"

export function LinkHeader(){
  const router = useRouter();
  const {pageActive} = pageActiveStore();
  const findUrlByTitle = (title: string) => {
    return listMenu
            .flatMap(section => section.menuList)
            .find(item => item.title == title)?.url || '#';
  }
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink onClick={() => router.push(findUrlByTitle(pageActive))}>
            { pageActive }
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>Data List</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}