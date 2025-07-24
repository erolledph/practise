import React from 'react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { PasswordResetForm } from '@/components/auth/PasswordResetForm'

export function PasswordReset() {
  return (
    <AuthLayout 
      title="Reset Password" 
      description="Enter your email address and we'll send you a link to reset your password"
    >
      <PasswordResetForm />
    </AuthLayout>
  )
}