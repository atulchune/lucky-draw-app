import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function SignUpSuccess() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="text-5xl">✓</div>
            </div>
            <CardTitle className="text-2xl">Account Created Successfully</CardTitle>
            <CardDescription>
              Please check your email to confirm your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                A confirmation email has been sent to your inbox. Click the link in the email to verify your account and complete the sign-up process.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Once confirmed, you can log in to your account and start creating contests.
              </p>
              <Link href="/auth/login" className="block">
                <Button className="w-full">Go to Login</Button>
              </Link>
            </div>

            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
              <p>Didn&apos;t receive the email?</p>
              <p className="mt-1">
                Check your spam folder or{' '}
                <Link href="/auth/sign-up" className="text-blue-600 hover:underline dark:text-blue-400">
                  try again
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
