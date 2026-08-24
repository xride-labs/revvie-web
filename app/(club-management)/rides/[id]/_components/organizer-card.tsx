import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageCircle } from 'lucide-react'
import { initials } from '@/shared/lib/initials'
import type { RideDetails } from '@/entities/ride/model'

export function OrganizerCard({ creator }: { creator: RideDetails['creator'] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Organizer</CardTitle>
      </CardHeader>
      <CardContent>
        <Link href={`/profile/${creator.id}`}>
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarFallback>{initials(creator.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{creator.name}</p>
            </div>
            <Button variant="outline" size="sm">
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
