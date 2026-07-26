import { Separator } from '@flarekit/ui/components/separator'
import { SidebarTrigger } from '@flarekit/ui/components/sidebar'
import { useRouterState } from '@tanstack/react-router'

export function SiteHeader() {
  const title = useRouterState({
    select: (state) =>
      state.location.pathname.startsWith('/dashboard/users') ? '用户' : 'Documents',
  })

  return (
    <header className='flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
      <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mx-2 h-4 data-vertical:self-auto' />
        <h1 className='text-base font-medium'>{title}</h1>
      </div>
    </header>
  )
}
