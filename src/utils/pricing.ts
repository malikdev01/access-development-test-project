import type { Product } from '@/types/product'

// Central place to describe how discounts work in the app
export function getDiscountedPrice(product: Product): number | null {
  // Example rule: apply a 10% discount to higher-priced items
  if (product.price >= 80) {
    const discounted = product.price * 0.9
    return Number(discounted.toFixed(2))
  }

  return null
}

// Effective price that should be used for filtering and comparisons
export function getEffectivePrice(product: Product): number {
  const discounted = getDiscountedPrice(product)
  return discounted ?? product.price
}

