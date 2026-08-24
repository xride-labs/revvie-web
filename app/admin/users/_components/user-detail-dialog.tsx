import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { AdminUserDetails, AdminUserRecord } from '@/entities/admin/model'

export function UserDetailDialog({
  open,
  onOpenChange,
  loading,
  error,
  details,
  fallbackUser,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  loading: boolean
  error: string | null
  details: AdminUserDetails | undefined
  fallbackUser: AdminUserRecord | null
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>Complete user profile details</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading user details...</div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : details ? (
          <div className="space-y-6 text-sm overflow-y-auto pr-1">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Profile
              </p>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Name" value={details.name} />
                <DetailItem label="Username" value={details.username} />
                <DetailItem label="Email" value={details.email} />
                <DetailItem label="Phone" value={details.phone} />
                <DetailItem label="Location" value={details.location} />
                <DetailItem label="Bio" value={details.bio} />
                <DetailItem label="DOB" value={details.dob} />
                <DetailItem label="Blood Type" value={details.bloodType} />
                <DetailItem label="Subscription" value={details.subscriptionTier} />
                <DetailItem
                  label="Onboarding"
                  value={details.onboardingCompleted ? 'Completed' : 'Incomplete'}
                />
              </div>
              <div className="mt-3">
                <p className="text-muted-foreground mb-1">Roles</p>
                <div className="flex flex-wrap gap-1">
                  {details.roles.map((role) => (
                    <Badge key={role} variant="outline">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Activity & Stats
              </p>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="XP" value={details.xpPoints?.toString()} />
                <DetailItem
                  label="Level"
                  value={`${details.level} · ${details.levelTitle}`}
                />
                <DetailItem
                  label="Reputation"
                  value={details.reputationScore?.toFixed?.(2)}
                />
                <DetailItem
                  label="Rides Completed"
                  value={details.rideStats?.totalRides?.toString()}
                />
                <DetailItem
                  label="Total Distance (km)"
                  value={details.rideStats?.totalDistanceKm?.toString()}
                />
                <DetailItem
                  label="Longest Ride (km)"
                  value={details.rideStats?.longestRideKm?.toString()}
                />
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Preferences
              </p>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Units" value={details.preferences?.units} />
                <DetailItem
                  label="Dark Mode"
                  value={details.preferences?.darkMode ? 'On' : 'Off'}
                />
                <DetailItem
                  label="Ride Reminders"
                  value={details.preferences?.rideReminders ? 'On' : 'Off'}
                />
                <DetailItem
                  label="Service Reminder (km)"
                  value={details.preferences?.serviceReminderKm?.toString()}
                />
                <DetailItem
                  label="Profile Visibility"
                  value={details.preferences?.profileVisibility}
                />
                <DetailItem
                  label="Open to Invite"
                  value={details.preferences?.openToInvite ? 'Yes' : 'No'}
                />
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Notifications
              </p>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem
                  label="Push"
                  value={details.preferences?.pushNotifications ? 'On' : 'Off'}
                />
                <DetailItem
                  label="Email"
                  value={details.preferences?.emailNotifications ? 'On' : 'Off'}
                />
                <DetailItem
                  label="SMS"
                  value={details.preferences?.smsNotifications ? 'On' : 'Off'}
                />
                <DetailItem
                  label="Unread"
                  value={details.unreadNotifications.toString()}
                />
                <DetailItem label="Total" value={details.counts.notifications.toString()} />
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Safety
              </p>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem
                  label="Helmet Verified"
                  value={details.helmetVerified ? 'Yes' : 'No'}
                />
                <DetailItem label="Last Safety Check" value={details.lastSafetyCheck} />
              </div>
              <div className="mt-3">
                <p className="text-muted-foreground mb-1">Emergency Contacts</p>
                {details.emergencyContacts.length ? (
                  <div className="space-y-2">
                    {details.emergencyContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2"
                      >
                        <div>
                          <p className="font-medium">
                            {contact.name}
                            {contact.isPrimary ? ' (Primary)' : ''}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {contact.relationship || 'Contact'}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">{contact.phone}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No emergency contacts</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Badges
              </p>
              {details.badges.length ? (
                <div className="flex flex-wrap gap-2">
                  {details.badges.map((entry) => (
                    <Badge key={`${entry.badge.id}-${entry.earnedAt}`} variant="secondary">
                      {entry.badge.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No badges earned</p>
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Counts
              </p>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Posts" value={details.counts.posts.toString()} />
                <DetailItem label="Comments" value={details.counts.comments.toString()} />
                <DetailItem label="Followers" value={details.counts.followers.toString()} />
                <DetailItem label="Following" value={details.counts.following.toString()} />
                <DetailItem
                  label="Created Rides"
                  value={details.counts.createdRides.toString()}
                />
                <DetailItem
                  label="Created Clubs"
                  value={details.counts.createdClubs.toString()}
                />
                <DetailItem
                  label="Marketplace Listings"
                  value={details.counts.marketplaceListings.toString()}
                />
                <DetailItem
                  label="Club Memberships"
                  value={details.counts.clubMemberships.toString()}
                />
              </div>
            </div>
          </div>
        ) : fallbackUser ? (
          <div className="text-sm text-muted-foreground">
            No details loaded for {fallbackUser.name || fallbackUser.email || 'user'}.
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value && value !== '' ? value : 'N/A'}</p>
    </div>
  )
}
