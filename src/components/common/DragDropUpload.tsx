import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, Image, X, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { validateImageFile } from '@/lib/imageUtils'

interface UploadedFile {
  file: File
  preview?: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

interface DragDropUploadProps {
  onFilesSelected: (files: File[]) => void
  accept?: Record<string, string[]>
  maxFiles?: number
  maxSize?: number
  className?: string
  disabled?: boolean
}

export function DragDropUpload({
  onFilesSelected,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'text/*': ['.txt', '.md']
  },
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  disabled = false
}: DragDropUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const validFiles: File[] = []
    const newUploadedFiles: UploadedFile[] = []

    for (const file of acceptedFiles) {
      // Validate file
      if (file.type.startsWith('image/')) {
        const validation = validateImageFile(file)
        if (!validation.valid) {
          newUploadedFiles.push({
            file,
            progress: 0,
            status: 'error',
            error: validation.error
          })
          continue
        }
      }

      validFiles.push(file)
      
      // Create preview for images
      let preview: string | undefined
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file)
      }

      newUploadedFiles.push({
        file,
        preview,
        progress: 0,
        status: 'uploading'
      })
    }

    setUploadedFiles(prev => [...prev, ...newUploadedFiles])

    // Simulate upload progress
    for (const uploadFile of newUploadedFiles) {
      if (uploadFile.status === 'error') continue

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setUploadedFiles(prev => 
          prev.map((f) => 
            f.file === uploadFile.file 
              ? { ...f, progress }
              : f
          )
        )
      }

      // Mark as completed
      setUploadedFiles(prev => 
        prev.map(f => 
          f.file === uploadFile.file 
            ? { ...f, status: 'completed' }
            : f
        )
      )
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles)
    }
  }, [onFilesSelected])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections
  } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled
  })

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.file !== fileToRemove)
      // Revoke object URL to prevent memory leaks
      const fileData = prev.find(f => f.file === fileToRemove)
      if (fileData?.preview) {
        URL.revokeObjectURL(fileData.preview)
      }
      return updated
    })
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <Card
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragActive && !isDragReject && 'border-primary bg-primary/5',
          isDragReject && 'border-destructive bg-destructive/5',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <input {...getInputProps()} />
          
          <Upload className={cn(
            'h-12 w-12 mb-4',
            isDragActive && !isDragReject && 'text-primary',
            isDragReject && 'text-destructive'
          )} />
          
          {isDragActive ? (
            isDragReject ? (
              <p className="text-destructive">Some files are not supported</p>
            ) : (
              <p className="text-primary">Drop files here...</p>
            )
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-medium">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-muted-foreground">
                Supports images, PDFs, and text files up to {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="flex items-center gap-2 p-2 bg-destructive/10 rounded text-sm">
              <File className="h-4 w-4 text-destructive" />
              <span className="flex-1">{file.name}</span>
              <span className="text-destructive">
                {errors.map(e => e.message).join(', ')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Uploaded Files</h4>
          {uploadedFiles.map((uploadFile, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded">
              {uploadFile.preview ? (
                <img 
                  src={uploadFile.preview} 
                  alt={uploadFile.file.name}
                  className="h-10 w-10 object-cover rounded"
                />
              ) : (
                getFileIcon(uploadFile.file)
              )}
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{uploadFile.file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                
                {uploadFile.status === 'uploading' && (
                  <Progress value={uploadFile.progress} className="h-1 mt-1" />
                )}
                
                {uploadFile.status === 'error' && (
                  <p className="text-sm text-destructive mt-1">{uploadFile.error}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {uploadFile.status === 'completed' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(uploadFile.file)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}