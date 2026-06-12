import type { Metadata } from 'next'
import { SignInForm } from './sign-in-form'

export const metadata: Metadata = {
  title: 'Sign In - WikiSubmission',
  description: 'Sign in to your WikiSubmission account.',
}

export default function SignInPage() {
  return <SignInForm />
}
