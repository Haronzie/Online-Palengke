import React, { useState, useEffect } from 'react';
import { FiSearch, FiShoppingCart, FiStar, FiClock } from 'react-icons/fi';
import mangoImg from '../assets/mango.webp';
import tomatoesImg from '../assets/tomatoes.webp';
import fishImg from '../assets/fish.webp';
import { useNavigate } from 'react-router-dom';

const products = [
  { 
    id: 1, 
    name: 'Fresh Mangoes', 
    price: '₱50/kg', 
    originalPrice: '₱70/kg',
    image: mangoImg, 
    isNew: true,
    rating: 4.8,
    deliveryTime: '1-2 days',
    vendor: 'Mang Juan Farm',
    category: 'fruits'
  },
  { 
    id: 2, 
    name: 'Organic Tomatoes', 
    price: '₱70/kg', 
    originalPrice: '₱90/kg',
    image: tomatoesImg, 
    isNew: false,
    rating: 4.5,
    deliveryTime: '1 day',
    vendor: 'Organic Harvest',
    category: 'vegetables'
  },
  { 
    id: 3, 
    name: 'Fresh Fish', 
    price: '₱120/kg', 
    originalPrice: '₱150/kg',
    image: fishImg, 
    isNew: true,
    rating: 4.9,
    deliveryTime: 'Same day',
    vendor: 'Seaside Market',
    category: 'seafood'
  },
];

function Home() {
  const navigate = useNavigate();

  return (
    <div className="font-sans text-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-green-800 text-white py-16 md:py-24 rounded-lg shadow-lg mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Fresh from Local Farms</h2>
            <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto mb-8">
              Supporting local farmers and bringing you the freshest produce in Dipolog City
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => navigate('/products')}
                className="bg-white text-green-700 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Shop Now
              </button>
              <button 
                onClick={() => document.getElementById('featured').scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors"
              >
                View Specials
              </button>
            </div>
          </div>
        </div>
        
        {/* Search Bar for Mobile */}
        <div className="md:hidden max-w-3xl mx-auto w-full mt-8 px-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search local produce, seafood, meats..."
              className="w-full pl-10 pr-4 py-3 text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section id="featured" className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Today's Fresh Picks</h2>
          <button 
            onClick={() => navigate('/products')}
            className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
          >
            View All <span className="ml-1">→</span>
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <article 
              key={product.id}
              className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100"
            >
              <div className="relative">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {product.isNew && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
                    NEW
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <button className="w-full bg-white text-green-700 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors">
                    Quick View
                  </button>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">Sold by {product.vendor}</p>
                  </div>
                  <div className="flex items-center bg-green-50 text-green-800 text-xs font-medium px-2 py-1 rounded">
                    <FiStar className="text-yellow-400 mr-1" />
                    {product.rating}
                  </div>
                </div>
                
                <div className="mt-3 flex items-center">
                  <div className="flex items-baseline">
                    <span className="text-xl font-bold text-green-700">{product.price}</span>
                    <span className="ml-2 text-sm text-gray-500 line-through">{product.originalPrice}</span>
                  </div>
                  <div className="ml-auto flex items-center text-sm text-gray-500">
                    <FiClock className="mr-1" />
                    {product.deliveryTime}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <button 
                    className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors flex items-center justify-center"
                    onClick={() => {}}
                  >
                    <FiShoppingCart className="mr-2" />
                    Add to Cart
                  </button>
                  <button 
                    className="w-full border border-green-600 text-green-700 py-2.5 rounded-lg font-medium hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-100 transition-colors"
                    onClick={() => {}}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button 
            className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 rounded-full font-medium transition-colors"
            onClick={() => {}}
          >
            Load More Products
          </button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-gray-50 py-16 rounded-lg shadow-md mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Fruits', icon: '🍎', count: 42 },
              { name: 'Vegetables', icon: '🥦', count: 36 },
              { name: 'Seafood', icon: '🦐', count: 28 },
              { name: 'Meat & Poultry', icon: '🍗', count: 24 },
            ].map((category, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:-translate-y-1 transform transition-transform"
                onClick={() => {}}
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                  {category.icon}
                </div>
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{category.count} items</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-green-700 text-white py-16 rounded-lg shadow-md mt-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Get Fresh Updates</h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get 10% off your first order plus fresh updates on new products and special offers.
          </p>
          <div className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 min-w-0 px-4 py-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
            />
            <button className="bg-yellow-400 text-green-900 font-semibold px-6 py-3 rounded-r-lg hover:bg-yellow-300 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;