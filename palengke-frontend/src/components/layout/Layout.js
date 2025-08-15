import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiLogOut, FiUser, FiLogIn, FiShoppingCart, FiHeart } from 'react-icons/fi';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-green-600">
          Palengke
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-600 hover:text-green-600 transition">Home</Link>
          <Link to="/products" className="text-gray-600 hover:text-green-600 transition">Products</Link>
          <Link to="/about" className="text-gray-600 hover:text-green-600 transition">About</Link>
          <Link to="/contact" className="text-gray-600 hover:text-green-600 transition">Contact</Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/cart" className="relative text-gray-600 hover:text-green-600 transition">
            <FiShoppingCart size={22} />
            <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
          </Link>
          {isAuthenticated ? (
            <div className="relative group">
              <button className="flex items-center text-gray-600 hover:text-green-600 transition">
                <FiUser size={22} />
                <span className="ml-2 text-sm font-medium">{user?.name}</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20 hidden group-hover:block">
                <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600">Dashboard</Link>
                <Link to="/wishlist" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600">
                  <FiHeart className="inline-block mr-2"/>
                  Wishlist
                </Link>
                <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600">
                  <FiLogOut className="inline-block mr-2"/>
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="flex items-center text-sm font-medium text-gray-600 hover:text-green-600 transition">
              <FiLogIn size={20} className="mr-1"/>
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

const Footer = () => {
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
  );
};

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-6 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
