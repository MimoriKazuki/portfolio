import Stripe from 'stripe'

// 遅延初期化でビルド時のエラーを回避
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    })
  }
  return stripeInstance
}

// 後方互換性のためのエクスポート（ランタイムでのみ使用）
export const stripe = {
  get checkout() { return getStripe().checkout },
  get webhooks() { return getStripe().webhooks },
} as unknown as Stripe
