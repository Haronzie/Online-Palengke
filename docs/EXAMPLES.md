# Usage Examples and Code Snippets

## Table of Contents

1. [Getting Started](#getting-started)
2. [Database Operations](#database-operations)
3. [Authentication Examples](#authentication-examples)
4. [Real-time Features](#real-time-features)
5. [Error Handling Patterns](#error-handling-patterns)
6. [Advanced Patterns](#advanced-patterns)
7. [Testing Examples](#testing-examples)
8. [Integration Examples](#integration-examples)

## Getting Started

### Basic Setup

```typescript
// src/app.ts
import { supabase } from './config/supabase.js'

// Test connection
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('count(*)')
      .limit(1)
    
    if (error) throw error
    console.log('✅ Database connection successful!')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Initialize application
async function initializeApp() {
  const isConnected = await testConnection()
  if (!isConnected) {
    process.exit(1)
  }
  
  console.log('🚀 Online Palengke Backend Ready!')
}

initializeApp()
```

### Environment Setup Example

```typescript
// src/config/environment.ts
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

interface Config {
  supabase: {
    url: string
    anonKey: string
    serviceRoleKey?: string
  }
  app: {
    port: number
    environment: string
  }
}

export const config: Config = {
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  app: {
    port: parseInt(process.env.PORT || '3000'),
    environment: process.env.NODE_ENV || 'development'
  }
}

// Validation
export function validateConfig(): void {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY']
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}
```

## Database Operations

### CRUD Operations for Vendors

```typescript
// src/services/vendorService.ts
import { supabase } from '../config/supabase.js'

export interface Vendor {
  id?: string
  user_id: string
  name: string
  description?: string
  location: string
  contact_info?: Record<string, any>
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export class VendorService {
  // Create a new vendor
  static async createVendor(vendorData: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>): Promise<Vendor> {
    const { data, error } = await supabase
      .from('vendors')
      .insert({
        ...vendorData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create vendor: ${error.message}`)
    return data
  }

  // Get vendor by ID
  static async getVendorById(id: string): Promise<Vendor | null> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw new Error(`Failed to fetch vendor: ${error.message}`)
    }
    return data
  }

  // Get all vendors with pagination
  static async getVendors(options: {
    page?: number
    limit?: number
    location?: string
    isActive?: boolean
  } = {}): Promise<{ vendors: Vendor[], total: number, page: number, totalPages: number }> {
    const { page = 1, limit = 10, location, isActive } = options
    const offset = (page - 1) * limit

    let query = supabase
      .from('vendors')
      .select('*', { count: 'exact' })

    // Add filters
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }
    if (isActive !== undefined) {
      query = query.eq('is_active', isActive)
    }

    // Add pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw new Error(`Failed to fetch vendors: ${error.message}`)

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      vendors: data || [],
      total,
      page,
      totalPages
    }
  }

  // Update vendor
  static async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor> {
    const { data, error } = await supabase
      .from('vendors')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Failed to update vendor: ${error.message}`)
    return data
  }

  // Delete vendor (soft delete by setting is_active to false)
  static async deleteVendor(id: string): Promise<void> {
    const { error } = await supabase
      .from('vendors')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw new Error(`Failed to delete vendor: ${error.message}`)
  }

  // Get vendor's products
  static async getVendorProducts(vendorId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        vendor:vendors(name, location)
      `)
      .eq('vendor_id', vendorId)
      .eq('in_stock', true)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch vendor products: ${error.message}`)
    return data || []
  }
}
```

### Product Management Examples

```typescript
// src/services/productService.ts
import { supabase } from '../config/supabase.js'

export interface Product {
  id?: string
  vendor_id: string
  name: string
  description?: string
  price: number
  category?: string
  image_urls?: string[]
  in_stock?: boolean
  stock_quantity?: number
  created_at?: string
  updated_at?: string
}

export class ProductService {
  // Create product with image upload
  static async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    // Validate price
    if (productData.price < 0) {
      throw new Error('Price cannot be negative')
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        vendor:vendors(name, location)
      `)
      .single()

    if (error) throw new Error(`Failed to create product: ${error.message}`)
    return data
  }

  // Search products with filters
  static async searchProducts(filters: {
    query?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    vendorId?: string
    location?: string
    inStock?: boolean
    page?: number
    limit?: number
  } = {}): Promise<{ products: Product[], total: number }> {
    const { 
      query, 
      category, 
      minPrice, 
      maxPrice, 
      vendorId, 
      location, 
      inStock = true,
      page = 1, 
      limit = 20 
    } = filters

    const offset = (page - 1) * limit

    let dbQuery = supabase
      .from('products')
      .select(`
        *,
        vendor:vendors(name, location, is_active)
      `, { count: 'exact' })

    // Text search
    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    }

    // Filters
    if (category) {
      dbQuery = dbQuery.eq('category', category)
    }
    if (minPrice !== undefined) {
      dbQuery = dbQuery.gte('price', minPrice)
    }
    if (maxPrice !== undefined) {
      dbQuery = dbQuery.lte('price', maxPrice)
    }
    if (vendorId) {
      dbQuery = dbQuery.eq('vendor_id', vendorId)
    }
    if (inStock) {
      dbQuery = dbQuery.eq('in_stock', true)
    }

    // Only show products from active vendors
    dbQuery = dbQuery.eq('vendor.is_active', true)

    // Location filter (requires join)
    if (location) {
      dbQuery = dbQuery.ilike('vendor.location', `%${location}%`)
    }

    // Pagination and ordering
    dbQuery = dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await dbQuery

    if (error) throw new Error(`Failed to search products: ${error.message}`)

    return {
      products: data || [],
      total: count || 0
    }
  }

  // Update stock quantity
  static async updateStock(productId: string, quantity: number): Promise<Product> {
    if (quantity < 0) {
      throw new Error('Stock quantity cannot be negative')
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        stock_quantity: quantity,
        in_stock: quantity > 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update stock: ${error.message}`)
    return data
  }

  // Bulk update prices (for vendor promotions)
  static async bulkUpdatePrices(vendorId: string, discountPercentage: number): Promise<number> {
    if (discountPercentage < 0 || discountPercentage > 100) {
      throw new Error('Discount percentage must be between 0 and 100')
    }

    const multiplier = (100 - discountPercentage) / 100

    const { data, error } = await supabase.rpc('update_vendor_product_prices', {
      vendor_id: vendorId,
      price_multiplier: multiplier
    })

    if (error) throw new Error(`Failed to bulk update prices: ${error.message}`)
    return data
  }
}
```

### Order Management Examples

```typescript
// src/services/orderService.ts
import { supabase } from '../config/supabase.js'

export interface Order {
  id?: string
  customer_id: string
  vendor_id: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  delivery_address?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface OrderItem {
  id?: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
}

export class OrderService {
  // Create order with items
  static async createOrder(orderData: {
    customer_id: string
    vendor_id: string
    items: Array<{ product_id: string, quantity: number }>
    delivery_address?: string
    notes?: string
  }): Promise<Order> {
    // Start transaction
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price, stock_quantity, in_stock')
      .in('id', orderData.items.map(item => item.product_id))

    if (productsError) throw new Error(`Failed to fetch products: ${productsError.message}`)

    // Validate stock and calculate total
    let totalAmount = 0
    const orderItems: Array<{ product_id: string, quantity: number, unit_price: number }> = []

    for (const item of orderData.items) {
      const product = products.find(p => p.id === item.product_id)
      if (!product) {
        throw new Error(`Product ${item.product_id} not found`)
      }
      if (!product.in_stock || product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.product_id}`)
      }

      const itemTotal = product.price * item.quantity
      totalAmount += itemTotal

      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.price
      })
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: orderData.customer_id,
        vendor_id: orderData.vendor_id,
        total_amount: totalAmount,
        delivery_address: orderData.delivery_address,
        notes: orderData.notes,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (orderError) throw new Error(`Failed to create order: ${orderError.message}`)

    // Create order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId)

    if (itemsError) {
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', order.id)
      throw new Error(`Failed to create order items: ${itemsError.message}`)
    }

    // Update stock quantities
    for (const item of orderData.items) {
      const product = products.find(p => p.id === item.product_id)!
      const newQuantity = product.stock_quantity - item.quantity

      await supabase
        .from('products')
        .update({
          stock_quantity: newQuantity,
          in_stock: newQuantity > 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.product_id)
    }

    return order
  }

  // Get order with items
  static async getOrderWithItems(orderId: string): Promise<Order & { items: any[] }> {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        customer:auth.users(email),
        vendor:vendors(name, location)
      `)
      .eq('id', orderId)
      .single()

    if (orderError) throw new Error(`Failed to fetch order: ${orderError.message}`)

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products(name, image_urls)
      `)
      .eq('order_id', orderId)

    if (itemsError) throw new Error(`Failed to fetch order items: ${itemsError.message}`)

    return { ...order, items: items || [] }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: Order['status'], updatedBy: string): Promise<Order> {
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`)
    }

    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update order status: ${error.message}`)

    // Log status change
    await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        status,
        updated_by: updatedBy,
        created_at: new Date().toISOString()
      })

    return data
  }

  // Get orders for customer
  static async getCustomerOrders(customerId: string, options: {
    status?: Order['status']
    page?: number
    limit?: number
  } = {}): Promise<{ orders: Order[], total: number }> {
    const { status, page = 1, limit = 10 } = options
    const offset = (page - 1) * limit

    let query = supabase
      .from('orders')
      .select(`
        *,
        vendor:vendors(name, location)
      `, { count: 'exact' })
      .eq('customer_id', customerId)

    if (status) {
      query = query.eq('status', status)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw new Error(`Failed to fetch customer orders: ${error.message}`)

    return {
      orders: data || [],
      total: count || 0
    }
  }
}
```

## Authentication Examples

### User Registration and Login

```typescript
// src/services/authService.ts
import { supabase } from '../config/supabase.js'

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  phone?: string
  address?: string
  role: 'customer' | 'vendor' | 'admin'
}

