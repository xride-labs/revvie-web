import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, Plus } from 'lucide-react'
import type { GalleryItem } from '../_lib/types'

export function GalleryTab({
  gallery,
  canManage,
  onAddPhotos,
}: {
  gallery: GalleryItem[]
  canManage?: boolean
  onAddPhotos?: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gallery</CardTitle>
            <CardDescription>Photos from rides, rallies, and club events</CardDescription>
          </div>
          {canManage && onAddPhotos && (
            <Button size="sm" variant="outline" onClick={onAddPhotos} className="gap-1.5">
              <Plus className="w-4 h-4" />
              Add Photos
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {gallery.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground space-y-3">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/30" />
            <p>No photos in the club gallery yet.</p>
            {canManage && onAddPhotos && (
              <Button size="sm" variant="outline" onClick={onAddPhotos} className="gap-1.5">
                <Plus className="w-4 h-4" />
                Upload First Photos
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gallery.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square bg-muted rounded-xl border border-white/10 overflow-hidden shadow-md hover:border-brand-red/50 transition-colors"
              >
                {item.url ? (
                  <img
                    src={item.url}
                    alt="Club gallery"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

