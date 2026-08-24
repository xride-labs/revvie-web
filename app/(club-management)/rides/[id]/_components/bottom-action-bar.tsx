import { Button } from '@/components/ui/button'
import { MessageCircle, Navigation, Users } from 'lucide-react'

export function BottomActionBar({
  isJoined,
  onJoin,
}: {
  isJoined: boolean
  onJoin: () => void
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
      {isJoined ? (
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            <MessageCircle className="w-4 h-4 mr-2" />
            Group Chat
          </Button>
          <Button className="flex-1">
            <Navigation className="w-4 h-4 mr-2" />
            Navigate
          </Button>
        </div>
      ) : (
        <Button className="w-full" size="lg" onClick={onJoin}>
          <Users className="w-4 h-4 mr-2" />
          Join This Ride
        </Button>
      )}
    </div>
  )
}
