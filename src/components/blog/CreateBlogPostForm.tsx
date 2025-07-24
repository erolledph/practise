import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImagePicker } from '@/components/common/ImagePicker'
import { useAuth } from '@/hooks/useAuth'
import { useToastContext } from '@/components/providers/ToastProvider'
import { createBlogPost } from '@/lib/firebase-admin'
import { generateSlug, parseCommaSeparated } from '@/lib/utils'

interface CreateBlogPostFormData {
  title: string
  content: string
  metaDescription?: string
  seoTitle?: string
  keywords: string
  author: string
  categories: string
  tags: string
  status: 'draft' | 'published'
}

interface SelectedImage {
  id: string
  url: string
  name: string
}

interface CreateBlogPostFormProps {
  siteId: string
}

export function CreateBlogPostForm({ siteId }: CreateBlogPostFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<CreateBlogPostFormData>({
    defaultValues: {
      status: 'draft',
      author: 'Admin'
    }
  })
  const { user } = useAuth()
  const { success, error } = useToastContext()
  const navigate = useNavigate()
  const [selectedImages, setSelectedImages] = React.useState<SelectedImage[]>([])
  const [content, setContent] = React.useState('')
  
  const title = watch('title', '')
  const slug = title ? generateSlug(title) : ''

  const onSubmit = async (data: CreateBlogPostFormData) => {
    if (!user) return

    try {
      const postData = {
        ...data,
        featuredImageUrl: selectedImages[0]?.url,
        keywords: parseCommaSeparated(data.keywords),
        categories: parseCommaSeparated(data.categories),
        tags: parseCommaSeparated(data.tags)
      }

      await createBlogPost(user.uid, siteId, postData)
      success('Blog post created successfully!')
      navigate(`/blog/${siteId}/manage-content`)
    } catch (err: any) {
      console.error('Error creating blog post:', err)
      error('Failed to create blog post. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="form-group">
          <Label htmlFor="title" className="form-label">Title *</Label>
          <Input
            id="title"
            placeholder="Enter post title"
            className="form-input"
            {...register('title', {
              required: 'Title is required',
              minLength: {
                value: 3,
                message: 'Title must be at least 3 characters'
              }
            })}
          />
          {errors.title && (
            <p className="form-error">{errors.title.message}</p>
          )}
          {slug && (
            <p className="text-sm text-muted-foreground mt-1">
              URL slug: <code className="bg-muted px-1 py-0.5 rounded text-xs">{slug}</code>
            </p>
          )}
        </div>

        <div className="form-group">
          <Label htmlFor="author" className="form-label">Author *</Label>
          <Input
            id="author"
            placeholder="Author name"
            className="form-input"
            {...register('author', {
              required: 'Author is required'
            })}
          />
          {errors.author && (
            <p className="form-error">{errors.author.message}</p>
          )}
        </div>
      </div>

      <div className="form-group">
        <Label htmlFor="content" className="form-label">Content *</Label>
        <div data-color-mode="light">
          <MDEditor
            value={content}
            onChange={(val) => {
              setContent(val || '')
              setValue('content', val || '')
            }}
            preview="edit"
            height={400}
            data-color-mode="light"
          />
        </div>
        <input
          type="hidden"
          {...register('content', {
            required: 'Content is required',
            minLength: { value: 10, message: 'Content must be at least 10 characters' }
          })}
        />
        {errors.content && <p className="form-error">{errors.content.message}</p>}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="form-group">
          <Label htmlFor="categories" className="form-label">Categories</Label>
          <Input
            id="categories"
            placeholder="Technology, Web Development, Tutorial"
            className="form-input"
            {...register('categories')}
          />
          <p className="text-sm text-muted-foreground">Separate multiple categories with commas</p>
        </div>

        <div className="form-group">
          <Label htmlFor="tags" className="form-label">Tags</Label>
          <Input
            id="tags"
            placeholder="react, javascript, tutorial"
            className="form-input"
            {...register('tags')}
          />
          <p className="text-sm text-muted-foreground">Separate multiple tags with commas</p>
        </div>
      </div>

      <div className="form-group">
        <Label className="form-label">Featured Image</Label>
        <ImagePicker
          maxFiles={1}
          onImagesSelected={setSelectedImages}
          initialImages={selectedImages}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="form-group">
          <Label htmlFor="seoTitle" className="form-label">SEO Title</Label>
          <Input
            id="seoTitle"
            placeholder="SEO optimized title"
            className="form-input"
            {...register('seoTitle')}
          />
        </div>

        <div className="form-group">
          <Label htmlFor="keywords" className="form-label">SEO Keywords</Label>
          <Input
            id="keywords"
            placeholder="react, tutorial, web development"
            className="form-input"
            {...register('keywords')}
          />
        </div>
      </div>

      <div className="form-group">
        <Label htmlFor="metaDescription" className="form-label">Meta Description</Label>
        <Textarea
          id="metaDescription"
          placeholder="Brief description for search engines..."
          className="min-h-[80px]"
          {...register('metaDescription', {
            maxLength: {
              value: 160,
              message: 'Meta description should be less than 160 characters'
            }
          })}
        />
        {errors.metaDescription && (
          <p className="form-error">{errors.metaDescription.message}</p>
        )}
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
          {isSubmitting ? 'Creating...' : 'Create Blog Post'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate(`/blog/${siteId}/manage-content`)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}