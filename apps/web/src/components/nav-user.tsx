import { Avatar, AvatarFallback, AvatarImage } from '@flarekit/ui/components/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@flarekit/ui/components/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@flarekit/ui/components/sidebar'
import { useNavigate } from '@tanstack/react-router'
import {
  EllipsisVerticalIcon,
  CircleUserRoundIcon,
  CreditCardIcon,
  BellIcon,
  LogOutIcon,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { authClient } from '@/lib/auth-client'

function getInitials(name: string, email: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()

  return initials || email.charAt(0).toUpperCase() || 'U'
}

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar?: string | null
  }
}) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const initials = getInitials(user.name, user.email)

  function handleSignOut() {
    if (isSigningOut) {
      return
    }

    setIsSigningOut(true)
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({
            to: '/login',
            replace: true,
          })
        },
        onError: () => {
          setIsSigningOut(false)
          toast.error('Failed to sign out')
        },
      },
    })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton size='lg' className='aria-expanded:bg-muted' />}
          >
            <Avatar className='size-8 rounded-lg grayscale'>
              <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
              <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
            </Avatar>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-medium'>{user.name}</span>
              <span className='text-foreground/70 truncate text-xs'>{user.email}</span>
            </div>
            <EllipsisVerticalIcon className='ml-auto size-4' />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='min-w-56'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                  <Avatar className='size-8'>
                    <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                    <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-medium'>{user.name}</span>
                    <span className='text-muted-foreground truncate text-xs'>{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <CircleUserRoundIcon />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant='destructive' disabled={isSigningOut} onClick={handleSignOut}>
              <LogOutIcon />
              {isSigningOut ? 'Signing out…' : 'Log out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
