import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import type { RideDetails, RideParticipant } from '@/entities/ride/model'

export const statusColors: Record<RideDetails['status'], string> = {
  PLANNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-green-100 text-green-700',
  PAUSED: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export const participantStatusIcons: Record<RideParticipant['status'], React.ReactNode> = {
  ACCEPTED: <CheckCircle className="w-4 h-4 text-green-500" />,
  REQUESTED: <AlertCircle className="w-4 h-4 text-amber-500" />,
  DECLINED: <XCircle className="w-4 h-4 text-red-500" />,
  COMPLETED: <CheckCircle className="w-4 h-4 text-muted-foreground" />,
  CANCELLED: <XCircle className="w-4 h-4 text-muted-foreground" />,
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}
