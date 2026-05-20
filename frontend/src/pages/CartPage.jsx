import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { cartApi } from '../api/services'
import { setCart } from '../store/slices/cartSlice'

export default function CartPage() {
  const [cart, setCartData] = useState(null)
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const fetchCart = () => {
    cartApi.get()
      .then((r) => {
        setCartData(r.data)
        dispatch(setCart(r.data))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCart() }, [])

  const removeItem = async (itemId) => {
    try {
      const res = await cartApi.removeItem(itemId)
      setCartData(res.data)
      dispatch(setCart(res.data))
      toast.success('Item removed from cart')
    } catch {
      toast.error('An error occurred')
    }
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}
      </div>
    </div>
  )

  const isEmpty = !cart?.items || cart.items.length === 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Cart</h1>

      {isEmpty ? (
        <div className="text-center py-20">
          <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 text-lg mb-6">Your cart is empty</p>
          <Link to="/services" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700">
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {item.itemType === 'PACKAGE' ? '📦 Package' : '🎯 Service'} — {item.quantity} qty
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600 text-lg">
                    ₺{item.subtotal?.toLocaleString('en-US')}
                  </div>
                  <div className="text-gray-400 text-xs">₺{item.unitPrice?.toLocaleString('en-US')} / unit</div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="lg:w-72">
            <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-20">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600">
                    <span className="truncate flex-1 mr-2">{item.name}</span>
                    <span>₺{item.subtotal?.toLocaleString('en-US')}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-gray-900 text-lg mb-6">
                <span>Total</span>
                <span className="text-blue-600">₺{cart.total?.toLocaleString('en-US')}</span>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
