import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Shield, Trophy, Crown, Users } from 'lucide-react'
import { initials, roleColors } from '../_lib/constants'
import type { ClubWithRides } from '../_lib/types'
import type { ClubMember } from '@/entities/club/model'

export function AboutTab({
  club,
  members,
}: {
  club: ClubWithRides
  members: ClubMember[]
}) {
  const leadership = members.filter((m) =>
    ['FOUNDER', 'ADMIN', 'OFFICER'].includes(m.role),
  )

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>About {club.name}</CardTitle>
          <CardDescription>Club mission, guidelines, and milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
            {club.description || 'No description provided yet.'}
          </p>
          <Separator className="my-4" />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm">
                {club.isPublic
                  ? 'Public club — anyone can discover and join'
                  : 'Private club — invite or approval required'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-sm">{club.trophyCount || 0} trophies earned</span>
            </div>
            {club.requiresLicense && (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Verified driving license required to join</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leadership</CardTitle>
          <CardDescription>Founders and managing officers</CardDescription>
        </CardHeader>
        <CardContent>
          {leadership.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground space-y-2">
              <Users className="w-8 h-8 mx-auto text-muted-foreground/40" />
              <p>No designated leadership members listed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leadership.map((member) => (
                <Link
                  key={member.id}
                  href={`/profile/${member.userId}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors"
                >
                  <Avatar className="w-10 h-10 border border-white/10">
                    <AvatarImage src={member.user.avatar ?? undefined} alt={member.user.name ?? ''} />
                    <AvatarFallback>{initials(member.user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{member.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Club Leader
                    </p>
                  </div>
                  <Badge className={roleColors[member.role as keyof typeof roleColors]}>
                    {member.role === 'FOUNDER' && <Crown className="w-3 h-3 mr-1" />}
                    {member.role}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

