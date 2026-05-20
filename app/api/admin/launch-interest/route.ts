import { NextResponse } from 'next/server'
import { getServerSession, hasRole } from '@/lib/auth-server'

function sanitizeString(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export async function GET() {
  const session = await getServerSession()
  if (!session || !hasRole(session, 'ADMIN', 'CO_ADMIN')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
  }

  const responsesUrl = sanitizeString(process.env.GOOGLE_FORM_RESPONSES_URL)

  if (!responsesUrl) {
    console.warn(
      'GOOGLE_FORM_RESPONSES_URL is not set or is empty. Returning null for responsesUrl.',
    )
  }

  return NextResponse.json(
    {
      googleForm: {
        responsesUrl: responsesUrl || null,
      },
    },
    {
      headers: {
        'cache-control': 'no-store',
      },
    },
  )
}
