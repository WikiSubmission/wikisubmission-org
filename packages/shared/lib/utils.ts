import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeAgo(date: string | Date | null | undefined) {
  if (!date) return 'never'

  // If it's a string and looks like an ISO timestamp without timezone, assume UTC
  let dateToParse = date
  if (
    typeof date === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(date) &&
    !date.includes('Z') &&
    !date.includes('+') &&
    !/[-+]\d{2}:\d{2}$/.test(date)
  ) {
    dateToParse = `${date}Z`
  }

  const d = new Date(dateToParse)
  if (isNaN(d.getTime())) return 'unknown'

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)
  const absDiff = Math.abs(diffInSeconds)
  const isFuture = diffInSeconds < 0

  if (absDiff < 30) return 'just now'

  let value: number
  let unit: string

  if (absDiff < 3600) {
    value = Math.floor(absDiff / 60)
    unit = 'm'
  } else if (absDiff < 86400) {
    value = Math.floor(absDiff / 3600)
    unit = 'h'
  } else if (absDiff < 2592000) {
    value = Math.floor(absDiff / 86400)
    unit = 'd'
  } else if (absDiff < 31536000) {
    value = Math.floor(absDiff / 2592000)
    unit = 'mo'
  } else {
    value = Math.floor(absDiff / 31536000)
    unit = 'y'
  }

  return isFuture ? `in ${value}${unit}` : `${value}${unit} ago`
}
