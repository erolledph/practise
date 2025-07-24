import React, { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image as ImageIcon, X, Star, StarOff, Eye, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useToastContext } from '@/components/providers/ToastProvider'
import { uploadFile, getFiles } from '@/lib/firebase-admin'
import { validateImageFile, processImage } from '@/lib/imageUtils'
import { formatFileSize } from '@/lib/utils'
import { FileItem } from '@/types'
import { cn } from '@/lib/utils'

interface SelectedImage {
  id: string
  url: string
  name: string
  isMain?: boolean
  file?: File
  isUploading?: boolean
}

interface ImagePickerProps {
  maxFiles: number
  onImagesSelected: (images: SelectedImage[]) => void
  initialImages?: SelectedImage[]
  className?: string
  disabled?: boolean
  showMainImageSelector?: boolean
}

export function ImagePicker({
  maxFiles,
  onImagesSelected,
  initialImages = [],
  className,
  disabled = false,
  showMainImageSelector = false
}: ImagePickerProps) {
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>(initialImages)
  const [availableFiles, setAvailableFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showFileBrowser, setShowFileBrowser] = useState(false)
  const { user, userData } = useAuth()
  const { success, error } = useToastContext()

  useEffect(() => {
    loadAvailableFiles()
  }, [user])

  useEffect(() => {
    onImagesSelected(selectedImages)
  }, [selectedImages, onImagesSelected])

  const loadAvailableFiles = async () => {
    if (!user) return
    
    try {
      const files = await getFiles(user.uid)
      const imageFiles = files.filter(file => file.type.startsWith('image/'))
      setAvailableFiles(imageFiles)
    } catch (err) {
      console.error('Error loading files:', err)
    }
  }

  const onDrop = async (acceptedFiles: File[]) => {
    if (disabled) return
    
    const remainingSlots = maxFiles - selectedImages.length
    const filesToProcess = acceptedFiles.slice(0, remainingSlots)
    
    if (filesToProcess.length === 0) {
      error(`Maximum ${maxFiles} images allowed`)
      return
    }

    setLoading(true)

    try {
      const newImages: SelectedImage[] = []

      for (const file of filesToProcess) {
        // Validate file
        const validation = validateImageFile(file)
        if (!validation.valid) {
          error(`${file.name}: ${validation.error}`)
          continue
        }

        // Create temporary image entry
        const tempId = `temp_${Date.now()}_${Math.random()}`
        const tempImage: SelectedImage = {
          id: tempId,
          url: URL.createObjectURL(file),
          name: file.name,
          file,
          isUploading: true
        }

        newImages.push(tempImage)
        setSelectedImages(prev => [...prev, tempImage])

        try {
          // Upload file
          const uploadedFile = await uploadFile(user!.uid, file)
          
          // Update with actual uploaded file data
          setSelectedImages(prev => 
            prev.map(img => 
              img.id === tempId 
                ? {
                    id: uploadedFile.id,
                    url: uploadedFile.downloadURL,
                    name: uploadedFile.originalName,
                    isUploading: false
                  }
                : img
            )
          )
        } catch (uploadError) {
          console.error('Upload error:', uploadError)
          error(`Failed to upload ${file.name}`)
          
          // Remove failed upload
          setSelectedImages(prev => prev.filter(img => img.id !== tempId))
          URL.revokeObjectURL(tempImage.url)
        }
      }

      if (newImages.length > 0) {
        success(`${newImages.length} image(s) uploaded successfully`)
        await loadAvailableFiles() // Refresh available files
      }
    } catch (err) {
      console.error('Error processing files:', err)
      error('Failed to process images')
    } finally {
      setLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: maxFiles - selectedImages.length,
    disabled: disabled || loading || selectedImages.length >= maxFiles
  })

  const removeImage = (imageId: string) => {
    setSelectedImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId)
      if (imageToRemove && imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url)
      }
      return prev.filter(img => img.id !== imageId)
    })
  }

  const setMainImage = (imageId: string) => {
    setSelectedImages(prev => 
      prev.map(img => ({
        ...img,
        isMain: img.id === imageId
      }))
    )
  }

  const selectFromFiles = (file: FileItem) => {
    if (selectedImages.length >= maxFiles) {
      error(`Maximum ${maxFiles} images allowed`)
      return
    }

    const newImage: SelectedImage = {
      id: file.id,
      url: file.downloadURL,
      name: file.originalName
    }

    setSelectedImages(prev => [...prev, newImage])
    setShowFileBrowser(false)
  }

  const canAddMore = selectedImages.length < maxFiles

  return (
    <div className={cn('space-y-4', className)}>
      {/* Selected Images Display */}
      {selectedImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Selected Images ({selectedImages.length}/{maxFiles})</h4>
            {showMainImageSelector && selectedImages.length > 1 && (
              <Badge variant="outline" className="text-xs">
                Click star to set main image
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {selectedImages.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                  {image.isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="loading-spinner h-6 w-6"></div>
                    </div>
                  )}
                </div>
                
                {/* Image Controls */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {showMainImageSelector && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setMainImage(image.id)}
                      disabled={image.isUploading}
                    >
                      {image.isMain ? (
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOff className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(image.id)}
                    disabled={image.isUploading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                {/* Main Image Badge */}
                {image.isMain && (
                  <div className="absolute bottom-2 left-2">
                    <Badge className="text-xs bg-yellow-500 text-white">
                      Main
                    </Badge>
                  </div>
                )}

                {/* Image Name */}
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {image.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div className="space-y-3">
          <Card
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed transition-colors cursor-pointer',
              isDragActive && 'border-primary bg-primary/5',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <CardContent className="flex flex-col items-center justify-center py-6 text-center">
              <input {...getInputProps()} />
              
              <Upload className={cn(
                'h-8 w-8 mb-3',
                isDragActive && 'text-primary'
              )} />
              
              {isDragActive ? (
                <p className="text-primary">Drop images here...</p>
              ) : (
                <div className="space-y-1">
                  <p className="font-medium">
                    Drag & drop images here, or click to select
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {maxFiles - selectedImages.length} more image{maxFiles - selectedImages.length !== 1 ? 's' : ''} allowed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Browse Files Button */}
          <div className="flex justify-center">
            <Dialog open={showFileBrowser} onOpenChange={setShowFileBrowser}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={disabled || loading}>
                  <Eye className="mr-2 h-4 w-4" />
                  Browse Uploaded Files
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Select from Uploaded Files</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[60vh]">
                  {availableFiles.length === 0 ? (
                    <div className="text-center py-8">
                      <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No images uploaded yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {availableFiles.map((file) => {
                        const isSelected = selectedImages.some(img => img.id === file.id)
                        
                        return (
                          <div key={file.id} className="relative group">
                            <div className={cn(
                              'aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer border-2 transition-colors',
                              isSelected ? 'border-primary' : 'border-transparent hover:border-muted-foreground'
                            )}>
                              <img
                                src={file.downloadURL}
                                alt={file.originalName}
                                className="w-full h-full object-cover"
                                onClick={() => !isSelected && selectFromFiles(file)}
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                  <Badge>Selected</Badge>
                                </div>
                              )}
                            </div>
                            <div className="mt-2">
                              <p className="text-xs font-medium truncate">{file.originalName}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="loading-spinner-lg"></div>
          <span className="ml-2 text-sm text-muted-foreground">Processing images...</span>
        </div>
      )}
    </div>
  )
}