import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ShoppingBag, Calendar, Star } from 'lucide-react'
import { orderApi, appointmentApi, reviewApi } from '../api/services'

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
        active ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )
}

export default function AccountPage() {
  const { user } = useSelector((s) => s.auth)
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [appointments, setAppointments] = useState([])
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    orderApi.getMy().then((r) => setOrders(r.data)).catch(() => {})
    appointmentApi.getMy().then((r) => setAppointments(r.data)).catch(() => {})
  }, [])

  const STATUS_COLORS = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PAID: 'bg-green-100 text-green-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-gray-100 text-gray-600',
    CANCELLED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-purple-100 text-purple-700',
  }

  const STATUS_TR = {
    PENDING: 'Beklemede', PAID: 'Ödendi', CONFIRMED: 'Onaylandı',
    COMPLETED: 'Tamamlandı', CANCELLED: 'İptal', REFUNDED: 'İade Edildi',
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Profil başlık */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 flex items-center gap-4">
        <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        <TabBtn active={tab === 'orders'} onClick={() => setTab('orders')}>
          <ShoppingBag size={15} className="inline mr-1.5" />Siparişlerim ({orders.length})
        </TabBtn>
        <TabBtn active={tab === 'appointments'} onClick={() => setTab('appointments')}>
          <Calendar size={15} className="inline mr-1.5" />Randevularım ({appointments.length})
        </TabBtn>
      </div>

      {/* Siparişler */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-center text-gray-400 py-10">Henüz sipariş yok.</p>
          ) : orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-900">Sipariş #{order.id}</span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_TR[order.status] || order.status}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-2">
                {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="space-y-1">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600">
                    <span>{item.description}</span>
                    <span>₺{item.unitPrice?.toLocaleString('tr-TR')}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold text-gray-900">
                <span>Toplam</span>
                <span className="text-blue-600">₺{order.totalAmount?.toLocaleString('tr-TR')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Randevular */}
      {tab === 'appointments' && (
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <p className="text-center text-gray-400 py-10">Henüz randevu yok.</p>
          ) : appointments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">{apt.serviceName}</span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[apt.status] || 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_TR[apt.status] || apt.status}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                📅 {new Date(apt.date).toLocaleDateString('tr-TR')} — ⏰ {apt.startTime} – {apt.endTime}
              </div>
              {apt.notes && <p className="text-sm text-gray-400 mt-2 italic">Not: {apt.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
