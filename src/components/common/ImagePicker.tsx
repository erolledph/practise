import React, { useState, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SelectedImage {
  id: string
  url: string
  name: string
  isMain?: boolean
}

interface ImagePickerProps {
  maxFiles?: number
  onImagesSelected: (images: SelectedImage[]) => void
  initialImages?: SelectedImage[]
  showMainImageSelector?: boolean
  className?: string
}

export function ImagePicker({
  maxFiles = 1,
  onImagesSelected,
  initialImages = [],
  showMainImageSelector = false,
  className
}: ImagePickerProps) {
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>(initialImages)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = useCallback((files: FileList) => {
    const newImages: SelectedImage[] = []
    
    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('image/') && selectedImages.length + newImages.length < maxFiles) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const url = e.target?.result as string
          const image: SelectedImage = {
            id: `${Date.now()}_${index}`,
            url,
            name: file.name,
            isMain: selectedImages.length === 0 && newImages.length === 0
          }
          
          newImages.push(image)
          
          if (newImages.length === Math.min(files.length, maxFiles - selectedImages.length)) {
            const updatedImages = [...selectedImages, ...newImages]
            setSelectedImages(updatedImages)
            onImagesSelected(updatedImages)
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }, [selectedImages, maxFiles, onImagesSelected])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const removeImage = (imageId: string) => {
    const updatedImages = selectedImages.filter(img => img.id !== imageId)
    setSelectedImages(updatedImages)
    onImagesSelected(updatedImages)
  }

  const setMainImage = (imageId: string) => {
    const updatedImages = selectedImages.map(img => ({
      ...img,
      isMain: img.id === imageId
    }))
    setSelectedImages(updatedImages)
    onImagesSelected(updatedImages)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          selectedImages.length >= maxFiles && 'opacity-50 cursor-not-allowed'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <input
            type="file"
            multiple={maxFiles > 1}
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
            id="image-upload"
            disabled={selectedImages.length >= maxFiles}
          />
          
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
          
          {selectedImages.length >= maxFiles ? (
            <p className="text-muted-foreground">Maximum images selected</p>
          ) : (
            <>
              <p className="text-lg font-medium mb-2">
                {dragOver ? 'Drop images here' : 'Upload Images'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Drag & drop or click to select ({selectedImages.length}/{maxFiles})
              </p>
              <Button asChild variant="outline">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Files
                </label>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Selected Images */}
      {selectedImages.length > 0 && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          {selectedImages.map((image) => (
            <Card key={image.id} className="relative group">
              <CardContent className="p-2">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-32 object-cover rounded"
                />
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
                  {showMainImageSelector && (
                    <Button
                      variant={image.isMain ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => setMainImage(image.id)}
                    >
                      <Star className={cn('h-4 w-4', image.isMain && 'fill-current')} />
                    </Button>
                  )}
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImage(image.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {image.isMain && showMainImageSelector && (
                  <Badge className="absolute top-1 left-1 bg-primary">
                    Main
                  </Badge>
                )}
                
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {image.name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}