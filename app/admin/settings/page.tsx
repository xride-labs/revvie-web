'use client'

import { useEffect, useMemo, useState } from 'react'
import type { AdminSettings } from '@/entities/admin/model'
import currencyCodes from 'currency-codes'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bell, Globe, Save, RotateCcw } from 'lucide-react'
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/features/admin/api'
import { toast } from 'sonner'

const CURRENCY_LIST = currencyCodes.data
  .map((c) => ({ code: c.code, name: c.currency }))
  .sort((a, b) => {
    if (a.code === 'INR') return -1
    if (b.code === 'INR') return 1
    if (a.code === 'USD') return -1
    if (b.code === 'USD') return 1
    return a.name.localeCompare(b.name)
  })

const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST, UTC+5:30)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST, UTC+4)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT, UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST, UTC+9)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET, UTC+1)' },
  { value: 'America/New_York', label: 'America/New York (EST, UTC-5)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST, UTC-6)' },
  { value: 'America/Denver', label: 'America/Denver (MST, UTC-7)' },
  { value: 'America/Los_Angeles', label: 'America/Los Angeles (PST, UTC-8)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST, UTC+10)' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZST, UTC+12)' },
  { value: 'UTC', label: 'UTC' },
]

export default function AdminSettingsPage() {
  const { data: fetchedSettings, isLoading } = useGetSettingsQuery()
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation()

  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [initialSettings, setInitialSettings] = useState<AdminSettings | null>(null)

  useEffect(() => {
    if (fetchedSettings) {
      setSettings(fetchedSettings)
      setInitialSettings(fetchedSettings)
    }
  }, [fetchedSettings])

  const isDirty = useMemo(() => {
    if (!settings || !initialSettings) return false
    return JSON.stringify(settings) !== JSON.stringify(initialSettings)
  }, [settings, initialSettings])

  const updateSetting = <K extends keyof AdminSettings>(
    key: K,
    value: AdminSettings[K],
  ) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const handleSave = async () => {
    if (!settings) return
    try {
      const updated = await updateSettings(settings).unwrap()
      setSettings(updated)
      setInitialSettings(updated)
      toast.success('Settings saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings')
    }
  }

  const handleReset = () => {
    if (!initialSettings) return
    setSettings(initialSettings)
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading settings...</div>
  }

  if (!settings) {
    return <div className="text-sm text-destructive">Failed to load settings</div>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-72">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                General Settings
              </CardTitle>
              <CardDescription>Configure basic application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(event) => updateSetting('siteName', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={settings.siteUrl}
                    onChange={(event) => updateSetting('siteUrl', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    value={settings.supportEmail}
                    onChange={(event) =>
                      updateSetting('supportEmail', event.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => updateSetting('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultCurrency">Default Currency</Label>
                  <Select
                    value={settings.defaultCurrency}
                    onValueChange={(value) => updateSetting('defaultCurrency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {CURRENCY_LIST.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.code} — {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Features</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Disable access for non-admin users
                      </p>
                    </div>
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) =>
                        updateSetting('maintenanceMode', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>New User Registration</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow new users to sign up
                      </p>
                    </div>
                    <Switch
                      checked={settings.allowRegistration}
                      onCheckedChange={(checked) =>
                        updateSetting('allowRegistration', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Marketplace</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable marketplace features
                      </p>
                    </div>
                    <Switch
                      checked={settings.marketplaceEnabled}
                      onCheckedChange={(checked) =>
                        updateSetting('marketplaceEnabled', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Club Creation</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow users to create clubs
                      </p>
                    </div>
                    <Switch
                      checked={settings.clubCreationEnabled}
                      onCheckedChange={(checked) =>
                        updateSetting('clubCreationEnabled', checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure admin notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>New User Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when new users sign up
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifyNewUser}
                    onCheckedChange={(checked) => updateSetting('notifyNewUser', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify on new user reports
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifyNewReports}
                    onCheckedChange={(checked) =>
                      updateSetting('notifyNewReports', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Club Verification Requests</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify on verification requests
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifyClubVerification}
                    onCheckedChange={(checked) =>
                      updateSetting('notifyClubVerification', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Critical system notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifySystemAlerts}
                    onCheckedChange={(checked) =>
                      updateSetting('notifySystemAlerts', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Daily Summary</Label>
                    <p className="text-sm text-muted-foreground">
                      Daily activity digest email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifyDailySummary}
                    onCheckedChange={(checked) =>
                      updateSetting('notifyDailySummary', checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" onClick={handleReset} disabled={!isDirty}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} disabled={isSaving || !isDirty}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