export class AuthService {
  // Register new user
  static async registerUser(userData: {
    email: string
    password: string
    full_name: string
    phone?: string
    role?: 'customer' | 'vendor'
  }): Promise<{ user: any, profile: UserProfile }> {
    const { email, password, full_name, phone, role = 'customer' } = userData

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role
        }
      }
    })

    if (authError) throw new Error(`Registration failed: ${authError.message}`)
    if (!authData.user) throw new Error('User creation failed')

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name,
        phone,
        role,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) {
      // Cleanup auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error(`Profile creation failed: ${profileError.message}`)
    }

    return {
      user: authData.user,
      profile
    }
  }

  // Login user
  static async loginUser(email: string, password: string): Promise<{ user: any, session: any, profile: UserProfile }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw new Error(`Login failed: ${error.message}`)

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) throw new Error(`Failed to fetch profile: ${profileError.message}`)

    return {
      user: data.user,
      session: data.session,
      profile
    }
  }

  // Get current user profile
  static async getCurrentUser(): Promise<{ user: any, profile: UserProfile } | null> {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) return null

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) return null

    return { user, profile }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update profile: ${error.message}`)
    return data
  }

  // Reset password
  static async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    })

    if (error) throw new Error(`Password reset failed: ${error.message}`)
  }

  // Logout user
  static async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(`Logout failed: ${error.message}`)
  }
}
```

