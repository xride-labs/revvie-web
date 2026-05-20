import { NextResponse } from 'next/server'

function sanitizeString(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export async function GET() {
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
