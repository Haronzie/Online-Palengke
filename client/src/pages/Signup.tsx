import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface SignupFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone: string
}

interface ValidationErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  submit?: string
}

const Signup: React.FC = () => {
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<ValidationErrors>({})

  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof ValidationErrors] || errors.submit) {
      const newErrors = { ...errors }
      delete newErrors[name as keyof ValidationErrors]
      delete newErrors.submit
      setErrors(newErrors)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Full name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else {
      const passwordErrors: string[] = []
      if (formData.password.length < 6) {
        passwordErrors.push('Password must be at least 6 characters')
      }
      if (!/[0-9]/.test(formData.password)) {
        passwordErrors.push('Password must contain a number')
      }
      if (!/[a-z]/.test(formData.password)) {
        passwordErrors.push('Password must contain a lowercase letter')
      }
      if (!/[A-Z]/.test(formData.password)) {
        passwordErrors.push('Password must contain an uppercase letter')
      }
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors.join('. ')
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
    }

    try {
      await register(userData)
      navigate('/login?registered=true')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Could not complete signup. Please try again.'
      setErrors({ submit: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="md:flex">
          <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-green-600 to-green-800 p-8 text-white flex flex-col justify-center">
            <div className="max-w-xs mx-auto">
              <h1 className="text-3xl font-bold mb-4">Join Our Community</h1>
              <p className="text-green-100 mb-8">Create an account to start your journey.</p>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Create an Account</h2>
              <p className="text-gray-500 mt-2">It takes only a few steps</p>
            </div>
            
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className={`p-3 border rounded-md w-full focus:outline-none focus:ring-2 transition ${errors.name ? 'border-red-500 ring-red-300' : 'border-gray-300 focus:ring-green-400'}`}
                required
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={`p-3 border rounded-md w-full focus:outline-none focus:ring-2 transition ${errors.email ? 'border-red-500 ring-red-300' : 'border-gray-300 focus:ring-green-400'}`}
                required
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`p-3 border rounded-md w-full focus:outline-none focus:ring-2 transition ${errors.password ? 'border-red-500 ring-red-300' : 'border-gray-300 focus:ring-green-400'}`}
                required
              />
              {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`p-3 border rounded-md w-full focus:outline-none focus:ring-2 transition ${errors.confirmPassword ? 'border-red-500 ring-red-300' : 'border-gray-300 focus:ring-green-400'}`}
                required
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}

              <input
                type="text"
                name="phone"
                placeholder="Phone Number (Optional)"
                value={formData.phone}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              />

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-medium py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
                
                <p className="text-center text-sm text-gray-500 mt-6">
                  Already have an account?{' '}
                  <Link 
                    to="/login"
                    className="text-green-600 hover:text-green-800 font-medium focus:outline-none focus:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
