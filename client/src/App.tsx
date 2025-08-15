import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import ProtectedRoute from './components/ProtectedRoute'

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/cart" element={<Layout><Cart /></Layout>} />
          <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
        </Route>

        {/* Fallback for not found pages */}
        <Route path="*" element={<Layout><div>404 Not Found</div></Layout>} />

      </Routes>
    </AuthProvider>
  )
}

export default App
