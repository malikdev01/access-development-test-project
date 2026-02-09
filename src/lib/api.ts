import type { Product, CreateProductRequest, UpdateProductRequest, FilterOptions } from '@/types/product'
import type { ApiResponse } from '@/types/api'
import { mockProducts } from '@/data/mockProducts'
import { getEffectivePrice } from '@/utils/pricing'

// Simulate API delay
const delay = (ms: number): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

export async function getProducts(filters?: FilterOptions): Promise<Product[]> {
  await delay(800) // Simulate slow API

  const products = [...mockProducts]

  if (!filters) {
    return products
  }

  const { category, minPrice, maxPrice, inStock } = filters

  return products.filter((p) => {
    if (category && p.category !== category) {
      return false
    }

    const effectivePrice = getEffectivePrice(p)

    if (minPrice != null && effectivePrice < minPrice) {
      return false
    }

    if (maxPrice != null && effectivePrice > maxPrice) {
      return false
    }

    if (inStock !== undefined) {
      if (inStock && p.stock <= 0) return false
      if (!inStock && p.stock > 0) return false
    }

    return true
  })
}

export async function getProduct(id: string): Promise<Product | null> {
  await delay(300)
  
  const product = mockProducts.find(p => p.id === id)
  return product || null
}

export async function createProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
  await delay(500)
  
  // Basic server-side validation to complement client-side checks
  if (!data.name?.trim()) {
    throw new Error('Product name is required')
  }

  if (!data.category?.trim()) {
    throw new Error('Product category is required')
  }

  if (!Number.isFinite(data.price) || data.price < 0 || data.price > 999_999) {
    throw new Error('Price must be between 0 and 999,999')
  }

  if (!Number.isInteger(data.stock) || data.stock < 0) {
    throw new Error('Stock must be a non‑negative integer')
  }

  if (!data.sku?.trim()) {
    throw new Error('SKU is required')
  }
  
  const newProduct: Product = {
    // Simple deterministic-ish ID for mock data; in real apps use database IDs/UUIDs
    id: Math.random().toString(36).slice(2, 11),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  // In a real app, this would persist to a database
  mockProducts.push(newProduct)
  
  return {
    success: true,
    data: newProduct,
    message: 'Product created successfully'
  }
}

export async function updateProduct(data: UpdateProductRequest): Promise<ApiResponse<Product>> {
  await delay(400)
  
  const index = mockProducts.findIndex(p => p.id === data.id)
  
  if (index === -1) {
    throw new Error('Product not found')
  }
  
  // BUG: This doesn't properly merge the updated data
  const updatedProduct = {
    ...mockProducts[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  
  mockProducts[index] = updatedProduct
  
  return {
    success: true,
    data: updatedProduct,
    message: 'Product updated successfully'
  }
}

export async function deleteProduct(id: string): Promise<ApiResponse<void>> {
  await delay(300)
  
  const index = mockProducts.findIndex(p => p.id === id)
  
  if (index === -1) {
    throw new Error('Product not found')
  }
  
  mockProducts.splice(index, 1)
  
  return {
    success: true,
    data: undefined,
    message: 'Product deleted successfully'
  }
}