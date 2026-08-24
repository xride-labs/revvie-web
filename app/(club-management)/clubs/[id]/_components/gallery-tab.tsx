import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Image as ImageIcon } from 'lucide-react'
import type { GalleryItem } from '../_lib/types'

export function GalleryTab({ gallery }: { gallery: GalleryItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gallery</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden"
            >
              {item.url ? (
                <img
                  src={item.url}
                  alt="Club gallery"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
