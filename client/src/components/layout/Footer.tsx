import React from 'react'
import { Link } from 'react-router-dom'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Palengke</h3>
            <p className="text-gray-400">Your online market for fresh goods, delivered to your doorstep.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul>
              <li><Link to="/" className="hover:text-green-400 transition">Home</Link></li>
              <li><Link to="/products" className="hover:text-green-400 transition">Products</Link></li>
              <li><Link to="/about" className="hover:text-green-400 transition">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <p className="text-gray-400">Email: support@palengke.com</p>
            <p className="text-gray-400">Phone: +1 234 567 890</p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-6 text-center">
          <p>&copy; {new Date().getFullYear()} Palengke. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
