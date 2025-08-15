import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProduct } from '../api';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getProduct(id);
        setProduct(response.data.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div>Loading product details...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!product) return <div>Product not found.</div>;

  return (
    <div className="product-detail-page bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      <p className="text-xl text-green-600 mb-4">${product.price}</p>
      <p className="text-gray-700 mb-2">Category: {product.category}</p>
      <p className="text-gray-700 mb-2">Description: {product.description}</p>
      {/* Add more details like images, reviews, etc. */}
    </div>
  );
};

export default ProductDetail;
