'use client'

import { Button } from '@flarekit/ui/components/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@flarekit/ui/components/dialog'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@flarekit/ui/components/field'
import { Input } from '@flarekit/ui/components/input'
import { Switch } from '@flarekit/ui/components/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@flarekit/ui/components/tabs'
import { BellIcon, LoaderCircleIcon, UserRoundIcon, XIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { authClient } from '@/lib/auth-client'

export type SettingsTab = 'account' | 'notifications'

const SETTINGS_CONTENT = {
  account: {
    title: '账号设置',
    description: '更新你的个人资料和账号信息。',
  },
  notifications: {
    title: '通知设置',
    description: '选择你希望在此设备上接收的提醒。',
  },
} satisfies Record<SettingsTab, { title: string; description: string }>

interface NotificationPreferences {
  activityAlerts: boolean
  productUpdates: boolean
  weeklyDigest: boolean
}

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  activityAlerts: true,
  productUpdates: true,
  weeklyDigest: false,
}

function getNotificationStorageKey(userId: string) {
  return `flarekit:notification-preferences:${userId}:v1`
}

function readNotificationPreferences(userId: string): NotificationPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_NOTIFICATION_PREFERENCES
  }

  try {
    const storedValue = window.localStorage.getItem(getNotificationStorageKey(userId))
    if (!storedValue) {
      return DEFAULT_NOTIFICATION_PREFERENCES
    }

    const preferences = JSON.parse(storedValue) as Partial<NotificationPreferences>
    return {
      activityAlerts:
        typeof preferences.activityAlerts === 'boolean'
          ? preferences.activityAlerts
          : DEFAULT_NOTIFICATION_PREFERENCES.activityAlerts,
      productUpdates:
        typeof preferences.productUpdates === 'boolean'
          ? preferences.productUpdates
          : DEFAULT_NOTIFICATION_PREFERENCES.productUpdates,
      weeklyDigest:
        typeof preferences.weeklyDigest === 'boolean'
          ? preferences.weeklyDigest
          : DEFAULT_NOTIFICATION_PREFERENCES.weeklyDigest,
    }
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES
  }
}

interface SettingsDialogProps {
  initialTab: SettingsTab
  onNameChange: (name: string) => void
  onOpenChange: (open: boolean) => void
  open: boolean
  user: {
    id: string
    name: string
    email: string
  }
}

