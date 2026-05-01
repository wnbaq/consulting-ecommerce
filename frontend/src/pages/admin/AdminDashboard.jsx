import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, ShoppingBag, Briefcase, Calendar, Star, TrendingUp } from 'lucide-react'
import { adminApi } from '../../api/services'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value ?? '—'}</div>
        <div className="text-gray-500 text-sm">{label}</div>
      </div>
    </div>
  )
}

const NAV = [
  { to: '/admin/services', label: 'Hizmetler', icon: Briefcase },
  { to: '/admin/categories', label: 'Kategoriler', icon: TrendingUp },
  { to: '/admin/appointments', label: 'Randevular', icon: Calendar },
  { to: '/admin/orders', label: 'Siparişler', icon: ShoppingBag },
  { to: '/admin/users', label: 'Kullanıcılar', icon: Users },
  { to: '/admin/reviews', label: 'Yorumlar', icon: Star },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    adminApi.getStats().then((r) => setStats(r.data)).catch(() => {})
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Paneli</h1>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={Users} label="Toplam Kullanıcı" value={stats?.totalUsers} color="bg-blue-500" />
        <StatCard icon={Briefcase} label="Toplam Hizmet" value={stats?.totalServices} color="bg-indigo-500" />
        <StatCard icon={ShoppingBag} label="Toplam Sipariş" value={stats?.totalOrders} color="bg-green-500" />
        <StatCard icon={Calendar} label="Bekleyen Randevu" value={stats?.pendingAppointments} color="bg-orange-500" />
        <StatCard icon={TrendingUp} label="Ödenen Siparişler" value={stats?.paidOrders} color="bg-emerald-500" />
        <StatCard icon={Calendar} label="Onaylı Randevu" value={stats?.confirmedAppointments} color="bg-cyan-500" />
        <StatCard icon={Star} label="Toplam Yorum" value={stats?.totalReviews} color="bg-yellow-500" />
      </div>

      {/* Hızlı Erişim */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Erişim</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="bg-white rounded-xl border border-gray-100 p-5 text-center hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <Icon size={28} className="mx-auto mb-2 text-gray-400 group-hover:text-blue-600 transition-colors" />
            <div className="font-medium text-gray-700 text-sm group-hover:text-blue-600 transition-colors">{label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
