'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ChevronLeft, AlertTriangle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { apiAuthenticated } from '@/lib/server/base'
import { signOut } from '@/lib/auth-client'

export default function ProfileSettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('privacy')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const [settings, setSettings] = useState({
    // Privacy
    profileVisibility: 'public',
    showLocation: true,
    showRideHistory: true,
    showClubs: true,
    allowMessages: 'everyone',

    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    rideReminders: true,
    clubUpdates: true,
    marketplaceAlerts: true,
    followerNotifications: true,

    // Units
    distanceUnit: 'miles',
    temperatureUnit: 'fahrenheit',
  })

  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE' || isDeleting) return
    setIsDeleting(true)
    try {
      await apiAuthenticated.delete('/account/me')
      toast.success('Your account has been permanently deleted')
      await signOut().catch(() => {})
      router.push('/')
    } catch {
      toast.error('Could not delete your account. Please contact support.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen p-4 lg:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account settings</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="account" className="text-red-600">
            Account
          </TabsTrigger>
        </TabsList>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Visibility</CardTitle>
                <CardDescription>
                  Control who can see your profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <Select
                    value={settings.profileVisibility}
                    onValueChange={(value) =>
                      setSettings({ ...settings, profileVisibility: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can view</SelectItem>
                      <SelectItem value="followers">Followers Only</SelectItem>
                      <SelectItem value="private">Private - Only you</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Location</p>
                    <p className="text-sm text-muted-foreground">
                      Display your city on your profile
                    </p>
                  </div>
                  <Switch
                    checked={settings.showLocation}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, showLocation: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Ride History</p>
                    <p className="text-sm text-muted-foreground">
                      Others can see your past rides
                    </p>
                  </div>
                  <Switch
                    checked={settings.showRideHistory}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, showRideHistory: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Clubs</p>
                    <p className="text-sm text-muted-foreground">
                      Display your club memberships
                    </p>
                  </div>
                  <Switch
                    checked={settings.showClubs}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, showClubs: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Messaging</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Who can message you</Label>
                  <Select
                    value={settings.allowMessages}
                    onValueChange={(value) =>
                      setSettings({ ...settings, allowMessages: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="followers">Followers Only</SelectItem>
                      <SelectItem value="none">No One</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications on your device
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, pushNotifications: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Ride Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Get reminded about upcoming rides
                  </p>
                </div>
                <Switch
                  checked={settings.rideReminders}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, rideReminders: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Club Updates</p>
                  <p className="text-sm text-muted-foreground">
                    News and announcements from your clubs
                  </p>
                </div>
                <Switch
                  checked={settings.clubUpdates}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, clubUpdates: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketplace Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Updates about your listings and saved items
                  </p>
                </div>
                <Switch
                  checked={settings.marketplaceAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, marketplaceAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Follower Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    When someone follows you
                  </p>
                </div>
                <Switch
                  checked={settings.followerNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, followerNotifications: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Units & Display</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Distance Unit</Label>
                <Select
                  value={settings.distanceUnit}
                  onValueChange={(value) =>
                    setSettings({ ...settings, distanceUnit: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="miles">Miles</SelectItem>
                    <SelectItem value="kilometers">Kilometers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Temperature Unit</Label>
                <Select
                  value={settings.temperatureUnit}
                  onValueChange={(value) =>
                    setSettings({ ...settings, temperatureUnit: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                    <SelectItem value="celsius">Celsius (°C)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline">Change Password</Button>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Deleting your account is permanent. All your data including rides,
                    club memberships, and marketplace listings will be lost.
                  </AlertDescription>
                </Alert>
                <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Account</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="confirm">
              Type <strong>DELETE</strong> to confirm
            </Label>
            <Input
              id="confirm"
              className="mt-2"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setDeleteConfirmText('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== 'DELETE' || isDeleting}
              onClick={handleDeleteAccount}
            >
              {isDeleting ? 'Deleting…' : 'Delete Forever'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
