import { Clock, FileText, ShoppingCart, Upload, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface ActivityItem {
  id: string
  type: 'blog_created' | 'blog_updated' | 'product_created' | 'product_updated' | 'file_uploaded' | 'settings_updated'
  title: string
  description?: string
  timestamp: Date
  metadata?: Record<string, any>
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  maxItems?: number
  showTimestamp?: boolean
  className?: string
}

export function ActivityFeed({
  activities,
  maxItems = 10,
  showTimestamp = true,
  className
}: ActivityFeedProps) {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'blog_created':
      case 'blog_updated':
        return FileText
      case 'product_created':
      case 'product_updated':
        return ShoppingCart
      case 'file_uploaded':
        return Upload
      case 'settings_updated':
        return Settings
      default:
        return Clock
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'blog_created':
      case 'product_created':
        return 'text-green-600 dark:text-green-400'
      case 'blog_updated':
      case 'product_updated':
        return 'text-blue-600 dark:text-blue-400'
      case 'file_uploaded':
        return 'text-purple-600 dark:text-purple-400'
      case 'settings_updated':
        return 'text-orange-600 dark:text-orange-400'
      default:
        return 'text-muted-foreground'
    }
  }

  const getActivityLabel = (type: ActivityItem['type']) => {
    switch (type) {
      case 'blog_created':
        return 'Blog Created'
      case 'blog_updated':
        return 'Blog Updated'
      case 'product_created':
        return 'Product Created'
      case 'product_updated':
        return 'Product Updated'
      case 'file_uploaded':
        return 'File Uploaded'
      case 'settings_updated':
        return 'Settings Updated'
      default:
        return 'Activity'
    }
  }

  const displayedActivities = activities.slice(0, maxItems)

  if (displayedActivities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type)
            const colorClass = getActivityColor(activity.type)
            
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`mt-1 ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <Badge variant="outline" className="text-xs">
                      {getActivityLabel(activity.type)}
                    </Badge>
                  </div>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground mb-1">
                      {activity.description}
                    </p>
                  )}
                  {showTimestamp && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(activity.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}