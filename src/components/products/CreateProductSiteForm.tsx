import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { useToastContext } from '@/components/providers/ToastProvider'
import { createProductSite } from '@/lib/firebase-admin'
import { generateSlug } from '@/lib/utils'

interface CreateProductSiteFormData {
  name: string
  description?: string
  defaultCurrency: string
}

const currencies = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' }
]

export function CreateProductSiteForm() {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<CreateProductSiteFormData>({
    defaultValues: {
      defaultCurrency: 'USD'
    }
  })
  const { user, refreshUserData } = useAuth()
  const { success, error } = useToastContext()
  const navigate = useNavigate()
  
  const siteName = watch('name', '')
  const slug = siteName ? generateSlug(siteName) : ''

  const onSubmit = async (data: CreateProductSiteFormData) => {
    if (!user) return

    try {
      await createProductSite(user.uid, data.name, data.description)
      await refreshUserData()
      success('Product site created successfully!')
      navigate('/dashboard')
    } catch (err: any) {
      console.error('Error creating product site:', err)
      error('Failed to create product site. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="form-group">
        <Label htmlFor="name" className="form-label">Site Name *</Label>
        <Input
          id="name"
          placeholder="My Product Store"
          className="form-input"
          {...register('name', {
            required: 'Site name is required',
            minLength: {
              value: 3,
              message: 'Site name must be at least 3 characters'
            },
            maxLength: {
              value: 50,
              message: 'Site name must be less than 50 characters'
            }
          })}
        />
        {errors.name && (
          <p className="form-error">{errors.name.message}</p>
        )}
        {slug && (
          <p className="text-sm text-muted-foreground mt-1">
            URL slug: <code className="bg-muted px-1 py-0.5 rounded text-xs">{slug}</code>
          </p>
        )}
      </div>

      <div className="form-group">
        <Label htmlFor="description" className="form-label">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="A brief description of your product catalog..."
          className="min-h-[100px]"
          {...register('description', {
            maxLength: {
              value: 200,
              message: 'Description must be less than 200 characters'
            }
          })}
        />
        {errors.description && (
          <p className="form-error">{errors.description.message}</p>
        )}
      </div>

      <div className="form-group">
        <Label className="form-label">Default Currency *</Label>
        <Select onValueChange={(value) => setValue('defaultCurrency', value)} defaultValue="USD">
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((currency) => (
              <SelectItem key={currency.value} value={currency.value}>
                {currency.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Creating...' : 'Create Product Site'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate('/dashboard')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}