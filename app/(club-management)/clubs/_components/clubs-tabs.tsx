'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MapPin, Users, ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link'
import type { Club } from '@/entities/club/model'
import { initials } from '@/shared/lib/initials'

/**
 * The tab toggle and card grids only — no data fetching. Both lists arrive as props from
 * the server component in `page.tsx`, which fetches them once via `features/clubs/server`
 * before this component ever mounts. Keeping this the client boundary (instead of the
 * whole page) means the initial paint carries real content and the client bundle only
 * needs the interactive bit: which tab is showing.
 */
export function ClubsTabs({
  myClubs,
  discoveredClubs,
}: {
  myClubs: Club[]
  discoveredClubs: Club[]
}) {
  const [activeTab, setActiveTab] = useState<'my' | 'discover'>('my')

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
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
          {myClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myClubs.map((club) => (
                <Link key={club.id} href={`/clubs/${club.id}`} className="block h-full">
                  <Card className="group h-full flex flex-col rounded-3xl border-white/[0.07] bg-[#111] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.1)] relative">
                    <div className="relative flex-none">
                      {/* Club Cover/Banner */}
                      <div className="h-36 bg-linear-to-r from-[#1a1a1a] to-[#0a0a0a] relative overflow-hidden transition-transform duration-500">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20 group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent opacity-80" />
                      </div>

                      {/* Avatar positioned over the banner */}
                      <div className="absolute -bottom-8 left-6">
                        <Avatar className="w-16 h-16 border-4 border-[#111] shadow-lg rounded-2xl">
                          <AvatarFallback className="bg-[#1a1a1a] text-white border border-white/10 text-lg font-bold rounded-2xl">
                            {initials(club.name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>

                    {/* Club Content */}
                    <CardContent className="p-6 pt-10 flex-1 flex flex-col relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-white group-hover:text-brand-red-light transition-colors">
                            {club.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            {club.role && (
                              <Badge
                                variant="outline"
                                className="text-xs capitalize font-medium border-white/10 text-text-secondary bg-white/5"
                              >
                                {club.role.toLowerCase()}
                              </Badge>
                            )}
                            {club.role === 'FOUNDER' && (
                              <Badge className="text-xs bg-neon-green/10 text-neon-green border-none shadow-[0_0_10px_rgba(125,255,0,0.2)]">
                                👑 Leader
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-text-secondary/50 group-hover:text-brand-red-light group-hover:translate-x-1 transition-all" />
                      </div>

                      <p className="text-sm text-text-secondary mb-6 line-clamp-2 leading-relaxed flex-1">
                        {club.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1.5 text-text-secondary">
                            <MapPin className="w-3.5 h-3.5 text-white/40" />
                            <span className="font-medium text-white/80">
                              {club.location}
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5 text-text-secondary">
                            <Users className="w-3.5 h-3.5 text-white/40" />
                            <span className="font-medium text-white/80">
                              {club.memberCount}
                            </span>
                          </span>
                        </div>

                        {/* Activity indicator */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-neon-green rounded-full shadow-[0_0_8px_#7dff00] animate-pulse" />
                          <span className="text-[10px] uppercase tracking-wider text-neon-green font-bold">
                            Active
                          </span>
                        </div>
                      </div>
                    </CardContent>
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
          <h2 className="font-bold text-xl text-white tracking-wide mb-6">
            Clubs Near You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discoveredClubs.map((club) => (
              <Link key={club.id} href={`/clubs/${club.id}`} className="block h-full">
                <Card className="group h-full flex flex-col rounded-3xl border-white/[0.07] bg-[#111] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.1)] relative">
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="w-12 h-12 rounded-xl border border-white/10 shadow-md group-hover:border-neon-green/50 transition-colors shrink-0">
                        <AvatarFallback className="bg-[#1a1a1a] text-white font-bold rounded-xl">
                          {initials(club.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h3 className="font-bold text-white group-hover:text-neon-green transition-colors truncate pr-2">
                            {club.name}
                          </h3>
                          <ChevronRight className="w-4 h-4 shrink-0 text-text-secondary/50 group-hover:text-neon-green group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                          {club.description}
                        </p>
                        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5 text-[11px] text-text-secondary">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-white/30" />
                            <span className="text-white/70 truncate max-w-[80px]">
                              {club.location}
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3 h-3 text-white/30" />
                            <span className="text-white/70">{club.memberCount}</span>
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
