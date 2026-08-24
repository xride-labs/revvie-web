import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Crown, MoreHorizontal, UserMinus } from 'lucide-react'
import type { ClubMember } from '@/entities/club/model'
import { formatDate, roleColors, roleOptions } from '../_lib/constants'

export function MembersTab({
  members,
  onRoleChange,
  onSelectForRemoval,
}: {
  members: ClubMember[]
  onRoleChange: (memberId: string, newRole: string) => void
  onSelectForRemoval: (member: ClubMember) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Club Members ({members.length})</CardTitle>
        <CardDescription>Manage member roles and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {member.user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user.name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {member.role === 'FOUNDER' ? (
                    <Badge className={roleColors.FOUNDER}>
                      <Crown className="w-3 h-3 mr-1" />
                      FOUNDER
                    </Badge>
                  ) : (
                    <Select
                      defaultValue={member.role}
                      onValueChange={(val) => onRoleChange(member.id, val)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell>{formatDate(member.joinedAt)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Active
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {member.role !== 'FOUNDER' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => onSelectForRemoval(member)}
                        >
                          <UserMinus className="w-4 h-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
