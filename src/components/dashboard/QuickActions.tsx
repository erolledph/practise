import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText, ShoppingCart, FolderOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User } from '@/types'

interface QuickActionsProps {
  userData: User | null
}

export function QuickActions({ userData }: QuickActionsProps) {
  const navigate = useNavigate()
  
  const blogSitesCount = userData?.blogSites?.length || 0
  const productSitesCount = userData?.productSites?.length || 0

  const actions = [
    {
      title: 'Create Blog Site',
      description: 'Start a new blog site',
      icon: FileText,
      onClick: () => navigate('/blog/create'),
      disabled: blogSitesCount >= 3,
      disabledText: 'Limit Reached'
    },
    {
      title: 'Create Product Site',
      description: 'Start a new product catalog',
      icon: ShoppingCart,
      onClick: () => navigate('/products/create'),
      disabled: productSitesCount >= 3,
      disabledText: 'Limit Reached'
    },
    {
      title: 'Upload Files',
      description: 'Manage your media files',
      icon: FolderOpen,
      onClick: () => navigate('/files'),
      disabled: false
    }
  ]

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start space-y-2 transition-smooth hover:shadow-md hover:border-primary/50"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              <div className="flex items-center gap-2 w-full">
                <action.icon className="h-4 w-4" />
                <span className="font-medium text-sm">
                  {action.title}
                  {action.disabled && ` (${action.disabledText})`}
                </span>
              </div>
              <span className="text-xs text-muted-foreground text-left">
                {action.description}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}