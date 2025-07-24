import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth } from '@/lib/firebase'
import { useToastContext } from '@/components/providers/ToastProvider'

interface SignUpFormData {
  email: string
  password: string
  confirmPassword: string
}

export function SignUpForm() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SignUpFormData>()
  const { error: showError, success } = useToastContext()
  const password = watch('password')

  const onSubmit = async (data: SignUpFormData) => {
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password)
      success('Account created successfully!')
    } catch (error: any) {
      console.error('Sign up error:', error)
      
      let message = 'An error occurred during sign up. Please try again.'
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'An account with this email already exists. Please sign in instead.'
          break
        case 'auth/invalid-email':
          message = 'Please enter a valid email address.'
          break
        case 'auth/weak-password':
          message = 'Password is too weak. Please choose a stronger password.'
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
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: value => value === password || 'Passwords do not match'
          })}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating Account...' : 'Create Account'}
      </Button>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/auth/signin" className="text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </form>
  )
}