import { SidebarInset, SidebarProvider } from '@flarekit/ui/components/sidebar'
import { Outlet, createFileRoute } from '@tanstack/react-router'
import type { CSSProperties } from 'react'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'

export const Route = createFileRoute('/_auth/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  const { session } = Route.useRouteContext()
  const user = session.data.user

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as CSSProperties
      }
    >
      <AppSidebar
        variant='inset'
        user={{
          name: user.name,
          email: user.email,
          avatar: user.image,
        }}
      />
      <SidebarInset>
        <SiteHeader />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
