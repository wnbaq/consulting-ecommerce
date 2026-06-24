import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { categoryApi } from '../../api/services'

function Modal({ cat, onClose, onSaved }) {
  const [form, setForm] = useState(cat || { name: '', description: '', icon: '', imageUrl: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (cat?.id) {
        await categoryApi.update(cat.id, form)
        toast.success('Category updated')
      } else {
        await categoryApi.create(form)
        toast.success('Category added')
      }
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-bold text-lg">{cat?.id ? 'Edit Category' : 'New Category'}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
            <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="💼"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            {form.imageUrl && (
              <img src={form.imageUrl} alt="" className="mt-2 w-full h-28 object-cover rounded-lg"
                onError={(e) => { e.target.style.display = 'none' }} />
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              {cat?.id ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [modal, setModal] = useState(null)
  const [keyword, setKeyword] = useState('')

  const load = () => {
    const request = keyword.trim() === ''
      ? categoryApi.getAll()
      : categoryApi.getByNameContaining(keyword)

    request
      .then((r) => setCategories(Array.isArray(r.data) ? r.data : []))
      .catch(() => setCategories([]))
  }

  useEffect(() => { load() }, [keyword])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      await categoryApi.delete(id)
      toast.success('Category deleted')
      load()
    } catch {
      toast.error('An error occurred')
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
        <button onClick={() => setModal('new')} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700">
          <Plus size={18} /> New Category
        </button>
      </div>
      <div className="mb-4">
        <input type="text" value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search..."
          className="border p-2 rounded" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Image</th>
              <th className="text-left p-4 font-medium text-gray-600">Icon</th>
              <th className="text-left p-4 font-medium text-gray-600">Name</th>
              <th className="text-left p-4 font-medium text-gray-600">Description</th>
              <th className="text-left p-4 font-medium text-gray-600">Services</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {Array.isArray(categories) && categories.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="p-4">
                  {c.imageUrl
                    ? <img src={c.imageUrl} alt={c.name} className="w-12 h-10 object-cover rounded-lg" onError={(e) => { e.target.style.display = 'none' }} />
                    : <div className="w-12 h-10 bg-gray-100 rounded-lg" />}
                </td>
                <td className="p-4 text-2xl">{c.icon || '📁'}</td>
                <td className="p-4 font-medium text-gray-900">{c.name}</td>
                <td className="p-4 text-gray-500 max-w-xs truncate">{c.description}</td>
                <td className="p-4 text-gray-500">{c.serviceCount}</td>
                <td className="p-4 flex justify-end gap-2">
                  <button onClick={() => setModal(c)} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && <p className="text-center text-gray-400 py-12">No categories found.</p>}
      </div>
      {modal && (
        <Modal
          cat={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}
