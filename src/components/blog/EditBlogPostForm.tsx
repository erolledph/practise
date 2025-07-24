import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImagePicker } from '@/components/common/ImagePicker'
import { useAuth } from '@/hooks/useAuth'
import { useToastContext } from '@/components/providers/ToastProvider'
import { getDocument, updateDocument } from '@/lib/firebase-admin'
import { generateSlug, parseCommaSeparated } from '@/lib/utils'
import { BlogPost } from '@/types'

interface EditBlogPostFormData {
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

interface EditBlogPostFormProps {
  siteId: string
  postId: string
  siteName: string
}

export function EditBlogPostForm({ siteId, postId, siteName }: EditBlogPostFormProps) {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<EditBlogPostFormData>()
  const { user } = useAuth()
  const { success, error } = useToastContext()
  const navigate = useNavigate()
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [post, setPost] = useState<BlogPost | null>(null)
  
  const title = watch('title', '')
  const slug = title ? generateSlug(title) : ''

  useEffect(() => {
    loadPost()
  }, [user, postId])

  const loadPost = async () => {
    if (!user || !postId) return

    try {
      const postData = await getDocument(user.uid, 'blogPosts', postId) as BlogPost
      if (!postData) {
        error('Blog post not found')
        navigate(`/blog/${siteId}/manage-content`)
        return
      }

      setPost(postData)
      
      // Populate form with existing data
      reset({
        title: postData.title,
        content: postData.content,
        metaDescription: postData.metaDescription,
        seoTitle: postData.seoTitle,
        keywords: postData.keywords.join(', '),
        author: postData.author,
        categories: postData.categories.join(', '),
        tags: postData.tags.join(', '),
        status: postData.status
      })

      setContent(postData.content)

      // Set featured image if exists
      if (postData.featuredImageUrl) {
        setSelectedImages([{
          id: 'existing',
          url: postData.featuredImageUrl,
          name: 'Featured Image'
        }])
      }
    } catch (err) {
      console.error('Error loading blog post:', err)
      error('Failed to load blog post')
      navigate(`/blog/${siteId}/manage-content`)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: EditBlogPostFormData) => {
    if (!user || !post) return

    try {
      const updateData = {
        ...data,
        featuredImageUrl: selectedImages[0]?.url,
        keywords: parseCommaSeparated(data.keywords),
        categories: parseCommaSeparated(data.categories),
        tags: parseCommaSeparated(data.tags),
        slug: generateSlug(data.title),
        updatedAt: new Date()
      }

      await updateDocument(user.uid, 'blogPosts', postId, updateData)
      success('Blog post updated successfully!')
      navigate(`/blog/${siteId}/manage-content`)
    } catch (err: any) {
      console.error('Error updating blog post:', err)
      error('Failed to update blog post. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner-lg"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Blog post not found</h3>
        <p className="text-muted-foreground">The requested blog post could not be loaded.</p>
      </div>
    )
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
        <textarea
          id="metaDescription"
          placeholder="Brief description for search engines..."
          className="form-input min-h-[80px] resize-none"
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
        <Select onValueChange={(value) => setValue('status', value as 'draft' | 'published')} defaultValue={post.status}>
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
          {isSubmitting ? 'Updating...' : 'Update Blog Post'}
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