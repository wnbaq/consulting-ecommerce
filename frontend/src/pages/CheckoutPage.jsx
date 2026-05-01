import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { toast } from 'react-hot-toast'
import { orderApi } from '../api/services'
import { useDispatch } from 'react-redux'
import { clearCartState } from '../store/slices/cartSlice'
import { Lock } from 'lucide-react'

// Stripe'ın publishable key'i backend'den geliyor
let stripePromise = null

function CheckoutForm({ clientSecret, paymentIntentId, total }) {
  const stripe = useStripe()
  const elements = useElements()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (error) {
        toast.error(error.message)
        setProcessing(false)
        return
      }

      if (paymentIntent.status === 'succeeded') {
        // Backend'e sipariş oluştur
        const res = await orderApi.createOrder(paymentIntentId)
        dispatch(clearCartState())
        toast.success('Ödeme başarılı! Siparişiniz oluşturuldu.')
        navigate(`/orders/${res.data.id}/success`)
      }
    } catch {
      toast.error('Ödeme sırasında hata oluştu')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock size={18} className="text-green-600" />
          Güvenli Ödeme
        </h3>
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {processing ? 'İşleniyor...' : `₺${total?.toLocaleString('tr-TR')} Öde`}
      </button>

      <p className="text-center text-xs text-gray-400">
        🔒 Ödemeniz Stripe tarafından güvence altındadır. Kart bilgileriniz sunucularımızda saklanmaz.
      </p>
    </form>
  )
}

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState(null)
  const [publishableKey, setPublishableKey] = useState(null)
  const [paymentIntentId, setPaymentIntentId] = useState(null)
  const [total, setTotal] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    orderApi.createIntent()
      .then((r) => {
        setClientSecret(r.data.clientSecret)
        setPublishableKey(r.data.publishableKey)
        setPaymentIntentId(r.data.paymentIntentId)
        stripePromise = loadStripe(r.data.publishableKey)
      })
      .catch(() => {
        toast.error('Ödeme başlatılamadı')
        navigate('/cart')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading || !clientSecret || !stripePromise) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500">Ödeme hazırlanıyor...</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">Ödeme</h1>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm
          clientSecret={clientSecret}
          paymentIntentId={paymentIntentId}
          total={total}
        />
      </Elements>
    </div>
  )
}
