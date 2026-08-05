const headers = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
}

export async function GET() {
  return Response.json(
    {
      status: 'ok',
      service: 'wikisubmission-org',
    },
    { headers }
  )
}

export async function HEAD() {
  return new Response(null, {
    status: 204,
    headers,
  })
}
