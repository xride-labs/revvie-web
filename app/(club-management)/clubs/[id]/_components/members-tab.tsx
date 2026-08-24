import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserPlus } from 'lucide-react'
import { formatDate, initials, roleColors } from '../_lib/constants'
import type { ClubMember } from '@/entities/club/model'

export function MembersTab({
  members,
  isMember,
}: {
  members: ClubMember[]
  isMember: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Members ({members.length})</CardTitle>
          {isMember && (
            <Button variant="outline" size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-100">
          <div className="space-y-2">
            {members.map((member) => (
              <Link
                key={member.id}
                href={`/profile/${member.userId}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Avatar>
                  <AvatarFallback>{initials(member.user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{member.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined {formatDate(member.joinedAt)}
                  </p>
                </div>
                <Badge className={roleColors[member.role as keyof typeof roleColors]}>
                  {member.role}
                </Badge>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
