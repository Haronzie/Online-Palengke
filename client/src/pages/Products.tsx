import React, { useEffect, useState } from 'react'
import { getProducts, Product } from '../api'

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProducts = async (): Promise<void> => {
      try {
        const response = await getProducts()
        setProducts(response.data.data)
      } catch (err: any) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (loading) return <div>Loading products...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="products-page">
      <h1 className="text-3xl font-bold mb-6">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product._id} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <p className="text-gray-700">Price: ${product.price}</p>
            <p className="text-gray-600">Category: {product.category}</p>
            {/* Add more product details here */}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Products
