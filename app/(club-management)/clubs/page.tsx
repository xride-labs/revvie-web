'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MapPin, Users, Calendar, ChevronRight, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useClubs } from '@/store/features/clubs'
import { PhantomLoader } from '@/components/loading/phantom-loader'

interface _Club {
  id: string
  name: string
  description: string
  avatar: string | null
  location: string
  membersCount: number
  ridesCount: number
  role?: 'member' | 'officer' | 'president'
  unreadMessages?: number
}

export default function ClubsPage() {
  const [activeTab, setActiveTab] = useState<'my' | 'discover'>('my')
  const { discoveredClubs, myClubs, isLoading, fetchMyClubs, discoverClubs } = useClubs()

  useEffect(() => {
    fetchMyClubs()
    discoverClubs(1)
  }, [discoverClubs, fetchMyClubs])

  if (isLoading) {
    return (
      <PhantomLoader loading>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          <div className="flex gap-2 mb-6">
            <div className="flex-1 h-10 bg-muted rounded-full" />
            <div className="flex-1 h-10 bg-muted rounded-full" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card overflow-hidden">
              <div className="h-32 bg-muted" />
              <div className="p-6 space-y-3">
                <div className="h-5 w-40 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="flex gap-4">
                  <div className="h-3 w-20 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </PhantomLoader>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'my' ? 'default' : 'outline'}
          onClick={() => setActiveTab('my')}
          className="flex-1 rounded-full"
        >
          My Clubs
        </Button>
        <Button
          variant={activeTab === 'discover' ? 'default' : 'outline'}
          onClick={() => setActiveTab('discover')}
          className="flex-1 rounded-full"
        >
          Discover
        </Button>
      </div>

      {activeTab === 'my' ? (
        <>
          {/* My Clubs */}
          {myClubs?.length > 0 ? (
            <div className="grid gap-6">
              {myClubs.map((club) => (
                <Link key={club.id} href={`/clubs/${club.id}`}>
                  <Card className="group hover:shadow-lg hover:border-primary/50 transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      {/* Club Cover/Banner */}
                      <div className="h-32 bg-gradient-to-r from-primary/20 via-amber-100/30 to-primary/10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23000000%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
                        {(club.unreadMessages ?? 0) > 0 && (
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-red-500 text-white shadow-lg animate-pulse">
                              {club.unreadMessages} new
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {/* Club Content */}
                      <CardContent className="p-6 relative">
                        {/* Avatar positioned over the banner */}
                        <div className="absolute -top-8 left-6">
                          <Avatar className="w-16 h-16 border-4 border-background shadow-lg">
                            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                              {club.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        {/* Club Info */}
                        <div className="mt-10">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                                {club.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="outline"
                                  className="text-xs capitalize font-medium"
                                >
                                  {club.role}
                                </Badge>
                                {club.role === 'president' && (
                                  <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-200">
                                    👑 Leader
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                            {club.description}
                          </p>
                          
                          {/* Stats */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="font-medium">{club.location}</span>
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Users className="w-3.5 h-3.5" />
                                <span className="font-medium">{club.membersCount}</span>
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="font-medium">{club.ridesCount} rides</span>
                              </span>
                            </div>
                            
                            {/* Activity indicator */}
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              <span className="text-xs text-green-600 font-medium">Active</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Users className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold mb-2">No clubs yet</h3>
              <p className="text-muted-foreground mb-4">
                Discover clubs through rider profiles or create your own!
              </p>
              <Button onClick={() => setActiveTab('discover')}>Discover Clubs</Button>
            </div>
          )}

          {/* Create Club CTA */}
          <Separator className="my-6" />
          <Card className="bg-linear-to-r from-primary/10 to-amber-100/50 border-primary/20">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-2">Start Your Own Club</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Build your motorcycle community from the ground up.
              </p>
              <Link href="/clubs/create">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Club
                </Button>
              </Link>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Discover Info */}
          <div className="bg-muted/50 rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground text-center">
              💡 <strong>Tip:</strong> The best way to discover clubs is through rider
              profiles. Click on someone&apos;s club badge to learn more!
            </p>
          </div>

          {/* Discovered Clubs */}
          <h2 className="font-semibold mb-4">Clubs Near You</h2>
          <div className="space-y-4">
            {discoveredClubs.map((club) => (
              <Link key={club.id} href={`/clubs/${club.id}`}>
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-14 h-14">
                        <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">
                          {club.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold">{club.name}</h3>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {club.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {club.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {club.membersCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