### JWT Token Validation

```typescript
// src/middleware/auth.ts
import jwt from 'jsonwebtoken'
import { supabase } from '../config/supabase.js'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
  }
}

// Middleware to validate JWT tokens
export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }

    // Get user profile for role information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return res.status(500).json({ error: 'Failed to fetch user profile' })
    }

    req.user = {
      id: user.id,
      email: user.email!,
      role: profile.role
    }

    next()
  } catch (error) {
    return res.status(403).json({ error: 'Token validation failed' })
  }
}

// Role-based authorization middleware
export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    next()
  }
}
```

## Real-time Features

### Real-time Order Updates

```typescript
// src/services/realtimeService.ts
import { supabase } from '../config/supabase.js'

export class RealtimeService {
  // Subscribe to order status changes
  static subscribeToOrderUpdates(orderId: string, callback: (update: any) => void) {
    return supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      }, callback)
      .subscribe()
  }

  // Subscribe to new orders for a vendor
  static subscribeToVendorOrders(vendorId: string, callback: (order: any) => void) {
    return supabase
      .channel(`vendor-orders-${vendorId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `vendor_id=eq.${vendorId}`
      }, callback)
      .subscribe()
  }

  // Subscribe to product stock changes
  static subscribeToStockUpdates(productIds: string[], callback: (update: any) => void) {
    return supabase
      .channel('stock-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'products',
        filter: `id=in.(${productIds.join(',')})`
      }, callback)
      .subscribe()
  }

  // Broadcast custom events
  static async broadcastEvent(channel: string, event: string, payload: any) {
    return supabase
      .channel(channel)
      .send({
        type: 'broadcast',
        event,
        payload
      })
  }
}
```

### WebSocket Integration Example

```typescript
// src/websocket/orderUpdates.ts
import WebSocket from 'ws'
import { RealtimeService } from '../services/realtimeService.js'

