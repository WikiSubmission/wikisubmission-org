'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// The app opens on the Quran. A static export cannot redirect on the server,
// so the root page forwards on the client.
export default function Home() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/quran/')
  }, [router])
  return null
}
