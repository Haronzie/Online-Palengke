import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h1>
      <p className="text-lg text-gray-600">
        Welcome back, <span className="font-semibold text-green-600">{user?.name}</span>!
      </p>
      <p className="text-gray-500 mt-2">
        This is your personal dashboard. More features coming soon.
      </p>
      <button 
        onClick={logout}
        className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"
      >
        Logout
      </button>
    </div>
  )
}

export default Dashboard
