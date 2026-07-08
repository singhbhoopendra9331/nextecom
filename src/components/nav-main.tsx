"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

function isActiveUrl(pathname: string, url: string) {
  if (url === "#") return false
  if (url === "/admin") {
    return pathname === "/admin" || pathname === "/admin/"
  }
  return pathname === url || pathname.startsWith(`${url}/`)
}

function CollapsibleNavItem({
  item,
  pathname,
}: {
  item: {
    title: string
    url: string
    icon?: LucideIcon
    items: { title: string; url: string }[]
  }
  pathname: string
}) {
  const hasParentLink = item.url !== "#"
  const isParentActive = hasParentLink && isActiveUrl(pathname, item.url)
  const isChildActive = item.items.some((sub) => isActiveUrl(pathname, sub.url))
  const isSectionActive = isParentActive || isChildActive
  const [open, setOpen] = React.useState(isSectionActive)

  React.useEffect(() => {
    if (isSectionActive) {
      setOpen(true)
    }
  }, [isSectionActive])

  return (
    <Collapsible
      asChild
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        {hasParentLink ? (
          <>
            <SidebarMenuButton
              asChild
              tooltip={item.title}
              isActive={isParentActive}
              className="pr-8"
            >
              <Link href={item.url}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
            <CollapsibleTrigger asChild>
              <SidebarMenuAction>
                <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                <span className="sr-only">Toggle {item.title} menu</span>
              </SidebarMenuAction>
            </CollapsibleTrigger>
          </>
        ) : (
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={item.title} isActive={isSectionActive}>
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
        )}
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  asChild
                  isActive={isActiveUrl(pathname, subItem.url)}
                >
                  <Link href={subItem.url}>
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>General</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          if (item.items?.length) {
            return (
              <CollapsibleNavItem
                key={item.title}
                item={{ ...item, items: item.items }}
                pathname={pathname}
              />
            )
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActiveUrl(pathname, item.url)}
              >
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
