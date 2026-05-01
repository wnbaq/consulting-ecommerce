import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { appointmentApi } from '../../api/services'

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}
const STATUS_TR = { PENDING: 'Beklemede', CONFIRMED: 'Onaylandı', COMPLETED: 'Tamamlandı', CANCELLED: 'İptal' }

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([])

  const load = () => {
    appointmentApi.getAll().then((r) => setAppointments(r.data)).catch(() => {})
  }
  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    try {
      await appointmentApi.updateStatus(id, status)
      toast.success('Durum güncellendi')
      load()
    } catch {
      toast.error('Hata oluştu')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Randevu Yönetimi</h1>
      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Müşteri</th>
              <th className="text-left p-4 font-medium text-gray-600">Hizmet</th>
              <th className="text-left p-4 font-medium text-gray-600">Tarih / Saat</th>
              <th className="text-left p-4 font-medium text-gray-600">Durum</th>
              <th className="text-left p-4 font-medium text-gray-600">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {appointments.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{a.userName}</td>
                <td className="p-4 text-gray-500">{a.serviceName}</td>
                <td className="p-4 text-gray-500">
                  {new Date(a.date).toLocaleDateString('tr-TR')} {a.startTime}–{a.endTime}
                </td>
                <td className="p-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[a.status]}`}>
                    {STATUS_TR[a.status]}
                  </span>
                </td>
                <td className="p-4">
                  <select
                    value={a.status}
                    onChange={(e) => updateStatus(a.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-2 py-1"
                  >
                    {Object.entries(STATUS_TR).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {appointments.length === 0 && <p className="text-center text-gray-400 py-12">Randevu yok.</p>}
      </div>
    </div>
  )
}
