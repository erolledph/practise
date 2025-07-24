import React, { useState, useEffect } from 'react'
import { Upload, File, Image, Trash2, Download, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/hooks/useAuth'
import { useToastContext } from '@/components/providers/ToastProvider'
import { uploadFile, getFiles, deleteFile } from '@/lib/firebase-admin'
import { formatFileSize, formatDate } from '@/lib/utils'
import { FileItem } from '@/types'

export function FileManager() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { user, userData } = useAuth()
  const { success, error } = useToastContext()

  useEffect(() => {
    loadFiles()
  }, [user])

  const loadFiles = async () => {
    if (!user) return
    
    try {
      const userFiles = await getFiles(user.uid)
      setFiles(userFiles)
    } catch (err) {
      console.error('Error loading files:', err)
      error('Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles || !user || !userData) return

    setUploading(true)
    
    try {
      const uploadPromises = Array.from(selectedFiles).map(async (file) => {
        const uploadedFile = await uploadFile(user.uid, file)
        return { ...uploadedFile, userEmail: userData.email }
      })

      const uploadedFiles = await Promise.all(uploadPromises)
      setFiles(prev => [...uploadedFiles, ...prev])
      success(`Successfully uploaded ${uploadedFiles.length} file(s)`)
    } catch (err) {
      console.error('Error uploading files:', err)
      error('Failed to upload files')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleDeleteFile = async (file: FileItem) => {
    if (!user) return

    try {
      await deleteFile(user.uid, file.id, file.storagePath)
      setFiles(prev => prev.filter(f => f.id !== file.id))
      success('File deleted successfully')
    } catch (err) {
      console.error('Error deleting file:', err)
      error('Failed to delete file')
    }
  }

  const filteredFiles = files.filter(file =>
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const getFileTypeColor = (type: string) => {
    if (type.startsWith('image/')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    if (type.startsWith('video/')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    if (type.startsWith('audio/')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="dashboard-header">
        <h1 className="dashboard-title">File Manager</h1>
        <p className="dashboard-subtitle">
          Upload and manage your media files
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />
          <Button asChild disabled={uploading} className="btn-primary">
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload Files'}
            </label>
          </Button>
        </div>
      </div>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Your Files ({filteredFiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No files found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No files match your search criteria.' : 'Upload your first file to get started.'}
              </p>
              {!searchTerm && (
                <Button asChild className="btn-primary">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files
                  </label>
                </Button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.type)}
                          <div>
                            <p className="font-medium">{file.originalName}</p>
                            {file.filename !== file.originalName && (
                              <p className="text-xs text-muted-foreground">{file.filename}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getFileTypeColor(file.type)}>
                          {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(file.size)}</TableCell>
                      <TableCell>{formatDate(file.uploadedAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(file.downloadURL, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete File</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p>Are you sure you want to delete "{file.originalName}"? This action cannot be undone.</p>
                                <div className="flex gap-2 justify-end">
                                  <Button variant="outline">Cancel</Button>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => handleDeleteFile(file)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}