'use client'

import { useEffect, useState } from 'react'
import { ArrowDownToLine, Smartphone } from 'lucide-react'

interface DownloadClientProps {
  apkHref: string
}

export function DownloadClient({ apkHref }: DownloadClientProps) {
  // null until client mounts — prevents SSR/hydration flash of the warning
  const [platform, setPlatform] = useState<'android' | 'other' | null>(null)

  useEffect(() => {
    setPlatform(/android/i.test(navigator.userAgent) ? 'android' : 'other')
  }, [])

  return (
    <div className="mt-8 flex flex-col gap-4">
      <a
        href={apkHref}
        download
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-teal text-canvas font-semibold py-4 px-8 text-base transition-all hover:scale-[1.02] hover:bg-brand-teal/90 w-fit"
      >
        <ArrowDownToLine size={20} />
        Download APK
      </a>

      {platform === 'other' && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 max-w-sm">
          <Smartphone size={16} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-300/80 leading-relaxed">
            Looks like you&apos;re not on Android. Open this page on your Android phone to
            install.
          </p>
        </div>
      )}
    </div>
  )
}