export class OrderWebSocketHandler {
  private clients: Map<string, WebSocket> = new Map()

  // Register client for order updates
  registerClient(clientId: string, ws: WebSocket, orderId: string) {
    this.clients.set(clientId, ws)

    // Subscribe to order updates
    const subscription = RealtimeService.subscribeToOrderUpdates(orderId, (update) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'order_update',
          data: update
        }))
      }
    })

    // Handle client disconnect
    ws.on('close', () => {
      this.clients.delete(clientId)
      subscription.unsubscribe()
    })

    // Handle client messages
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString())
        await this.handleClientMessage(clientId, data)
      } catch (error) {
        console.error('Error handling client message:', error)
      }
    })
  }

  private async handleClientMessage(clientId: string, message: any) {
    const ws = this.clients.get(clientId)
    if (!ws) return

    switch (message.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }))
        break
      
      case 'subscribe_vendor_orders':
        // Handle vendor order subscription
        break
      
      default:
        console.warn('Unknown message type:', message.type)
    }
  }

  // Broadcast to all connected clients
  broadcast(message: any) {
    const messageStr = JSON.stringify(message)
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr)
      }
    })
  }
}
```

## Error Handling Patterns

### Custom Error Classes

```typescript
// src/utils/errors.ts
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(`Database error: ${message}`, 500)
    if (originalError) {
      this.stack = originalError.stack
    }
  }
}
```

### Error Handler Middleware

```typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/errors.js'

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = 500
  let message = 'Internal server error'

  if (error instanceof AppError) {
    statusCode = error.statusCode
    message = error.message
  } else if (error.name === 'ValidationError') {
    statusCode = 400
    message = error.message
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  }

  // Log error for debugging
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  })

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
}

// Async error wrapper
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
```

### Database Transaction Example

```typescript
// src/services/transactionService.ts
import { supabase } from '../config/supabase.js'

export class TransactionService {
  // Example: Transfer product between vendors
  static async transferProduct(productId: string, fromVendorId: string, toVendorId: string): Promise<void> {
    try {
      // Start transaction (using RPC function)
      const { data, error } = await supabase.rpc('transfer_product', {
        p_product_id: productId,
        p_from_vendor_id: fromVendorId,
        p_to_vendor_id: toVendorId
      })

      if (error) throw new DatabaseError('Product transfer failed', error)

      console.log('Product transferred successfully:', data)
    } catch (error) {
      console.error('Transaction failed:', error)
      throw error
    }
  }

  // Example: Process order with stock validation
  static async processOrderWithValidation(orderData: {
    customer_id: string
    vendor_id: string
    items: Array<{ product_id: string, quantity: number }>
  }): Promise<any> {
    try {
      // Use a database function for atomic operations
      const { data, error } = await supabase.rpc('process_order_atomic', {
        p_customer_id: orderData.customer_id,
        p_vendor_id: orderData.vendor_id,
        p_items: orderData.items
      })

      if (error) throw new DatabaseError('Order processing failed', error)

      return data
    } catch (error) {
      console.error('Order processing failed:', error)
      throw error
    }
  }
}
```

## Advanced Patterns

### Repository Pattern Implementation

```typescript
// src/repositories/baseRepository.ts
import { supabase } from '../config/supabase.js'

