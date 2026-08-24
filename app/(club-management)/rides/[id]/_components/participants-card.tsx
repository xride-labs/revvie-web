import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { initials } from '@/shared/lib/initials'
import type { RideParticipant } from '@/entities/ride/model'
import { participantStatusIcons } from '../_lib/constants'

export function ParticipantsCard({
  participants,
  confirmedCount,
}: {
  participants: RideParticipant[]
  confirmedCount: number
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Riders ({confirmedCount})</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-50">
          <div className="space-y-3">
            {participants.map((participant) => (
              <Link key={participant.id} href={`/profile/${participant.userId}`}>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>{initials(participant.user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{participant.user.name}</p>
                  </div>
                  {participantStatusIcons[participant.status]}
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