export function SettingsDialog({
  initialTab,
  onNameChange,
  onOpenChange,
  open,
  user,
}: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab)
  const [isSavingAccount, setIsSavingAccount] = useState(false)
  const [nameError, setNameError] = useState('')
  const [notifications, setNotifications] = useState(() => readNotificationPreferences(user.id))

  async function handleAccountSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    if (!name) {
      setNameError('请输入姓名。')
      return
    }

    if (name === user.name) {
      onOpenChange(false)
      return
    }

    setIsSavingAccount(true)
    setNameError('')

    try {
      const result = await authClient.updateUser({ name })
      if (result.error) {
        toast.error('账号信息更新失败')
        return
      }

      onNameChange(name)
      toast.success('账号信息已更新')
      onOpenChange(false)
    } catch {
      toast.error('账号信息更新失败')
    } finally {
      setIsSavingAccount(false)
    }
  }

  function handleNotificationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      window.localStorage.setItem(getNotificationStorageKey(user.id), JSON.stringify(notifications))
      toast.success('通知偏好已保存')
      onOpenChange(false)
    } catch {
      toast.error('通知偏好保存失败')
    }
  }

  const activeContent = SETTINGS_CONTENT[activeTab]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='h-[min(680px,calc(100vh-2rem))] gap-0 overflow-hidden p-0 sm:max-w-4xl'
        showCloseButton={false}
      >
        <Tabs
          value={activeTab}
          orientation='vertical'
          className='h-full min-h-0 gap-0 max-sm:flex-col'
          onValueChange={(value) => {
            if (value === 'account' || value === 'notifications') {
              setActiveTab(value)
            }
          }}
        >
          <div className='bg-sidebar text-sidebar-foreground border-sidebar-border flex shrink-0 flex-col border-b p-4 sm:w-60 sm:border-r sm:border-b-0 sm:p-5'>
            <DialogClose
              render={
                <Button
                  type='button'
                  variant='secondary'
                  size='icon-lg'
                  aria-label='关闭设置'
                  className='self-start'
                />
              }
            >
              <XIcon />
              <span className='sr-only'>关闭设置</span>
            </DialogClose>

            <TabsList className='mt-2 h-auto w-full gap-2 bg-transparent p-0 sm:mt-6'>
              <TabsTrigger
                value='account'
                className='text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground h-14 justify-start gap-2.5 rounded-lg px-3 text-base font-normal data-active:shadow-none'
              >
                <UserRoundIcon />
                账号
              </TabsTrigger>
              <TabsTrigger
                value='notifications'
                className='text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground h-14 justify-start gap-2.5 rounded-lg px-3 text-base font-normal data-active:shadow-none'
              >
                <BellIcon />
                通知
              </TabsTrigger>
            </TabsList>
          </div>

          <div className='flex min-h-0 min-w-0 flex-1 flex-col'>
            <DialogHeader className='border-b px-6 py-5'>
              <DialogTitle>{activeContent.title}</DialogTitle>
              <DialogDescription>{activeContent.description}</DialogDescription>
            </DialogHeader>

            <TabsContent value='account' className='min-h-0 overflow-y-auto p-6'>
              <form className='flex min-h-full flex-col gap-6' onSubmit={handleAccountSubmit}>
                <FieldGroup>
                  <Field data-invalid={Boolean(nameError)}>
                    <FieldLabel htmlFor='settings-name'>姓名</FieldLabel>
                    <Input
                      id='settings-name'
                      name='name'
                      defaultValue={user.name}
                      autoComplete='name'
                      maxLength={100}
                      aria-invalid={Boolean(nameError)}
                      onChange={() => setNameError('')}
                      required
                    />
                    <FieldDescription>此名称会显示在整个工作区中。</FieldDescription>
                    <FieldError>{nameError}</FieldError>
                  </Field>
                  <Field data-disabled>
                    <FieldLabel htmlFor='settings-email'>邮箱</FieldLabel>
                    <Input
                      id='settings-email'
                      type='email'
                      value={user.email}
                      autoComplete='email'
                      disabled
                    />
                    <FieldDescription>
                      当前尚未配置邮箱验证流程，暂不支持修改邮箱。
                    </FieldDescription>
                  </Field>
                </FieldGroup>

                <DialogFooter className='mx-0 mt-auto mb-0 rounded-lg'>
                  <DialogClose render={<Button type='button' variant='outline' />}>
                    取消
                  </DialogClose>
                  <Button type='submit' disabled={isSavingAccount}>
                    {isSavingAccount ? (
                      <LoaderCircleIcon data-icon='inline-start' className='animate-spin' />
                    ) : null}
                    {isSavingAccount ? '保存中…' : '保存更改'}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>

            <TabsContent value='notifications' className='min-h-0 overflow-y-auto p-6'>
              <form className='flex min-h-full flex-col gap-6' onSubmit={handleNotificationSubmit}>
                <FieldGroup>
                  <FieldLabel htmlFor='settings-activity-alerts'>
                    <Field orientation='horizontal'>
                      <FieldContent>
                        <FieldTitle>活动提醒</FieldTitle>
                        <FieldDescription>当工作区出现重要动态时接收提醒。</FieldDescription>
                      </FieldContent>
                      <Switch
                        id='settings-activity-alerts'
                        checked={notifications.activityAlerts}
                        onCheckedChange={(checked) =>
                          setNotifications((current) => ({
                            ...current,
                            activityAlerts: checked,
                          }))
                        }
                      />
                    </Field>
                  </FieldLabel>

                  <FieldLabel htmlFor='settings-product-updates'>
                    <Field orientation='horizontal'>
                      <FieldContent>
                        <FieldTitle>产品更新</FieldTitle>
                        <FieldDescription>接收新功能和产品改进通知。</FieldDescription>
                      </FieldContent>
                      <Switch
                        id='settings-product-updates'
                        checked={notifications.productUpdates}
                        onCheckedChange={(checked) =>
                          setNotifications((current) => ({
                            ...current,
                            productUpdates: checked,
                          }))
                        }
                      />
                    </Field>
                  </FieldLabel>

                  <FieldLabel htmlFor='settings-weekly-digest'>
                    <Field orientation='horizontal'>
                      <FieldContent>
                        <FieldTitle>每周摘要</FieldTitle>
                        <FieldDescription>每周接收一次工作区活动摘要。</FieldDescription>
                      </FieldContent>
                      <Switch
                        id='settings-weekly-digest'
                        checked={notifications.weeklyDigest}
                        onCheckedChange={(checked) =>
                          setNotifications((current) => ({
                            ...current,
                            weeklyDigest: checked,
                          }))
                        }
                      />
                    </Field>
                  </FieldLabel>
                </FieldGroup>

                <p className='text-muted-foreground text-sm'>通知偏好仅保存在当前设备。</p>

                <DialogFooter className='mx-0 mt-auto mb-0 rounded-lg'>
                  <DialogClose render={<Button type='button' variant='outline' />}>
                    取消
                  </DialogClose>
                  <Button type='submit'>保存偏好</Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
