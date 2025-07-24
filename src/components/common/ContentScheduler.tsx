import { useState } from 'react'
import { Calendar, Clock, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

interface ScheduleOptions {
  publishDate?: Date
  publishTime?: string
  timezone: string
  autoPublish: boolean
  notifyOnPublish: boolean
}

interface ContentSchedulerProps {
  initialSchedule?: ScheduleOptions
  onScheduleChange: (schedule: ScheduleOptions) => void
  disabled?: boolean
}

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Australia/Sydney', label: 'Sydney' }
]

export function ContentScheduler({
  initialSchedule,
  onScheduleChange,
  disabled = false
}: ContentSchedulerProps) {
  const [schedule, setSchedule] = useState<ScheduleOptions>({
    timezone: 'UTC',
    autoPublish: false,
    notifyOnPublish: true,
    ...initialSchedule
  })

  const updateSchedule = (updates: Partial<ScheduleOptions>) => {
    const newSchedule = { ...schedule, ...updates }
    setSchedule(newSchedule)
    onScheduleChange(newSchedule)
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const getScheduleStatus = () => {
    if (!schedule.publishDate) return null
    
    const now = new Date()
    const publishDateTime = new Date(`${schedule.publishDate}T${schedule.publishTime || '00:00'}`)
    
    if (publishDateTime <= now) {
      return { type: 'past', label: 'Past Date' }
    } else if (publishDateTime <= new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
      return { type: 'soon', label: 'Publishing Soon' }
    } else {
      return { type: 'scheduled', label: 'Scheduled' }
    }
  }

  const scheduleStatus = getScheduleStatus()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Content Scheduling
          {scheduleStatus && (
            <Badge 
              variant={scheduleStatus.type === 'past' ? 'destructive' : 'default'}
              className="ml-auto"
            >
              {scheduleStatus.label}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto Publish Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Auto Publish</Label>
            <p className="text-sm text-muted-foreground">
              Automatically publish at scheduled time
            </p>
          </div>
          <Switch
            checked={schedule.autoPublish}
            onCheckedChange={(checked) => updateSchedule({ autoPublish: checked })}
            disabled={disabled}
          />
        </div>

        {schedule.autoPublish && (
          <>
            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publishDate">Publish Date</Label>
                <Input
                  id="publishDate"
                  type="date"
                  value={schedule.publishDate ? formatDate(schedule.publishDate) : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined
                    updateSchedule({ publishDate: date })
                  }}
                  disabled={disabled}
                  min={formatDate(new Date())}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="publishTime">Publish Time</Label>
                <Input
                  id="publishTime"
                  type="time"
                  value={schedule.publishTime || ''}
                  onChange={(e) => updateSchedule({ publishTime: e.target.value })}
                  disabled={disabled}
                />
              </div>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={schedule.timezone}
                onValueChange={(value) => updateSchedule({ timezone: value })}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notification Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notify on Publish</Label>
                <p className="text-sm text-muted-foreground">
                  Send notification when content is published
                </p>
              </div>
              <Switch
                checked={schedule.notifyOnPublish}
                onCheckedChange={(checked) => updateSchedule({ notifyOnPublish: checked })}
                disabled={disabled}
              />
            </div>

            {/* Schedule Preview */}
            {schedule.publishDate && schedule.publishTime && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Scheduled for:</span>
                </div>
                <p className="text-sm mt-1">
                  {new Date(`${schedule.publishDate}T${schedule.publishTime}`).toLocaleString('en-US', {
                    timeZone: schedule.timezone,
                    dateStyle: 'full',
                    timeStyle: 'short'
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {schedule.timezone}
                </p>
              </div>
            )}
          </>
        )}

        {!schedule.autoPublish && (
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <Send className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Content will be published immediately when you save
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}