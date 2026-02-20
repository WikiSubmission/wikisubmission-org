'use server'

import { supabaseInternal } from '@/lib/supabase'

export const getNotifications = async () => {
  const { data, error } = await supabaseInternal()
    .from('ws_notifications_ios')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const sendNotification = async ({
  apiKey,
  deviceToken,
  type,
  message,
  force,
}: {
  apiKey: string
  deviceToken: string
  type: string
  message?: { title?: string; body?: string }
  force: boolean
}) => {
  const req = await fetch(
    `https://push-notifications.wikisubmission.org/send-notification`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        device_token: deviceToken,
        platform: 'ios',
        type: type,
        ...(force && { force: 'true' }),
        ...(message?.title && { title: message.title }),
        ...(message?.body && { message: message.body }),
      }),
    }
  )

  const res = await req.json()
  if (!req.ok) {
    throw new Error(res.error || 'Failed to send notification')
  }
  return res
}
