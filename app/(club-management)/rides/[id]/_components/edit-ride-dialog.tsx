import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export interface EditRideData {
  title: string
  description: string
  startLocation: string
  endLocation: string
  scheduledAt: string
  distance: string
  duration: string
}

export function EditRideDialog({
  open,
  onOpenChange,
  data,
  onChange,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: EditRideData
  onChange: (next: EditRideData) => void
  onSave: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Ride</DialogTitle>
          <DialogDescription>Update ride details and schedule.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={data.description}
              onChange={(e) => onChange({ ...data, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-start">Start</Label>
              <Input
                id="edit-start"
                value={data.startLocation}
                onChange={(e) => onChange({ ...data, startLocation: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-end">End</Label>
              <Input
                id="edit-end"
                value={data.endLocation}
                onChange={(e) => onChange({ ...data, endLocation: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Scheduled At</Label>
              <Input
                id="edit-date"
                type="datetime-local"
                value={data.scheduledAt}
                onChange={(e) => onChange({ ...data, scheduledAt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-distance">Distance (mi)</Label>
              <Input
                id="edit-distance"
                type="number"
                value={data.distance}
                onChange={(e) => onChange({ ...data, distance: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-duration">Duration (minutes)</Label>
            <Input
              id="edit-duration"
              type="number"
              value={data.duration}
              onChange={(e) => onChange({ ...data, duration: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
