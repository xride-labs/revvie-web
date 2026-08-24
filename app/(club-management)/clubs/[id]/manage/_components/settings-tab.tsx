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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-react'
import type { ClubSettings } from '../_lib/constants'

export function SettingsTab({
  clubSettings,
  onChange,
  fieldErrors,
  isSaving,
  onSave,
}: {
  clubSettings: ClubSettings
  onChange: (next: ClubSettings) => void
  fieldErrors: Record<string, string>
  isSaving: boolean
  onSave: () => void
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Club Information</CardTitle>
          <CardDescription>Update your club&apos;s basic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Club Name</Label>
            <Input
              id="name"
              value={clubSettings.name}
              onChange={(e) => onChange({ ...clubSettings, name: e.target.value })}
              aria-invalid={!!fieldErrors.name}
            />
            {fieldErrors.name && (
              <p className="text-xs text-destructive">{fieldErrors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={clubSettings.description}
              onChange={(e) =>
                onChange({ ...clubSettings, description: e.target.value })
              }
              rows={4}
              aria-invalid={!!fieldErrors.description}
            />
            {fieldErrors.description && (
              <p className="text-xs text-destructive">{fieldErrors.description}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={clubSettings.location}
              onChange={(e) => onChange({ ...clubSettings, location: e.target.value })}
              aria-invalid={!!fieldErrors.location}
            />
            {fieldErrors.location && (
              <p className="text-xs text-destructive">{fieldErrors.location}</p>
            )}
          </div>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving…
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy & Access</CardTitle>
          <CardDescription>Control who can see and join your club</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Public Club</p>
              <p className="text-sm text-muted-foreground">
                Anyone can find and view this club
              </p>
            </div>
            <Switch
              checked={clubSettings.isPublic}
              onCheckedChange={(checked) =>
                onChange({ ...clubSettings, isPublic: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require Approval</p>
              <p className="text-sm text-muted-foreground">
                New members must be approved
              </p>
            </div>
            <Switch
              checked={clubSettings.requireApproval}
              onCheckedChange={(checked) =>
                onChange({ ...clubSettings, requireApproval: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Allow Member Invites</p>
              <p className="text-sm text-muted-foreground">Members can invite others</p>
            </div>
            <Switch
              checked={clubSettings.allowMemberInvites}
              onCheckedChange={(checked) =>
                onChange({ ...clubSettings, allowMemberInvites: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Member List</p>
              <p className="text-sm text-muted-foreground">
                Non-members can see the member list
              </p>
            </div>
            <Switch
              checked={clubSettings.showMemberList}
              onCheckedChange={(checked) =>
                onChange({ ...clubSettings, showMemberList: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
