import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function RideGallery({
  images,
  isOrganizer,
  onAddPhotos,
}: {
  images: string[]
  isOrganizer: boolean
  onAddPhotos: () => void
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Ride Gallery</CardTitle>
          {isOrganizer && (
            <Button variant="outline" size="sm" onClick={onAddPhotos}>
              Add Photos
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <div className="text-sm text-muted-foreground">No photos yet.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {images.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="aspect-square overflow-hidden rounded-lg bg-muted"
              >
                <img src={url} alt="Ride media" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
