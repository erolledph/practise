import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth } from '@/lib/firebase'
import { useToastContext } from '@/components/providers/ToastProvider'

interface PasswordResetFormData {
  email: string
}

export function PasswordResetForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PasswordResetFormData>()
  const { error: showError, success } = useToastContext()

  const onSubmit = async (data: PasswordResetFormData) => {
    try {
      await sendPasswordResetEmail(auth, data.email)
      success('Password reset email sent! Please check your inbox.', 6000)
    } catch (error: any) {
      console.error('Password reset error:', error)
      
      let message = 'An error occurred while sending the reset email. Please try again.'
      
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'No account found with this email address. Please check your email or sign up.'
          break
        case 'auth/invalid-email':
          message = 'Please enter a valid email address.'
          break
        case 'auth/too-many-requests':
          message = 'Too many reset attempts. Please wait a moment before trying again.'
          break
      }
      
      showError(message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Please enter a valid email address'
            }
          })}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Reset Email'}
      </Button>
      
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link to="/auth/signin" className="text-primary hover:underline">
            Sign In
          </Link>
        </p>
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/auth/signup" className="text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </form>
  )
}