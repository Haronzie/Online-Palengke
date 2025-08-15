import axios, { AxiosResponse } from 'axios'

// Type definitions
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword?: string
}

export interface User {
  _id: string
  name: string
  email: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  stock: number
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  product: Product | string
  quantity: number
  price: number
}

export interface Order {
  _id: string
  user: User | string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ProductsParams {
  category?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Get API URL from environment variables with fallback
const getApiUrl = (): string => {
  // Vite environment variables
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // Legacy CRA environment variables (for easier migration)
  if (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL
  }
  
  // Fallback
  return 'http://localhost:3002/api'
}

const API_URL = getApiUrl()

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for sending cookies
})

// Request interceptor to add the auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token expiration or other auth errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // For example, redirect to login or refresh token
      localStorage.removeItem('token')
      // Optionally redirect to the login page
      // window.location.href = '/login';
    }
    return Promise.reject(error)
  }
)

// Authentication endpoints
export const login = (credentials: LoginCredentials): Promise<AxiosResponse<ApiResponse<AuthResponse>>> =>
  api.post('/auth/login', credentials)

export const register = (userData: RegisterData): Promise<AxiosResponse<ApiResponse<User>>> =>
  api.post('/auth/register', userData)

export const getMe = (): Promise<AxiosResponse<ApiResponse<User>>> =>
  api.get('/auth/me')

export const logout = (): Promise<AxiosResponse<ApiResponse<null>>> =>
  api.get('/auth/logout')

// Product endpoints
export const getProducts = (params?: ProductsParams): Promise<AxiosResponse<ApiResponse<Product[]>>> =>
  api.get('/products', { params })

export const getProduct = (id: string): Promise<AxiosResponse<ApiResponse<Product>>> =>
  api.get(`/products/${id}`)

// Order endpoints
export const createOrder = (orderData: Partial<Order>): Promise<AxiosResponse<ApiResponse<Order>>> =>
  api.post('/orders', orderData)

export const getMyOrders = (): Promise<AxiosResponse<ApiResponse<Order[]>>> =>
  api.get('/orders/myorders')

export default api
