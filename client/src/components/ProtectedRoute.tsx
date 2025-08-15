import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Layout from './layout/Layout'

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    // You can render a loading spinner here
    return <div>Loading...</div>
  }

  return isAuthenticated ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : (
    <Navigate to="/login" replace />
  )
}

export default ProtectedRoute
