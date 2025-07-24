import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Download } from 'lucide-react'
import { ExportOptions, exportBlogPosts, exportProducts, downloadExport, getMimeType } from '@/lib/exportUtils'
import { BlogPost, Product } from '@/types'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: BlogPost[] | Product[]
  type: 'blog' | 'product'
  siteName: string
}

export function ExportDialog({
  open,
  onOpenChange,
  data,
  type,
  siteName
}: ExportDialogProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'json',
    includeMetadata: true,
    dateFormat: 'local'
  })
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    
    try {
      let exportedData: string
      
      if (type === 'blog') {
        exportedData = exportBlogPosts(data as BlogPost[], options)
      } else {
        exportedData = exportProducts(data as Product[], options)
      }
      
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `${siteName}-${type}-export-${timestamp}.${options.format}`
      const mimeType = getMimeType(options.format)
      
      downloadExport(exportedData, filename, mimeType)
      onOpenChange(false)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export {type === 'blog' ? 'Blog Posts' : 'Products'}
          </DialogTitle>
          <DialogDescription>
            Export your {type === 'blog' ? 'blog posts' : 'products'} in various formats.
            {data.length} items will be exported.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select
              value={options.format}
              onValueChange={(value) => setOptions(prev => ({ ...prev, format: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                {type === 'blog' && <SelectItem value="markdown">Markdown</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Date Format</Label>
            <Select
              value={options.dateFormat}
              onValueChange={(value) => setOptions(prev => ({ ...prev, dateFormat: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local Format</SelectItem>
                <SelectItem value="iso">ISO Format</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeMetadata"
              checked={options.includeMetadata}
              onCheckedChange={(checked) => 
                setOptions(prev => ({ ...prev, includeMetadata: checked as boolean }))
              }
            />
            <Label htmlFor="includeMetadata">Include metadata and SEO fields</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={exporting}
          >
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}