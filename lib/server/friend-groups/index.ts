import { apiAuthenticated } from '../base'

export interface FriendGroup {
  id: string
  name: string
  description: string | null
  image: string | null
  creatorId: string
  creator: { id: string; name: string; avatar: string | null }
  members: Array<{
    id: string
    userId: string
    user: { id: string; name: string; avatar: string | null }
  }>
  _count: { members: number; rides: number }
  createdAt: string
  updatedAt: string
}

export interface FriendGroupDetail extends FriendGroup {
  rides: Array<{
    id: string
    title: string
    status: string
    scheduledAt: string | null
    startLocation: string
    creator: { id: string; name: string; avatar: string | null }
    _count: { participants: number }
  }>
}

// ============ Friend Groups API ============

export async function getFriendGroups(): Promise<{ groups: FriendGroup[] }> {
  return apiAuthenticated.get<{ groups: FriendGroup[] }>('/friends/groups')
}

export async function getFriendGroup(
  groupId: string,
): Promise<{ group: FriendGroupDetail }> {
  return apiAuthenticated.get<{ group: FriendGroupDetail }>(`/friends/groups/${groupId}`)
}

export async function createFriendGroup(data: {
  name: string
  description?: string
  image?: string
  memberIds?: string[]
}): Promise<{ group: FriendGroup }> {
  return apiAuthenticated.post<{ group: FriendGroup }>('/friends/groups', data)
}

export async function updateFriendGroup(
  groupId: string,
  data: { name?: string; description?: string; image?: string },
): Promise<{ group: FriendGroup }> {
  return apiAuthenticated.patch<{ group: FriendGroup }>(`/friends/groups/${groupId}`, data)
}

export async function deleteFriendGroup(groupId: string): Promise<void> {
  return apiAuthenticated.delete(`/friends/groups/${groupId}`)
}

export async function addFriendGroupMembers(
  groupId: string,
  userIds: string[],
): Promise<{ added: number }> {
  return apiAuthenticated.post<{ added: number }>(`/friends/groups/${groupId}/members`, {
    userIds,
  })
}

export async function removeFriendGroupMember(
  groupId: string,
  userId: string,
): Promise<void> {
  return apiAuthenticated.delete(`/friends/groups/${groupId}/members/${userId}`)
}

export async function createRideFromGroup(
  groupId: string,
  data: Record<string, unknown>,
): Promise<{ ride: unknown }> {
  return apiAuthenticated.post<{ ride: unknown }>(`/friends/groups/${groupId}/rides`, data)
}

export const friendGroupsApi = {
  getFriendGroups,
  getFriendGroup,
  createFriendGroup,
  updateFriendGroup,
  deleteFriendGroup,
  addFriendGroupMembers,
  removeFriendGroupMember,
  createRideFromGroup,
}
