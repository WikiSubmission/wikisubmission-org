import Stripe from 'stripe'

export const stripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('Stripe secret key not found')
  }
  return new Stripe(secretKey, {
    apiVersion: '2026-01-28.clover',
  })
}
