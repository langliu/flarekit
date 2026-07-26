import { Avatar, AvatarFallback, AvatarImage } from '@flarekit/ui/components/avatar'
import { Badge } from '@flarekit/ui/components/badge'
import { Button } from '@flarekit/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@flarekit/ui/components/card'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@flarekit/ui/components/dropdown-menu'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@flarekit/ui/components/empty'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@flarekit/ui/components/input-group'
import { Label } from '@flarekit/ui/components/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@flarekit/ui/components/select'
import { Separator } from '@flarekit/ui/components/separator'
import { Skeleton } from '@flarekit/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@flarekit/ui/components/table'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  CalendarDaysIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Clock3Icon,
  CopyIcon,
  EllipsisIcon,
  FingerprintIcon,
  MailIcon,
  SearchIcon,
  UserRoundIcon,
  UsersIcon,
} from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'

import { orpc } from '@/utils/orpc'

export const Route = createFileRoute('/_auth/dashboard/users')({
  component: UsersPage,
})

const PAGE_SIZE = 10
const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '已验证', value: 'verified' },
  { label: '未验证', value: 'unverified' },
] as const

type StatusFilter = (typeof statusOptions)[number]['value']

interface UserListItem {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  createdAt: number
  updatedAt: number
}

const dateTimeFormatter = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const initials =
    parts.length === 1
      ? Array.from(parts[0] ?? '')
          .slice(0, 2)
          .join('')
      : parts.map((part) => part[0]).join('')

  return initials.slice(0, 2).toUpperCase() || '用户'
}

function formatDate(timestamp: number) {
  return dateTimeFormatter.format(new Date(timestamp))
}

async function copyText(value: string, successMessage: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(successMessage)
  } catch {
    toast.error('复制失败，请手动复制')
  }
}

