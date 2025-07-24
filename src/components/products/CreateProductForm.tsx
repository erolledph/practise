import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImagePicker } from '@/components/common/ImagePicker'
import { useAuth } from '@/hooks/useAuth'
import { useToastContext } from '@/components/providers/ToastProvider'
import { createProduct } from '@/lib/firebase-admin'
import { generateSlug, parseCommaSeparated } from '@/lib/utils'

interface CreateProductFormData {
  name: string
  description?: string
  price: number
  originalPrice: number
  currency: string
  productUrl?: string
  category?: string
  tags: string
  status: 'draft' | 'published'
}

interface SelectedImage {
  id: string
  url: string
  name: string
  isMain?: boolean
}

interface CreateProductFormProps {
  siteId: string
  siteName: string
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

export function CreateProductForm({ siteId, siteName, defaultCurrency }: CreateProductFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<CreateProductFormData>({
    defaultValues: {
      status: 'draft',
      currency: defaultCurrency,
      originalPrice: 0
    }
  })
  const { user } = useAuth()
  const { success, error } = useToastContext()
  const navigate = useNavigate()
  const [selectedImages, setSelectedImages] = React.useState<SelectedImage[]>([])
  
  const name = watch('name', '')
  const price = watch('price', 0)
  const originalPrice = watch('originalPrice', 0)
  const slug = name ? generateSlug(name) : ''

  const onSubmit = async (data: CreateProductFormData) => {
    if (!user) return

    try {
      const productData = {
        ...data,
        imageUrl: selectedImages.find(img => img.isMain)?.url || selectedImages[0]?.url,
        imageUrls: selectedImages.map(img => img.url),
        price: Number(data.price),
        originalPrice: Number(data.originalPrice) || Number(data.price),
        tags: parseCommaSeparated(data.tags)
      }

      await createProduct(user.uid, siteId, productData)
      success('Product created successfully!')
      navigate(`/products/${siteId}/manage-products`)
    } catch (err: any) {
      console.error('Error creating product:', err)
      error('Failed to create product. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="form-group">
          <Label htmlFor="name" className="form-label">Product Name *</Label>
          <Input
            id="name"
            placeholder="Enter product name"
            className="form-input"
            {...register('name', {
              required: 'Product name is required',
              minLength: {
                value: 3,
                message: 'Product name must be at least 3 characters'
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
          <Label htmlFor="category" className="form-label">Category</Label>
          <Input
            id="category"
            placeholder="Electronics, Clothing, Books, etc."
            className="form-input"
            {...register('category')}
          />
        </div>
      </div>

      <div className="form-group">
        <Label htmlFor="description" className="form-label">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your product..."
          className="min-h-[120px]"
          {...register('description')}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="form-group">
          <Label htmlFor="price" className="form-label">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="form-input"
            {...register('price', {
              required: 'Price is required',
              min: {
                value: 0,
                message: 'Price must be positive'
              }
            })}
          />
          {errors.price && (
            <p className="form-error">{errors.price.message}</p>
          )}
        </div>

        <div className="form-group">
          <Label htmlFor="originalPrice" className="form-label">Original Price</Label>
          <Input
            id="originalPrice"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="form-input"
            {...register('originalPrice', {
              min: {
                value: 0,
                message: 'Original price must be positive'
              }
            })}
          />
          <p className="text-sm text-muted-foreground">Leave empty if no discount</p>
        </div>

        <div className="form-group">
          <Label className="form-label">Currency *</Label>
          <Select onValueChange={(value) => setValue('currency', value)} defaultValue={defaultCurrency}>
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
      </div>

      {originalPrice > price && price > 0 && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">
            Discount: {Math.round(((originalPrice - price) / originalPrice) * 100)}% off 
            (Save {(originalPrice - price).toFixed(2)} {watch('currency', defaultCurrency)})
          </p>
        </div>
      )}

      <div className="form-group">
        <Label className="form-label">Product Images</Label>
        <ImagePicker
          maxFiles={5}
          onImagesSelected={setSelectedImages}
          initialImages={selectedImages}
          showMainImageSelector={true}
        />
      </div>

      <div className="form-group">
          <Label htmlFor="productUrl" className="form-label">Product URL</Label>
          <Input
            id="productUrl"
            type="url"
            placeholder="https://example.com/product-page"
            className="form-input"
            {...register('productUrl')}
          />
      </div>

      <div className="form-group">
        <Label htmlFor="tags" className="form-label">Tags</Label>
        <Input
          id="tags"
          placeholder="electronics, smartphone, android"
          className="form-input"
          {...register('tags')}
        />
        <p className="text-sm text-muted-foreground">Separate multiple tags with commas</p>
      </div>

      <div className="form-group">
        <Label className="form-label">Status *</Label>
        <Select onValueChange={(value) => setValue('status', value as 'draft' | 'published')} defaultValue="draft">
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Creating...' : 'Create Product'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate(`/products/${siteId}/manage-products`)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}