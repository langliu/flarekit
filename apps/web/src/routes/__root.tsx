import { Toaster } from '@flarekit/ui/components/sonner'
import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import type { orpc } from '@/utils/orpc'

import Header from '../components/header'

import appCss from '../index.css?url'

const HEADERLESS_PATHS = new Set(['/login', '/register'])

function shouldHideHeader(pathname: string) {
  return (
    HEADERLESS_PATHS.has(pathname) ||
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/')
  )
}

export interface RouterAppContext {
  orpc: typeof orpc
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Flarekit',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
})

function RootDocument() {
  const hidesHeader = useRouterState({
    select: (state) => shouldHideHeader(state.location.pathname),
  })

  return (
    <html lang='en' className='dark'>
      <head>
        <HeadContent />
      </head>
      <body>
        <div className={hidesHeader ? 'h-svh' : 'grid h-svh grid-rows-[auto_1fr]'}>
          {hidesHeader ? null : <Header />}
          <Outlet />
        </div>
        <Toaster richColors />
        <TanStackRouterDevtools position='bottom-left' />
        <ReactQueryDevtools position='bottom' buttonPosition='bottom-right' />
        <Scripts />
      </body>
    </html>
  )
}
