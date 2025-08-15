import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getMe, logout as logoutUser, LoginCredentials, RegisterData, User } from '../api'
import api from '../api'

// Type definitions for the Auth context
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<User>
  register: (userData: RegisterData) => Promise<any>
  logout: () => void
}

interface AuthProviderProps {
  children: ReactNode
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const loadUser = async (): Promise<void> => {
      const token = localStorage.getItem('token')
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        try {
          const { data } = await getMe()
          setUser(data.data)
        } catch (error) {
          console.error('Failed to fetch user', error)
          localStorage.removeItem('token')
        }
      }
      setIsLoading(false)
    }

    loadUser()
  }, [])

  const login = async (credentials: LoginCredentials): Promise<User> => {
    try {
      const { data } = await api.post('/auth/login', credentials)
      localStorage.setItem('token', data.token)
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      const { data: userData } = await getMe()
      setUser(userData.data)
      return userData.data
    } catch (error) {
      console.error('Login failed', error)
      throw error
    }
  }

  const register = async (userData: RegisterData): Promise<any> => {
    try {
      const { data } = await api.post('/auth/register', userData)
      // You might want to automatically log in the user after registration
      return data
    } catch (error) {
      console.error('Registration failed', error)
      throw error
    }
  }

  const logout = (): void => {
    setUser(null)
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    // Inform the backend about logout if necessary
    logoutUser().catch(err => console.error('Backend logout failed', err))
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  )
}
