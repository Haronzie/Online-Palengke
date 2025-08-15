import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProduct, Product } from '../api'

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProduct = async (): Promise<void> => {
      if (id) {
        try {
          const response = await getProduct(id)
          setProduct(response.data.data)
        } catch (err: any) {
          setError(err)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchProduct()
  }, [id])

  if (loading) return <div>Loading product...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!product) return <div>Product not found.</div>

  return (
    <div className="product-detail">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      <p className="text-xl text-green-600 mb-4">${product.price}</p>
      <p className="text-gray-700 mb-4">{product.description}</p>
      <p className="text-gray-600">Category: {product.category}</p>
      <p className="text-gray-600">Stock: {product.stock}</p>
      {/* Add more product details and buy/add to cart buttons */}
    </div>
  )
}

export default ProductDetail
