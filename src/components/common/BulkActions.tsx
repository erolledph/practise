import React from 'react'
import { Trash2, Eye, EyeOff, Download, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface BulkAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'destructive' | 'outline'
  onClick: () => void
}

interface BulkActionsProps {
  selectedCount: number
  onClearSelection: () => void
  actions: BulkAction[]
  className?: string
}

export function BulkActions({
  selectedCount,
  onClearSelection,
  actions,
  className
}: BulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div className={`flex items-center gap-3 p-3 bg-muted/50 rounded-lg border ${className}`}>
      <Badge variant="secondary" className="font-medium">
        {selectedCount} selected
      </Badge>
      
      <div className="flex items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant || 'outline'}
            size="sm"
            onClick={action.onClick}
            className="h-8"
          >
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="ml-auto h-8"
      >
        Clear Selection
      </Button>
    </div>
  )
}

// Common bulk actions for content management
export const getBlogPostBulkActions = (
  onDelete: () => void,
  onPublish: () => void,
  onUnpublish: () => void,
  onExport: () => void
): BulkAction[] => [
  {
    id: 'publish',
    label: 'Publish',
    icon: Eye,
    onClick: onPublish
  },
  {
    id: 'unpublish',
    label: 'Unpublish',
    icon: EyeOff,
    onClick: onUnpublish
  },
  {
    id: 'export',
    label: 'Export',
    icon: Download,
    onClick: onExport
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    variant: 'destructive',
    onClick: onDelete
  }
]

export const getProductBulkActions = (
  onDelete: () => void,
  onPublish: () => void,
  onUnpublish: () => void,
  onExport: () => void
): BulkAction[] => [
  {
    id: 'publish',
    label: 'Publish',
    icon: Eye,
    onClick: onPublish
  },
  {
    id: 'unpublish',
    label: 'Unpublish',
    icon: EyeOff,
    onClick: onUnpublish
  },
  {
    id: 'export',
    label: 'Export',
    icon: Download,
    onClick: onExport
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    variant: 'destructive',
    onClick: onDelete
  }
]