import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Trash2 } from 'lucide-react'

export function DangerTab({ onRequestDelete }: { onRequestDelete: () => void }) {
  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-red-600">Danger Zone</CardTitle>
        <CardDescription>
          These actions are irreversible. Proceed with caution.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Deleting a club will permanently remove all club data including member
            lists, ride history, and conversations. This action cannot be undone.
          </AlertDescription>
        </Alert>
        <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
          <div>
            <p className="font-medium text-red-600">Delete Club</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete this club and all its data
            </p>
          </div>
          <Button variant="destructive" onClick={onRequestDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Club
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
