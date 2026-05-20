import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { serviceApi } from '../../api/services'

export default function AdminServices() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])

  const load = () => {
    const request=serviceApi.getAll({ size: 100 });
    console.log(request)
    
    request.then((r) => setServices(r.data.content)).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Hizmeti silmek istediğinize emin misiniz?')) return
    try {
      await serviceApi.delete(id)
      toast.success('Hizmet silindi')
      load()
    } catch {
      toast.error('Hata oluştu')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Hizmet Yönetimi</h1>
        <button
          onClick={() => navigate('/admin/services/new')}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={18} /> Yeni Hizmet
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Başlık</th>
              <th className="text-left p-4 font-medium text-gray-600">Kategori</th>
              <th className="text-left p-4 font-medium text-gray-600">Fiyat</th>
              <th className="text-left p-4 font-medium text-gray-600">Durum</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {services.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{s.title}</td>
                <td className="p-4 text-gray-500">{s.category?.name}</td>
                <td className="p-4 text-blue-600 font-semibold">₺{s.price?.toLocaleString('tr-TR')}</td>
                <td className="p-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="p-4 flex justify-end gap-2">
                  <button
                    onClick={() => navigate(`/admin/services/${s.id}/edit`)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {services.length === 0 && (
          <p className="text-center text-gray-400 py-12">Henüz hizmet eklenmemiş.</p>
        )}
      </div>
    </div>
  )
}
