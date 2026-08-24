import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronLeft, Share2, MoreHorizontal, Navigation, Calendar } from 'lucide-react'

export function RideHeader({
  isOrganizer,
  isJoined,
  onEdit,
  onDelete,
  onLeave,
}: {
  isOrganizer: boolean
  isJoined: boolean
  onEdit: () => void
  onDelete: () => void
  onLeave: () => void
}) {
  const router = useRouter()

  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b">
      <div className="flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Share2 className="w-5 h-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Navigation className="w-4 h-4 mr-2" />
                Open in Maps
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar className="w-4 h-4 mr-2" />
                Add to Calendar
              </DropdownMenuItem>
              {isOrganizer && (
                <>
                  <DropdownMenuItem onClick={onEdit}>Edit Ride</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                    Delete Ride
                  </DropdownMenuItem>
                </>
              )}
              {isJoined && (
                <DropdownMenuItem className="text-red-600" onClick={onLeave}>
                  Leave Ride
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
