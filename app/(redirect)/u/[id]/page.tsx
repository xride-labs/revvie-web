import type { Metadata } from 'next'
import { ShareRedirect } from '@/components/share/share-redirect'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const title = 'View this rider on Zoomies'
  const description =
    'Someone shared their rider profile with you. Open Zoomies to see their garage, rides, and connect.'
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `https://zoomies.xride-labs.in/u/${id}`,
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function ProfileSharePage({ params }: PageProps) {
  const { id } = await params
  return (
    <ShareRedirect
      kind="profile"
      id={id}
      title="A rider wants to connect"
      description="Open Zoomies to view their profile, see their bikes and rides, and send a connection or message request."
    />
  )
}
