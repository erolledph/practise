import React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'draft' | 'published' | 'active' | 'inactive'
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'published':
        return 'status-published'
      case 'draft':
        return 'status-draft'
      case 'active':
        return 'status-active'
      case 'inactive':
        return 'status-inactive'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <Badge className={cn(getStatusStyles(status), className)}>
      {status}
    </Badge>
  )
}