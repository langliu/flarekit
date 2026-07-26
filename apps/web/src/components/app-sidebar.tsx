import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@flarekit/ui/components/sidebar'
import {
  LayoutDashboardIcon,
  ListIcon,
  ChartBarIcon,
  FolderIcon,
  UsersIcon,
  CameraIcon,
  FileTextIcon,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
  DatabaseIcon,
  FileChartColumnIcon,
  FileIcon,
  CommandIcon,
} from 'lucide-react'
import * as React from 'react'

import { NavDocuments } from '@/components/nav-documents'
import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import { SettingsDialog, type SettingsTab } from '@/components/settings-dialog'

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '#',
      icon: <LayoutDashboardIcon />,
    },
    {
      title: 'Lifecycle',
      url: '#',
      icon: <ListIcon />,
    },
    {
      title: 'Analytics',
      url: '#',
      icon: <ChartBarIcon />,
    },
    {
      title: 'Projects',
      url: '#',
      icon: <FolderIcon />,
    },
    {
      title: 'Team',
      url: '#',
      icon: <UsersIcon />,
    },
  ],
  navClouds: [
    {
      title: 'Capture',
      icon: <CameraIcon />,
      isActive: true,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Proposal',
      icon: <FileTextIcon />,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Prompts',
      icon: <FileTextIcon />,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      action: 'settings' as const,
      icon: <Settings2Icon />,
    },
    {
      title: 'Get Help',
      url: '#',
      icon: <CircleHelpIcon />,
    },
    {
      title: 'Search',
      url: '#',
      icon: <SearchIcon />,
    },
  ],
  documents: [
    {
      name: 'Data Library',
      url: '#',
      icon: <DatabaseIcon />,
    },
    {
      name: 'Reports',
      url: '#',
      icon: <FileChartColumnIcon />,
    },
    {
      name: 'Word Assistant',
      url: '#',
      icon: <FileIcon />,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    id: string
    name: string
    email: string
    avatar?: string | null
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const [currentName, setCurrentName] = React.useState(user.name)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [settingsTab, setSettingsTab] = React.useState<SettingsTab>('account')

  function openSettings(tab: SettingsTab) {
    setSettingsTab(tab)
    setSettingsOpen(true)
  }

  return (
    <>
      <Sidebar collapsible='offcanvas' {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className='data-[slot=sidebar-menu-button]:p-1.5!'
                render={<a href='#' />}
              >
                <CommandIcon className='size-5!' />
                <span className='text-base font-semibold'>Acme Inc.</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
          <NavDocuments items={data.documents} />
          <NavSecondary
            items={data.navSecondary}
            className='mt-auto'
            onAction={() => openSettings('account')}
          />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={{ ...user, name: currentName }} onOpenSettings={openSettings} />
        </SidebarFooter>
      </Sidebar>
      {settingsOpen ? (
        <SettingsDialog
          open={settingsOpen}
          initialTab={settingsTab}
          user={{ ...user, name: currentName }}
          onNameChange={setCurrentName}
          onOpenChange={setSettingsOpen}
        />
      ) : null}
    </>
  )
}