function UsersPage() {
  const { session } = Route.useRouteContext()
  const currentUserId = session.data?.user.id
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState('')
  const [status, setStatus] = React.useState<StatusFilter>('all')
  const [selectedUser, setSelectedUser] = React.useState<UserListItem | null>(null)
  const deferredSearch = React.useDeferredValue(search.trim())

  const users = useQuery(
    orpc.users.list.queryOptions({
      input: {
        page,
        pageSize: PAGE_SIZE,
        search: deferredSearch,
        status,
      },
    }),
  )

  const total = users.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const firstResult = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const lastResult = Math.min(page * PAGE_SIZE, total)

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value)
    setPage(1)
  }

  function handleStatusChange(value: StatusFilter | null) {
    if (!value) {
      return
    }
    setStatus(value)
    setPage(1)
  }

  return (
    <main className='flex flex-1 flex-col gap-6 p-4 md:p-6'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-2xl font-semibold tracking-tight'>用户</h2>
        <p className='text-muted-foreground'>查看平台注册用户及账号验证状态。</p>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <UserSummaryCard
          title='全部用户'
          value={users.data?.summary.total}
          description='已注册账号总数'
          icon={<UsersIcon />}
          loading={users.isLoading}
        />
        <UserSummaryCard
          title='已验证'
          value={users.data?.summary.verified}
          description='已完成邮箱验证'
          icon={<CheckCircle2Icon />}
          loading={users.isLoading}
        />
        <UserSummaryCard
          title='待验证'
          value={users.data?.summary.unverified}
          description='尚未完成邮箱验证'
          icon={<MailIcon />}
          loading={users.isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
            <div className='flex flex-col gap-1'>
              <CardTitle>用户列表</CardTitle>
              <CardDescription>搜索用户并查看账号详情。</CardDescription>
            </div>
            <div className='flex flex-col gap-2 sm:flex-row'>
              <InputGroup className='sm:w-72'>
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput
                  aria-label='搜索用户'
                  placeholder='搜索姓名或邮箱'
                  value={search}
                  onChange={handleSearchChange}
                />
              </InputGroup>
              <Label htmlFor='user-status-filter' className='sr-only'>
                验证状态
              </Label>
              <Select items={statusOptions} value={status} onValueChange={handleStatusChange}>
                <SelectTrigger id='user-status-filter' className='w-full sm:w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectGroup>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <div className='overflow-hidden rounded-lg border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className='hidden md:table-cell'>注册时间</TableHead>
                  <TableHead className='hidden lg:table-cell'>最近更新</TableHead>
                  <TableHead className='w-12'>
                    <span className='sr-only'>操作</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.isLoading ? (
                  <UsersTableSkeleton />
                ) : users.data?.items.length ? (
                  users.data.items.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className='flex min-w-0 items-center gap-3'>
                          <Avatar>
                            {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div className='flex min-w-0 flex-col'>
                            <div className='flex items-center gap-2'>
                              <span className='truncate font-medium'>{user.name}</span>
                              {user.id === currentUserId ? (
                                <Badge variant='secondary'>你</Badge>
                              ) : null}
                            </div>
                            <span className='text-muted-foreground truncate text-sm'>
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <VerificationBadge verified={user.emailVerified} />
                      </TableCell>
                      <TableCell className='text-muted-foreground hidden md:table-cell'>
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className='text-muted-foreground hidden lg:table-cell'>
                        {formatDate(user.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant='ghost' size='icon-sm' aria-label='用户操作' />}
                          >
                            <EllipsisIcon />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuGroup>
                              <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                                <UserRoundIcon />
                                查看详情
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => copyText(user.email, '邮箱已复制')}>
                                <CopyIcon />
                                复制邮箱
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Empty className='min-h-64'>
                        <EmptyHeader>
                          <EmptyMedia variant='icon'>
                            <SearchIcon />
                          </EmptyMedia>
                          <EmptyTitle>未找到用户</EmptyTitle>
                          <EmptyDescription>请尝试修改搜索内容或验证状态。</EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-muted-foreground text-sm'>
              {users.isLoading
                ? '正在加载用户…'
                : `显示 ${firstResult}–${lastResult}，共 ${total} 位用户`}
            </p>
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground text-sm'>
                第 {page} / {totalPages} 页
              </span>
              <Button
                variant='outline'
                size='icon-sm'
                aria-label='上一页'
                disabled={page <= 1 || users.isLoading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                variant='outline'
                size='icon-sm'
                aria-label='下一页'
                disabled={page >= totalPages || users.isLoading}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              >
                <ChevronRightIcon />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <UserDetailsDialog user={selectedUser} onOpenChange={setSelectedUser} />
    </main>
  )
}

function UserSummaryCard({
  title,
  value,
  description,
  icon,
  loading,
}: {
  title: string
  value: number | undefined
  description: string
  icon: React.ReactNode
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between gap-4'>
          <CardDescription>{title}</CardDescription>
          <div className='text-muted-foreground'>{icon}</div>
        </div>
        <CardTitle>{loading ? <Skeleton className='h-7 w-16' /> : value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-muted-foreground text-sm'>{description}</p>
      </CardContent>
    </Card>
  )
}

function VerificationBadge({ verified }: { verified: boolean }) {
  return (
    <Badge variant={verified ? 'secondary' : 'outline'}>{verified ? '已验证' : '未验证'}</Badge>
  )
}

function UsersTableSkeleton() {
  return Array.from({ length: 5 }, (_, index) => (
    <TableRow key={index}>
      <TableCell>
        <div className='flex items-center gap-3'>
          <Skeleton className='size-8 rounded-full' />
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-3 w-44' />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className='h-5 w-16 rounded-full' />
      </TableCell>
      <TableCell className='hidden md:table-cell'>
        <Skeleton className='h-4 w-28' />
      </TableCell>
      <TableCell className='hidden lg:table-cell'>
        <Skeleton className='h-4 w-28' />
      </TableCell>
      <TableCell>
        <Skeleton className='size-7' />
      </TableCell>
    </TableRow>
  ))
}

function UserDetailsDialog({
  user,
  onOpenChange,
}: {
  user: UserListItem | null
  onOpenChange: (user: UserListItem | null) => void
}) {
  return (
    <Dialog
      open={Boolean(user)}
      onOpenChange={(open) => {
        if (!open) {
          onOpenChange(null)
        }
      }}
    >
      <DialogContent className='max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain sm:max-w-lg sm:p-6'>
        <DialogHeader className='pr-8'>
          <DialogTitle>用户详情</DialogTitle>
          <DialogDescription>查看该用户的公开账号信息。</DialogDescription>
        </DialogHeader>
        {user ? (
          <div className='flex flex-col gap-5'>
            <div className='bg-muted/30 flex items-center gap-3 rounded-xl border p-4'>
              <Avatar size='lg'>
                {user.image ? (
                  <AvatarImage src={user.image} alt={user.name} width={40} height={40} />
                ) : null}
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className='flex min-w-0 flex-1 flex-col gap-1'>
                <span className='truncate font-medium'>{user.name}</span>
                <span
                  className='text-muted-foreground truncate text-sm'
                  title={user.email}
                  translate='no'
                >
                  {user.email}
                </span>
              </div>
              <VerificationBadge verified={user.emailVerified} />
            </div>
            <Separator />
            <dl className='grid gap-3 text-sm sm:grid-cols-2'>
              <div className='flex flex-col gap-2 rounded-lg border p-3 sm:col-span-2'>
                <dt className='text-muted-foreground flex items-center gap-2'>
                  <FingerprintIcon aria-hidden='true' />
                  用户 ID
                </dt>
                <dd className='flex min-w-0 items-center gap-2'>
                  <code
                    className='bg-muted min-w-0 flex-1 rounded-md px-2.5 py-2 font-mono text-xs break-all'
                    translate='no'
                  >
                    {user.id}
                  </code>
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    aria-label='复制用户 ID'
                    onClick={() => copyText(user.id, '用户 ID 已复制')}
                  >
                    <CopyIcon aria-hidden='true' />
                  </Button>
                </dd>
              </div>
              <div className='flex flex-col gap-2 rounded-lg border p-3'>
                <dt className='text-muted-foreground flex items-center gap-2'>
                  <CalendarDaysIcon aria-hidden='true' />
                  注册时间
                </dt>
                <dd className='tabular-nums'>
                  <time dateTime={new Date(user.createdAt).toISOString()}>
                    {formatDate(user.createdAt)}
                  </time>
                </dd>
              </div>
              <div className='flex flex-col gap-2 rounded-lg border p-3'>
                <dt className='text-muted-foreground flex items-center gap-2'>
                  <Clock3Icon aria-hidden='true' />
                  最近更新
                </dt>
                <dd className='tabular-nums'>
                  <time dateTime={new Date(user.updatedAt).toISOString()}>
                    {formatDate(user.updatedAt)}
                  </time>
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
        <DialogFooter className='sm:-mx-6 sm:-mb-6'>
          {user ? (
            <Button variant='outline' onClick={() => copyText(user.email, '邮箱已复制')}>
              <CopyIcon data-icon='inline-start' aria-hidden='true' />
              复制邮箱
            </Button>
          ) : null}
          <DialogClose render={<Button />}>完成</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
