import React from 'react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { SignUpForm } from '@/components/auth/SignUpForm'

export function SignUp() {
  return (
    <AuthLayout 
      title="Create Account" 
      description="Sign up to get started with Firebase CMS"
    >
      <SignUpForm />
    </AuthLayout>
  )
}