/**
 * Image processing utilities for file uploads and optimization
 */

export interface ImageProcessingOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

export interface ProcessedImage {
  file: File
  dataUrl: string
  dimensions: {
    width: number
    height: number
  }
  originalSize: number
  compressedSize: number
  compressionRatio: string
}

/**
 * Compress and resize an image file
 */
export async function processImage(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'))
            return
          }

          const compressedFile = new File([blob], file.name, {
            type: `image/${format}`,
            lastModified: Date.now()
          })

          const compressionRatio = ((1 - blob.size / file.size) * 100).toFixed(1)

          resolve({
            file: compressedFile,
            dataUrl: canvas.toDataURL(`image/${format}`, quality),
            dimensions: { width, height },
            originalSize: file.size,
            compressedSize: blob.size,
            compressionRatio: `${compressionRatio}%`
          })
        },
        `image/${format}`,
        quality
      )
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Validate image file type and size
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.'
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Please upload an image smaller than 10MB.'
    }
  }

  return { valid: true }
}

/**
 * Generate thumbnail from image file
 */
export async function generateThumbnail(
  file: File,
  size: number = 150
): Promise<string> {
  return processImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'jpeg'
  }).then(result => result.dataUrl)
}

/**
 * Extract image metadata
 */
export async function getImageMetadata(file: File): Promise<{
  width: number
  height: number
  size: number
  type: string
  name: string
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        type: file.type,
        name: file.name
      })
    }

    img.onerror = () => {
      reject(new Error('Failed to load image metadata'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Create multiple image variants (thumbnail, medium, large)
 */
export async function createImageVariants(file: File): Promise<{
  thumbnail: ProcessedImage
  medium: ProcessedImage
  large: ProcessedImage
}> {
  const [thumbnail, medium, large] = await Promise.all([
    processImage(file, { maxWidth: 150, maxHeight: 150, quality: 0.7 }),
    processImage(file, { maxWidth: 800, maxHeight: 600, quality: 0.8 }),
    processImage(file, { maxWidth: 1920, maxHeight: 1080, quality: 0.9 })
  ])

  return { thumbnail, medium, large }
}