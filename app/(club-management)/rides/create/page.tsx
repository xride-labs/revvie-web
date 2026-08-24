'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, MapPin, Plus, X, Calendar, Route, ImagePlus } from 'lucide-react'
import { useCreateRideMutation } from '@/features/rides/api'
import { useUploadRideMediaMutation } from '@/features/media/api'
import { fileToDataUrl } from '@/lib/media-utils'
import { useToast } from '@/hooks/use-toast'
import { LocationPicker } from '@/components/ui/location-picker'
import type { LocationValue } from '@/components/ui/location-picker'

const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

const paceOptions = ['Leisurely', 'Moderate', 'Fast']

const terrainTypes = [
  'Paved Roads',
  'Highway',
  'Twisties/Mountain',
  'Mixed (Paved & Gravel)',
  'Off-Road',
  'Urban/City',
]

export default function CreateRidePage() {
  const router = useRouter()
  const {
    success: successToast,
    error: errorToast,
    loading: loadingToast,
    dismiss: dismissToast,
  } = useToast()
  const [step, setStep] = useState(1)
  const [createRide, { isLoading: isSubmitting }] = useCreateRideMutation()
  const [uploadRideMedia] = useUploadRideMediaMutation()

  // Map-based location state
  const [startPoint, setStartPoint] = useState<LocationValue | null>(null)
  const [endPoint, setEndPoint] = useState<LocationValue | null>(null)
  const [waypoints, setWaypoints] = useState<LocationValue[]>([])
  const [isAddingWaypoint, setIsAddingWaypoint] = useState(false)
  const [pendingWaypoint, setPendingWaypoint] = useState<LocationValue | null>(null)

  const [rideMediaFiles, setRideMediaFiles] = useState<File[]>([])
  const [rideData, setRideData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    estimatedDuration: '',
    estimatedDistance: '',
    difficulty: '',
    terrain: '',
    pace: '',
    maxParticipants: '10',
    clubId: '',
    isPrivate: false,
    requiresApproval: false,
  })

  const handleAddWaypoint = () => {
    if (pendingWaypoint) {
      setWaypoints([...waypoints, pendingWaypoint])
      setPendingWaypoint(null)
      setIsAddingWaypoint(false)
    }
  }

  const handleRemoveWaypoint = (index: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startPoint) {
      errorToast('Missing start location', {
        description: 'Please search and select a starting point on the map.',
      })
      return
    }
    const loadingToastId = loadingToast('Creating ride...', {
      description: 'Saving ride details and uploading media.',
    })

    try {
      const scheduledAt =
        rideData.date && rideData.time
          ? new Date(`${rideData.date}T${rideData.time}`).toISOString()
          : undefined

      const durationMinutes = rideData.estimatedDuration
        ? Math.round(Number(rideData.estimatedDuration) * 60)
        : undefined

      const distance = rideData.estimatedDistance
        ? Number(rideData.estimatedDistance)
        : undefined

      const { ride } = await createRide({
        title: rideData.title,
        description: rideData.description || undefined,
        startLocation: startPoint.name,
        endLocation: endPoint?.name,
        startLat: startPoint.lat,
        startLng: startPoint.lng,
        endLat: endPoint?.lat,
        endLng: endPoint?.lng,
        waypoints: waypoints.map((w) => ({
          latitude: w.lat,
          longitude: w.lng,
          name: w.name,
        })),
        experienceLevel: rideData.difficulty || undefined,
        pace: rideData.pace || undefined,
        maxParticipants: rideData.maxParticipants
          ? Number(rideData.maxParticipants)
          : undefined,
        distance,
        duration: durationMinutes,
        scheduledAt,
        keepPermanently: false,
      }).unwrap()

      if (rideMediaFiles.length > 0) {
        for (const file of rideMediaFiles) {
          const dataUrl = await fileToDataUrl(file)
          await uploadRideMedia({ rideId: ride.id, file: dataUrl, type: 'image' }).unwrap()
        }
      }

      successToast('Ride created! 🏍️', {
        description: `"${rideData.title}" is ready. Share it with your crew!`,
      })
      router.push(`/rides/${ride.id}`)
    } catch (error) {
      console.error('Failed to create ride:', error)
      errorToast('Failed to create ride', {
        description:
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.',
      })
    } finally {
      dismissToast(loadingToastId)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-primary' : 'bg-muted'}`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Step {step} of 4 —{' '}
              {step === 1
                ? 'The Mission'
                : step === 2
                  ? 'The Route'
                  : step === 3
                    ? 'The Vibes'
                    : 'Launch'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: The Mission */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                  <span className="text-3xl">🏁</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Plan the adventure</h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Every great ride starts with a name. Where are you taking your crew?
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-semibold">
                    Ride Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Sunrise Mountain Loop"
                    value={rideData.title}
                    onChange={(e) => setRideData({ ...rideData, title: e.target.value })}
                    className="h-12 text-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-semibold">
                    What&apos;s the vibe?
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the route, highlights, scenery, difficulty..."
                    value={rideData.description}
                    onChange={(e) =>
                      setRideData({ ...rideData, description: e.target.value })
                    }
                    rows={4}
                    className="text-base"
                    required
                  />
                </div>
              </div>

              <Button
                type="button"
                className="w-full h-12 text-base"
                disabled={!rideData.title || !rideData.description}
                onClick={() => setStep(2)}
              >
                Map the Route →
              </Button>
            </div>
          )}

          {/* Step 2: The Route */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                  <Route className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Chart the course</h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Search for locations to pin your route on the map.
                </p>
              </div>

              <div className="space-y-6">
                {/* Starting Point */}
                <LocationPicker
                  label="Starting Point"
                  placeholder="Search meeting point…"
                  value={startPoint}
                  onChange={setStartPoint}
                  pinColor="green"
                  required
                />

                {/* Waypoints / Pit Stops */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Pit Stops</Label>

                  {waypoints.length > 0 && (
                    <div className="space-y-2">
                      {waypoints.map((wp, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-lg border"
                        >
                          <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-600 shrink-0">
                            {index + 1}
                          </div>
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="flex-1 text-sm truncate">{wp.name}</span>
                          <p className="text-xs text-muted-foreground font-mono shrink-0">
                            {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => handleRemoveWaypoint(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {isAddingWaypoint ? (
                    <div className="space-y-2 p-3 border rounded-xl bg-muted/10">
                      <LocationPicker
                        placeholder="Search pit stop location…"
                        value={pendingWaypoint}
                        onChange={setPendingWaypoint}
                        pinColor="amber"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={!pendingWaypoint}
                          onClick={handleAddWaypoint}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add Stop
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsAddingWaypoint(false)
                            setPendingWaypoint(null)
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsAddingWaypoint(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Pit Stop
                    </Button>
                  )}
                </div>

                {/* Destination */}
                <LocationPicker
                  label="Destination"
                  placeholder="Search final stop (or same as start for loops)…"
                  value={endPoint}
                  onChange={setEndPoint}
                  pinColor="red"
                />
              </div>

              <Button
                type="button"
                className="w-full h-12 text-base"
                disabled={!startPoint}
                onClick={() => setStep(3)}
              >
                Set the Vibes →
              </Button>
            </div>
          )}

          {/* Step 3: The Vibes */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Dial in the details</h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  When does the ride happen, how intense, and who&apos;s invited?
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="font-semibold">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={rideData.date}
                      onChange={(e) => setRideData({ ...rideData, date: e.target.value })}
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="font-semibold">
                      Start Time
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={rideData.time}
                      onChange={(e) => setRideData({ ...rideData, time: e.target.value })}
                      className="h-11"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="font-semibold">
                      Duration (hours)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      step="0.5"
                      placeholder="e.g., 3"
                      value={rideData.estimatedDuration}
                      onChange={(e) =>
                        setRideData({ ...rideData, estimatedDuration: e.target.value })
                      }
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="distance" className="font-semibold">
                      Distance (km)
                    </Label>
                    <Input
                      id="distance"
                      type="number"
                      placeholder="e.g., 85"
                      value={rideData.estimatedDistance}
                      onChange={(e) =>
                        setRideData({ ...rideData, estimatedDistance: e.target.value })
                      }
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">Difficulty</Label>
                    <Select
                      value={rideData.difficulty}
                      onValueChange={(value) =>
                        setRideData({ ...rideData, difficulty: value })
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Pick level" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Pace</Label>
                    <Select
                      value={rideData.pace}
                      onValueChange={(value) => setRideData({ ...rideData, pace: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Pick pace" />
                      </SelectTrigger>
                      <SelectContent>
                        {paceOptions.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">Terrain</Label>
                    <Select
                      value={rideData.terrain}
                      onValueChange={(value) =>
                        setRideData({ ...rideData, terrain: value })
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Pick terrain" />
                      </SelectTrigger>
                      <SelectContent>
                        {terrainTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants" className="font-semibold">
                      Max Riders
                    </Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      min="2"
                      max="100"
                      value={rideData.maxParticipants}
                      onChange={(e) =>
                        setRideData({ ...rideData, maxParticipants: e.target.value })
                      }
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="button"
                className="w-full h-12 text-base"
                disabled={!rideData.date || !rideData.time}
                onClick={() => setStep(4)}
              >
                Ready to Launch →
              </Button>
            </div>
          )}

          {/* Step 4: Launch */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                  <span className="text-3xl">🚀</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Launch your ride</h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Add some photos and final touches, then share with your crew.
                </p>
              </div>

              {/* Ride Preview */}
              <Card className="overflow-hidden border-2">
                <div className="h-20 bg-linear-to-br from-primary/20 to-primary/5 p-4 flex items-end">
                  <h3 className="text-lg font-bold">{rideData.title}</h3>
                </div>
                <CardContent className="p-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground flex-wrap">
                    <MapPin className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="truncate max-w-40">{startPoint?.name ?? '—'}</span>
                    <span className="mx-1">→</span>
                    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="truncate max-w-40">
                      {endPoint?.name ?? 'Same as start'}
                    </span>
                  </div>
                  {waypoints.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {waypoints.length} pit stop{waypoints.length > 1 ? 's' : ''}:{' '}
                      {waypoints.map((w) => w.name).join(' → ')}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
                    <span>
                      {rideData.date} at {rideData.time}
                    </span>
                    {rideData.difficulty && <span>· {rideData.difficulty}</span>}
                    {rideData.pace && <span>· {rideData.pace}</span>}
                    {rideData.terrain && <span>· {rideData.terrain}</span>}
                  </div>
                  {rideData.description && (
                    <p className="text-muted-foreground line-clamp-2">
                      {rideData.description}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Photos */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Add Ride Photos</Label>
                <label className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-border bg-muted/20 p-5 transition-all hover:border-primary/50 hover:bg-muted/40">
                  <ImagePlus className="w-8 h-8 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">
                      {rideMediaFiles.length > 0
                        ? `${rideMediaFiles.length} photo(s) selected`
                        : 'Choose photos'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Show the crew what to expect
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => setRideMediaFiles(Array.from(e.target.files || []))}
                  />
                </label>
              </div>

              {/* Privacy */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/20">
                  <div>
                    <p className="font-semibold">Private Ride</p>
                    <p className="text-sm text-muted-foreground">
                      Only invited riders can join
                    </p>
                  </div>
                  <Switch
                    checked={rideData.isPrivate}
                    onCheckedChange={(checked) =>
                      setRideData({ ...rideData, isPrivate: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/20">
                  <div>
                    <p className="font-semibold">Require Approval</p>
                    <p className="text-sm text-muted-foreground">
                      Approve riders before they join
                    </p>
                  </div>
                  <Switch
                    checked={rideData.requiresApproval}
                    onCheckedChange={(checked) =>
                      setRideData({ ...rideData, requiresApproval: checked })
                    }
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-lg font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Launching...' : '🔥 Launch the Ride'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
