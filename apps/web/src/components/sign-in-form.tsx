import { Button } from '@flarekit/ui/components/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@flarekit/ui/components/field'
import { Input } from '@flarekit/ui/components/input'
import { Link, useSearch } from '@tanstack/react-router'
import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'

import { authClient } from '@/lib/auth-client'
import { getSafeAuthRedirect } from '@/lib/auth-redirect'

function getSignInErrorMessage(error: { code?: string; status?: number }) {
  if (error.status === 401 || error.code === 'INVALID_EMAIL_OR_PASSWORD') {
    return '邮箱或密码错误，请检查后重试。'
  }

  if (error.status === 429) {
    return '尝试次数过多，请稍后再试。'
  }

  return '登录失败，请稍后重试。'
}

export default function SignInForm() {
  const { redirect } = useSearch({ from: '/login' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGitHubSubmitting, setIsGitHubSubmitting] = useState(false)
  const isAuthenticating = isSubmitting || isGitHubSubmitting

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isAuthenticating) {
      return
    }

    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)

    try {
      const { error } = await authClient.signIn.email({
        email: String(formData.get('email')).trim(),
        password: String(formData.get('password')),
        rememberMe: true,
      })

      if (error) {
        toast.error(getSignInErrorMessage(error))
        return
      }

      window.location.replace(getSafeAuthRedirect(redirect))
    } catch {
      toast.error('暂时无法连接到登录服务，请检查网络后重试。')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGitHubSignIn() {
    if (isAuthenticating) {
      return
    }

    setIsGitHubSubmitting(true)

    try {
      const { error } = await authClient.signIn.social({
        provider: 'github',
        callbackURL: getSafeAuthRedirect(redirect),
      })

      if (error) {
        toast.error('GitHub 登录暂不可用，请检查 OAuth 配置。')
      }
    } catch {
      toast.error('暂时无法连接到 GitHub 登录服务。')
    } finally {
      setIsGitHubSubmitting(false)
    }
  }

  return (
    <form className='flex flex-col gap-6' onSubmit={handleSubmit}>
      <FieldGroup>
        <div className='flex flex-col items-center gap-1 text-center'>
          <h1 className='text-2xl font-bold'>登录您的账户</h1>
          <p className='text-muted-foreground text-sm text-balance'>
            请输入邮箱和密码以继续使用 Flarekit
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor='email'>邮箱</FieldLabel>
          <Input
            id='email'
            name='email'
            type='email'
            placeholder='m@example.com'
            autoComplete='email'
            required
          />
        </Field>
        <Field>
          <div className='flex items-center'>
            <FieldLabel htmlFor='password'>密码</FieldLabel>
            <a
              href='#'
              className='ml-auto text-sm underline-offset-4 hover:underline'
              onClick={(event) => {
                event.preventDefault()
                toast.info('密码找回功能尚未配置。')
              }}
            >
              忘记密码？
            </a>
          </div>
          <Input
            id='password'
            name='password'
            type='password'
            autoComplete='current-password'
            minLength={8}
            required
          />
        </Field>
        <Field>
          <Button type='submit' disabled={isAuthenticating}>
            {isSubmitting ? '登录中…' : '登录'}
          </Button>
        </Field>
        <FieldSeparator>或使用以下方式继续</FieldSeparator>
        <Field>
          <Button
            variant='outline'
            type='button'
            disabled={isAuthenticating}
            onClick={() => void handleGitHubSignIn()}
          >
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
              <path
                d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'
                fill='currentColor'
              />
            </svg>
            {isGitHubSubmitting ? '正在连接…' : '使用 GitHub 登录'}
          </Button>
          <FieldDescription className='text-center'>
            还没有账号？{' '}
            <Link to='/register' className='underline underline-offset-4'>
              注册
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
