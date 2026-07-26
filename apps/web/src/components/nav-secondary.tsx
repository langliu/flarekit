'use client'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@flarekit/ui/components/sidebar'
import * as React from 'react'

export function NavSecondary({
  items,
  onAction,
  ...props
}: {
  items: {
    title: string
    url?: string
    action?: 'settings'
    icon: React.ReactNode
  }[]
  onAction?: (action: 'settings') => void
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                type={item.action ? 'button' : undefined}
                onClick={item.action ? () => onAction?.('settings') : undefined}
                render={item.url ? <a href={item.url} /> : undefined}
              >
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
