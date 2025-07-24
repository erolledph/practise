import React, { useState, useEffect } from 'react'
import { Settings as SettingsIcon, User, Bell, Shield, Palette } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { useToastContext } from '@/components/providers/ToastProvider'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { UserSettings } from '@/types'

export function Settings() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { user, userData } = useAuth()
  const { success, error } = useToastContext()

  useEffect(() => {
    loadSettings()
  }, [user])

  const loadSettings = async () => {
    if (!user) return

    try {
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'userSettingsDoc')
      const settingsDoc = await getDoc(settingsRef)
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data()
        setSettings({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as UserSettings)
      }
    } catch (err) {
      console.error('Error loading settings:', err)
      error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return

    setSaving(true)
    try {
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'userSettingsDoc')
      await updateDoc(settingsRef, {
        ...newSettings,
        updatedAt: new Date()
      })
      
      setSettings(prev => prev ? { ...prev, ...newSettings } : null)
      success('Settings saved successfully')
    } catch (err) {
      console.error('Error saving settings:', err)
      error('Failed to save settings')
    } finally {
      setSaving(false)
    }
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
        <h1 className="dashboard-title flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className="dashboard-subtitle">
          Manage your account preferences and application settings
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{userData?.email}</h3>
                  <Badge className={userData?.plan === 'premium' ? 'bg-primary/10 text-primary' : 'bg-secondary'}>
                    {userData?.plan} plan
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="form-group">
                  <Label>Email Address</Label>
                  <Input value={userData?.email || ''} disabled />
                  <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                </div>
                
                <div className="form-group">
                  <Label>Member Since</Label>
                  <Input value={userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : ''} disabled />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="form-group">
                  <Label>Blog Sites</Label>
                  <Input value={`${userData?.blogSites?.length || 0} of 3`} disabled />
                </div>
                
                <div className="form-group">
                  <Label>Product Sites</Label>
                  <Input value={`${userData?.productSites?.length || 0} of 3`} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="form-group">
                  <Label>Default Currency</Label>
                  <Select 
                    value={settings?.currency || 'USD'} 
                    onValueChange={(value) => saveSettings({ currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                      <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="form-group">
                  <Label>Timezone</Label>
                  <Select 
                    value={settings?.timezone || 'UTC'} 
                    onValueChange={(value) => saveSettings({ timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="form-group">
                  <Label>Date Format</Label>
                  <Select 
                    value={settings?.dateFormat || 'MM/DD/YYYY'} 
                    onValueChange={(value) => saveSettings({ dateFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="form-group">
                  <Label>Items Per Page</Label>
                  <Select 
                    value={settings?.itemsPerPage?.toString() || '25'} 
                    onValueChange={(value) => saveSettings({ itemsPerPage: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="form-group">
                <Label>Default Content Status</Label>
                <Select 
                  value={settings?.defaultContentStatus || 'draft'} 
                  onValueChange={(value) => saveSettings({ defaultContentStatus: value as 'draft' | 'published' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Notification settings will be available in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Security settings will be available in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}