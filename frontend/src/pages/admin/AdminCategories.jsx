import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { categoryApi } from '../../api/services'

function Modal({ cat, onClose, onSaved }) {
  const [form, setForm] = useState(cat || { name: '', description: '', icon: '' })


  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (cat?.id) {
        await categoryApi.update(cat.id, form)
        toast.success('Kategori güncellendi')
      } else {
        await categoryApi.create(form)
        toast.success('Kategori eklendi')
      }
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hata oluştu')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-bold text-lg">{cat?.id ? 'Kategori Düzenle' : 'Yeni Kategori'}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İkon (emoji)</label>
            <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="💼"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">İptal</button>
            <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              {cat?.id ? 'Güncelle' : 'Ekle'}
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
  const [keyword, setKeyword] = useState("");

  const load = () => {
  const request = keyword.trim() === "" 
    ? categoryApi.getAll() 
    : categoryApi.getByNameContaining(keyword);

  request
    .then((r) => {
      console.log(r.data)
      setCategories(Array.isArray(r.data) ? r.data : []);
    })
    .catch((err) => {
      console.error(err);
      setCategories([]); // Hata durumunda boş dizi set et ki .map patlamasın
    });
};

  useEffect(() => {
    load();
  }, [keyword]);

  const handleDelete = async (id) => {
    if (!confirm('Kategoriyi silmek istediğinize emin misiniz?')) return
    try {
      await categoryApi.delete(id)
      toast.success('Kategori silindi')
      load()
    } catch {
      toast.error('Hata oluştu')
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Kategori Yönetimi</h1>
        <button onClick={() => setModal('new')} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700">
          <Plus size={18} /> Yeni Kategori
        </button>
      </div>
      <div>
        <input type="text" value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Bir şey yazın..."
          className="border p-2 rounded"></input>
        <button onClick={() => sendSearchData()} className="bg-blue-500 text-white p-2 rounded">ARA</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">İkon</th>
              <th className="text-left p-4 font-medium text-gray-600">Ad</th>
              <th className="text-left p-4 font-medium text-gray-600">Açıklama</th>
              <th className="text-left p-4 font-medium text-gray-600">Hizmet</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {Array.isArray(categories) && categories?.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
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
        {categories.length === 0 && <p className="text-center text-gray-400 py-12">Kategori yok.</p>}
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
