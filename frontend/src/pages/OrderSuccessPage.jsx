import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { orderApi } from '../api/services'

export default function OrderSuccessPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    orderApi.getById(id).then((r) => setOrder(r.data)).catch(() => {})
  }, [id])

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <CheckCircle size={72} className="text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
      <p className="text-gray-500 mb-2">Your order has been created successfully.</p>
      {order && (
        <p className="text-gray-400 text-sm mb-8">
          Order No: <span className="font-semibold text-gray-700">#{order.id}</span> —
          Total: <span className="font-semibold text-blue-600">₺{order.totalAmount?.toLocaleString('en-US')}</span>
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/account" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700">
          View My Orders
        </Link>
        <Link to="/services" className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
