import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth } from '@/lib/firebase'
import { useToastContext } from '@/components/providers/ToastProvider'

interface SignInFormData {
  email: string
  password: string
}

export function SignInForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInFormData>()
  const { error: showError, success } = useToastContext()

  const onSubmit = async (data: SignInFormData) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password)
      success('Signed in successfully!')
    } catch (error: any) {
      console.error('Sign in error:', error)
      
      let message = 'An error occurred during sign in. Please try again.'
      
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'No account found with this email address. Please sign up first.'
          break
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          message = 'Invalid email or password. Please check your credentials.'
          break
        case 'auth/invalid-email':
          message = 'Please enter a valid email address.'
          break
        case 'auth/user-disabled':
          message = 'This account has been disabled. Please contact support.'
          break
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later.'
          break
      }
      
      showError(message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-group">
        <Label htmlFor="email" className="form-label">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          className="form-input"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Please enter a valid email address'
            }
          })}
        />
        {errors.email && (
          <p className="form-error">{errors.email.message}</p>
        )}
      </div>
      
      <div className="form-group">
        <Label htmlFor="password" className="form-label">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          className="form-input"
          {...register('password', {
            required: 'Password is required'
          })}
        />
        {errors.password && (
          <p className="form-error">{errors.password.message}</p>
        )}
      </div>
      
      <Button type="submit" className="w-full btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
      
      <div className="text-center space-y-2">
        <Link 
          to="/auth/reset" 
          className="text-sm text-muted-foreground hover:text-primary underline transition-smooth"
        >
          Forgot your password?
        </Link>
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/auth/signup" className="text-primary hover:underline transition-smooth font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </form>
  )
}