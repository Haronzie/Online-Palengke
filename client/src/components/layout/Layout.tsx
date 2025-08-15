import React, { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-6 py-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
