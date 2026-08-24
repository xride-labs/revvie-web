import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Shield, Trophy, Crown } from 'lucide-react'
import { initials, roleColors } from '../_lib/constants'
import type { ClubWithRides } from '../_lib/types'
import type { ClubMember } from '@/entities/club/model'

export function AboutTab({
  club,
  members,
  isOwner,
  onAddPhotos,
}: {
  club: ClubWithRides
  members: ClubMember[]
  isOwner: boolean
  onAddPhotos: () => void
}) {
  const leadership = members.filter((m) =>
    ['FOUNDER', 'ADMIN', 'OFFICER'].includes(m.role),
  )

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gallery</CardTitle>
            {isOwner && (
              <Button variant="outline" size="sm" onClick={onAddPhotos}>
                Add Photos
              </Button>
            )}
          </div>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{club.description}</p>
          <Separator className="my-4" />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {club.isPublic
                  ? 'Public club — anyone can join'
                  : 'Private club — invite or approval required'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{club.trophyCount} trophies earned</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leadership</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leadership.map((member) => (
              <Link
                key={member.id}
                href={`/profile/${member.userId}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Avatar>
                  <AvatarFallback>{initials(member.user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{member.user.name}</p>
                </div>
                <Badge className={roleColors[member.role as keyof typeof roleColors]}>
                  {member.role === 'FOUNDER' && <Crown className="w-3 h-3 mr-1" />}
                  {member.role}
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