export abstract class BaseRepository<T> {
  protected tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  async findById(id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new DatabaseError(`Failed to find ${this.tableName}`, error)
    }
    return data
  }

  async findAll(options: {
    page?: number
    limit?: number
    orderBy?: string
    ascending?: boolean
  } = {}): Promise<{ data: T[], total: number }> {
    const { page = 1, limit = 10, orderBy = 'created_at', ascending = false } = options
    const offset = (page - 1) * limit

    const { data, error, count } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1)

    if (error) throw new DatabaseError(`Failed to fetch ${this.tableName}`, error)

    return {
      data: data || [],
      total: count || 0
    }
  }

  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw new DatabaseError(`Failed to create ${this.tableName}`, error)
    return result
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new DatabaseError(`Failed to update ${this.tableName}`, error)
    return result
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) throw new DatabaseError(`Failed to delete ${this.tableName}`, error)
  }
}

// Implementation for vendors
export class VendorRepository extends BaseRepository<Vendor> {
  constructor() {
    super('vendors')
  }

  async findByUserId(userId: string): Promise<Vendor | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new DatabaseError('Failed to find vendor by user ID', error)
    }
    return data
  }

  async findByLocation(location: string): Promise<Vendor[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .ilike('location', `%${location}%`)
      .eq('is_active', true)

    if (error) throw new DatabaseError('Failed to find vendors by location', error)
    return data || []
  }
}
```

### Caching Layer

```typescript
// src/services/cacheService.ts
interface CacheItem<T> {
  data: T
  expiry: number
}

export class MemoryCache {
  private cache: Map<string, CacheItem<any>> = new Map()
  private defaultTTL: number = 300000 // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL)
    this.cache.set(key, { data, expiry })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean expired items
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

// Cached service wrapper
export class CachedVendorService {
  private cache = new MemoryCache()

  async getVendorById(id: string): Promise<Vendor | null> {
    const cacheKey = `vendor:${id}`
    let vendor = this.cache.get<Vendor>(cacheKey)

    if (!vendor) {
      vendor = await VendorService.getVendorById(id)
      if (vendor) {
        this.cache.set(cacheKey, vendor, 300000) // 5 minutes
      }
    }

    return vendor
  }

  async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor> {
    const vendor = await VendorService.updateVendor(id, updates)
    
    // Invalidate cache
    this.cache.delete(`vendor:${id}`)
    
    return vendor
  }
}
```

## Testing Examples

### Unit Tests with Jest

```typescript
// tests/services/vendorService.test.ts
import { VendorService } from '../../src/services/vendorService.js'
import { supabase } from '../../src/config/supabase.js'

// Mock Supabase
jest.mock('../../src/config/supabase.js', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }
}))

describe('VendorService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createVendor', () => {
    it('should create a vendor successfully', async () => {
      const mockVendorData = {
        user_id: 'user-123',
        name: 'Test Vendor',
        location: 'Dipolog City'
      }

      const mockCreatedVendor = {
        id: 'vendor-123',
        ...mockVendorData,
        created_at: '2024-01-01T00:00:00Z'
      }

      // Setup mock chain
      const mockSingle = jest.fn().mockResolvedValue({ data: mockCreatedVendor, error: null })
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect })
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert })
      
      ;(supabase.from as jest.Mock) = mockFrom

      const result = await VendorService.createVendor(mockVendorData)

      expect(mockFrom).toHaveBeenCalledWith('vendors')
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        ...mockVendorData,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      }))
      expect(result).toEqual(mockCreatedVendor)
    })

    it('should throw error when creation fails', async () => {
      const mockVendorData = {
        user_id: 'user-123',
        name: 'Test Vendor',
        location: 'Dipolog City'
      }

      const mockError = { message: 'Database error' }
      const mockSingle = jest.fn().mockResolvedValue({ data: null, error: mockError })
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect })
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert })
      
      ;(supabase.from as jest.Mock) = mockFrom

      await expect(VendorService.createVendor(mockVendorData)).rejects.toThrow('Failed to create vendor: Database error')
    })
  })
})
```

### Integration Tests

```typescript
// tests/integration/api.test.ts
import request from 'supertest'
import { app } from '../../src/app.js'
import { supabase } from '../../src/config/supabase.js'

