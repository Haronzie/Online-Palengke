import React, { useEffect, useState } from 'react';
import { getMyOrders } from '../api';
import { useAuth } from '../contexts/AuthContext';

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (isAuthenticated) {
        try {
          const response = await getMyOrders();
          setOrders(response.data.data);
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (orders.length === 0) return <div>No orders found.</div>;

  return (
    <div className="orders-page">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      <div className="grid grid-cols-1 gap-6">
        {orders.map(order => (
          <div key={order._id} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Order ID: {order._id}</h2>
            <p className="text-gray-700">Total: ${order.totalPrice}</p>
            <p className="text-gray-600">Status: {order.orderStatus}</p>
            {/* Display order items */}
            <h3 className="text-lg font-medium mt-4">Items:</h3>
            <ul>
              {order.orderItems.map(item => (
                <li key={item._id} className="text-sm text-gray-600">{item.name} (x{item.quantity}) - ${item.price}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
