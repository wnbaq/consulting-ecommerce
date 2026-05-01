import { useEffect, useState } from 'react'
import { orderApi } from '../../api/services'

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-purple-100 text-purple-700',
}
const STATUS_TR = { PENDING: 'Beklemede', PAID: 'Ödendi', CANCELLED: 'İptal', REFUNDED: 'İade' }

export default function AdminOrders() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    orderApi.getAll().then((r) => setOrders(r.data)).catch(() => {})
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Sipariş Yönetimi</h1>
      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Sipariş #</th>
              <th className="text-left p-4 font-medium text-gray-600">Tarih</th>
              <th className="text-left p-4 font-medium text-gray-600">Toplam</th>
              <th className="text-left p-4 font-medium text-gray-600">Durum</th>
              <th className="text-left p-4 font-medium text-gray-600">Stripe ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="p-4 font-semibold text-gray-900">#{o.id}</td>
                <td className="p-4 text-gray-500">{new Date(o.createdAt).toLocaleDateString('tr-TR')}</td>
                <td className="p-4 font-bold text-blue-600">₺{o.totalAmount?.toLocaleString('tr-TR')}</td>
                <td className="p-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_TR[o.status] || o.status}
                  </span>
                </td>
                <td className="p-4 text-gray-400 text-xs font-mono truncate max-w-32">{o.stripePaymentIntentId}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center text-gray-400 py-12">Sipariş yok.</p>}
      </div>
    </div>
  )
}