describe('API Integration Tests', () => {
  let authToken: string
  let testVendorId: string

  beforeAll(async () => {
    // Setup test user and get auth token
    const { data: authData } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword'
    })
    authToken = authData.session?.access_token || ''
  })

  afterAll(async () => {
    // Cleanup test data
    if (testVendorId) {
      await supabase.from('vendors').delete().eq('id', testVendorId)
    }
  })

  describe('POST /api/vendors', () => {
    it('should create a new vendor', async () => {
      const vendorData = {
        name: 'Test Vendor API',
        description: 'Test description',
        location: 'Dipolog City'
      }

      const response = await request(app)
        .post('/api/vendors')
        .set('Authorization', `Bearer ${authToken}`)
        .send(vendorData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe(vendorData.name)
      testVendorId = response.body.data.id
    })

    it('should return 401 without auth token', async () => {
      const vendorData = {
        name: 'Test Vendor',
        location: 'Dipolog City'
      }

      await request(app)
        .post('/api/vendors')
        .send(vendorData)
        .expect(401)
    })
  })

  describe('GET /api/vendors', () => {
    it('should return paginated vendors', async () => {
      const response = await request(app)
        .get('/api/vendors?page=1&limit=10')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.vendors).toBeInstanceOf(Array)
      expect(response.body.data.total).toBeGreaterThanOrEqual(0)
    })
  })
})
```

## Integration Examples

### Express.js API Routes

```typescript
// src/routes/vendors.ts
import express from 'express'
import { VendorService } from '../services/vendorService.js'
import { authenticateToken, requireRole } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { ValidationError } from '../utils/errors.js'

const router = express.Router()

// Get all vendors
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, location } = req.query
  
  const options = {
    page: parseInt(page as string) || 1,
    limit: parseInt(limit as string) || 10,
    location: location as string,
    isActive: true
  }

  const result = await VendorService.getVendors(options)
  
  res.json({
    success: true,
    data: result
  })
}))

// Get vendor by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  
  const vendor = await VendorService.getVendorById(id)
  
  if (!vendor) {
    return res.status(404).json({
      success: false,
      error: 'Vendor not found'
    })
  }

  res.json({
    success: true,
    data: vendor
  })
}))

// Create vendor (authenticated users only)
router.post('/', 
  authenticateToken,
  requireRole(['customer', 'admin']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { name, description, location, contact_info } = req.body

    // Validation
    if (!name || !location) {
      throw new ValidationError('Name and location are required')
    }

    const vendorData = {
      user_id: req.user!.id,
      name,
      description,
      location,
      contact_info
    }

    const vendor = await VendorService.createVendor(vendorData)

    res.status(201).json({
      success: true,
      data: vendor
    })
  })
)

// Update vendor (vendor owner or admin only)
router.put('/:id',
  authenticateToken,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const updates = req.body

    // Check ownership or admin role
    const vendor = await VendorService.getVendorById(id)
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      })
    }

    if (vendor.user_id !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this vendor'
      })
    }

    const updatedVendor = await VendorService.updateVendor(id, updates)

    res.json({
      success: true,
      data: updatedVendor
    })
  })
)

export default router
```

### React Native Frontend Integration

```typescript
// mobile/src/services/api.ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'

export class APIService {
  private static authToken: string | null = null

  static setAuthToken(token: string) {
    this.authToken = token
  }

  private static async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
        ...options.headers
      },
      ...options
    }

    const response = await fetch(url, config)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Request failed')
    }

    return response.json()
  }

  // Vendor API methods
  static async getVendors(page = 1, limit = 10, location?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(location && { location })
    })

    return this.request(`/vendors?${params}`)
  }

  static async getVendorById(id: string) {
    return this.request(`/vendors/${id}`)
  }

  static async createVendor(vendorData: any) {
    return this.request('/vendors', {
      method: 'POST',
      body: JSON.stringify(vendorData)
    })
  }

  // Product API methods
  static async searchProducts(filters: any) {
    const params = new URLSearchParams(filters)
    return this.request(`/products/search?${params}`)
  }

  // Order API methods
  static async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    })
  }

  static async getMyOrders(page = 1) {
    return this.request(`/orders/my?page=${page}`)
  }
}
```

This comprehensive documentation provides practical examples for all the public APIs, functions, and components in your Online Palengke backend. Each example includes proper error handling, type safety, and follows best practices for Node.js and Supabase development.