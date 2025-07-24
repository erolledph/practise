import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface QuickStatsProps {
  stats: Array<{
    label: string
    value: string | number
    change?: {
      value: number
      type: 'increase' | 'decrease' | 'neutral'
      period: string
    }
    icon?: React.ComponentType<{ className?: string }>
  }>
  className?: string
}

export function QuickStats({ stats, className }: QuickStatsProps) {
  const getTrendIcon = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return <TrendingUp className="h-3 w-3" />
      case 'decrease':
        return <TrendingDown className="h-3 w-3" />
      default:
        return <Minus className="h-3 w-3" />
    }
  }

  const getTrendColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return 'text-green-600 dark:text-green-400'
      case 'decrease':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      {stats.map((stat, index) => (
        <Card key={index} className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            {stat.icon && <stat.icon className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.change && (
              <div className={cn(
                'flex items-center text-xs mt-1',
                getTrendColor(stat.change.type)
              )}>
                {getTrendIcon(stat.change.type)}
                <span className="ml-1">
                  {stat.change.value > 0 ? '+' : ''}{stat.change.value}% {stat.change.period}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}