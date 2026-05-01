import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { adminApi } from '../../api/services'

export default function AdminUsers() {
  const [users, setUsers] = useState([])

  const load = () => adminApi.getUsers().then((r) => setUsers(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const updateRole = async (id, role) => {
    try {
      await adminApi.updateUserRole(id, role)
      toast.success('Rol güncellendi')
      load()
    } catch {
      toast.error('Hata oluştu')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Kullanıcı Yönetimi</h1>
      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Ad Soyad</th>
              <th className="text-left p-4 font-medium text-gray-600">E-posta</th>
              <th className="text-left p-4 font-medium text-gray-600">Telefon</th>
              <th className="text-left p-4 font-medium text-gray-600">Rol</th>
              <th className="text-left p-4 font-medium text-gray-600">Kayıt Tarihi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{u.name}</td>
                <td className="p-4 text-gray-500">{u.email}</td>
                <td className="p-4 text-gray-400">{u.phone || '—'}</td>
                <td className="p-4">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-2 py-1"
                  >
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="p-4 text-gray-400">
                  {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-center text-gray-400 py-12">Kullanıcı yok.</p>}
      </div>
    </div>
  )
}
