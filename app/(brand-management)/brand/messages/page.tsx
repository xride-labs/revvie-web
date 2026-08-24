'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageCircle, Send, Loader2, Search, ArrowLeft } from 'lucide-react'
import { apiAuthenticated } from '@/lib/server/base'
import { formatRelativeTime, useNow } from '@/shared/lib/relative-time'
import { cn } from '@/lib/utils'

interface Participant {
  _id: string
  name?: string
  email?: string
  avatar?: string
}

interface LastMessage {
  text?: string
  messageType?: string
  createdAt?: string
  senderId?: string
}

interface Conversation {
  _id: string
  type: string
  participants: Participant[]
  lastMessage?: LastMessage
  unreadCount?: number
  updatedAt: string
}

interface Message {
  _id: string
  text?: string
  messageType: string
  senderId: string
  senderName?: string
  createdAt: string
}

async function getConversations(): Promise<Conversation[]> {
  try {
    const res = await apiAuthenticated.raw.get('/chat/conversations')
    return res.data?.data?.conversations ?? res.data?.data ?? []
  } catch {
    return []
  }
}

async function getMessages(conversationId: string): Promise<Message[]> {
  try {
    const res = await apiAuthenticated.raw.get(
      `/chat/conversations/${conversationId}/messages`,
      {
        params: { limit: 50 },
      },
    )
    return res.data?.data?.messages ?? res.data?.data ?? []
  } catch {
    return []
  }
}

async function sendMessage(
  conversationId: string,
  text: string,
): Promise<Message | null> {
  try {
    const res = await apiAuthenticated.raw.post(
      `/chat/conversations/${conversationId}/messages`,
      {
        text,
        messageType: 'TEXT',
      },
    )
    return res.data?.data?.message ?? res.data?.data ?? null
  } catch {
    return null
  }
}

export default function BrandMessagesPage() {
  const now = useNow()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getConversations().then((c) => {
      setConversations(c)
      setLoading(false)
    })
  }, [])

  const loadMessages = useCallback(async (conversation: Conversation) => {
    setSelected(conversation)
    setMessagesLoading(true)
    setMessages([])
    const msgs = await getMessages(conversation._id)
    setMessages(msgs)
    setMessagesLoading(false)
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSend = async () => {
    if (!selected || !draft.trim() || sending) return
    const text = draft.trim()
    setDraft('')
    setSending(true)
    const msg = await sendMessage(selected._id, text)
    if (msg) {
      setMessages((prev) => [...prev, msg])
      setConversations((prev) =>
        prev.map((c) =>
          c._id === selected._id
            ? {
                ...c,
                lastMessage: {
                  text,
                  messageType: 'TEXT',
                  createdAt: new Date().toISOString(),
                },
                updatedAt: new Date().toISOString(),
              }
            : c,
        ),
      )
    }
    setSending(false)
  }

  const filtered = conversations.filter((c) => {
    if (!search) return true
    const other = c.participants.find((p) => p._id)
    return other?.name?.toLowerCase().includes(search.toLowerCase()) ?? true
  })

  const getOtherParticipant = (c: Conversation) =>
    c.participants.find((p) => p.name) ?? c.participants[0]

  const formatTime = (iso?: string) => formatRelativeTime(iso, now)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 h-[calc(100vh-64px)]">
      <div className="flex h-full gap-4">
        {/* Conversation list */}
        <Card
          className={cn(
            'flex flex-col w-full lg:w-80 shrink-0',
            selected ? 'hidden lg:flex' : 'flex',
          )}
        >
          <div className="p-4 border-b border-border">
            <h2 className="font-bold text-lg mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search conversations…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">
                  No conversations yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  When riders message your brand you&apos;ll see them here.
                </p>
              </div>
            ) : (
              filtered.map((c) => {
                const other = getOtherParticipant(c)
                const initials = (other?.name ?? 'U').charAt(0).toUpperCase()
                const isActive = selected?._id === c._id
                return (
                  <button
                    key={c._id}
                    onClick={() => loadMessages(c)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 border-b border-border/50',
                      isActive && 'bg-amber-500/10 border-l-2 border-l-amber-500',
                    )}
                  >
                    <Avatar className="shrink-0">
                      <AvatarFallback className="bg-amber-500/20 text-amber-500 text-sm font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm truncate">
                          {other?.name ?? 'Rider'}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatTime(c.lastMessage?.createdAt ?? c.updatedAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {c.lastMessage?.messageType === 'IMAGE'
                          ? '📷 Photo'
                          : (c.lastMessage?.text ?? 'No messages yet')}
                      </p>
                    </div>
                    {(c.unreadCount ?? 0) > 0 && (
                      <Badge className="bg-amber-500 text-white text-xs shrink-0">
                        {c.unreadCount}
                      </Badge>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </Card>

        {/* Message thread */}
        {selected ? (
          <Card className="flex-1 flex flex-col overflow-hidden">
            {/* Thread header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSelected(null)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Avatar>
                <AvatarFallback className="bg-amber-500/20 text-amber-500 font-bold">
                  {(getOtherParticipant(selected)?.name ?? 'R').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">
                  {getOtherParticipant(selected)?.name ?? 'Rider'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selected.type === 'direct' ? 'Direct message' : 'Group'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messagesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No messages yet. Say hello!
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isFromBusiness = false // We don't have the current user id here easily, treat all as incoming for display
                  return (
                    <div
                      key={msg._id}
                      className={cn(
                        'flex gap-2',
                        isFromBusiness ? 'justify-end' : 'justify-start',
                      )}
                    >
                      {!isFromBusiness && (
                        <Avatar className="w-7 h-7 shrink-0 mt-1">
                          <AvatarFallback className="bg-muted text-xs">
                            {(msg.senderName ?? 'R').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="max-w-[70%]">
                        {msg.senderName && !isFromBusiness && (
                          <p className="text-[10px] text-muted-foreground mb-1 ml-1">
                            {msg.senderName}
                          </p>
                        )}
                        <div
                          className={cn(
                            'rounded-2xl px-4 py-2.5 text-sm',
                            isFromBusiness
                              ? 'bg-amber-500 text-white rounded-br-sm'
                              : 'bg-muted text-foreground rounded-bl-sm',
                          )}
                        >
                          {msg.messageType === 'IMAGE' ? (
                            <span className="text-muted-foreground italic">📷 Photo</span>
                          ) : (
                            msg.text
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 px-1">
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Compose */}
            <div className="flex items-center gap-2 p-3 border-t border-border shrink-0">
              <Input
                className="flex-1"
                placeholder="Type a message…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                disabled={sending}
              />
              <Button
                onClick={handleSend}
                disabled={!draft.trim() || sending}
                className="bg-amber-500 hover:bg-amber-600 text-white shrink-0"
                size="icon"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </Card>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">
                Select a conversation
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
