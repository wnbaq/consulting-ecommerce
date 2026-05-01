import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter } from 'lucide-react'
import { serviceApi, categoryApi } from '../api/services'
import ServiceCard from '../components/ui/ServiceCard'

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)

  const search = searchParams.get('search') || ''
  const categoryId = searchParams.get('categoryId') || ''
  const page = parseInt(searchParams.get('page') || '0')

  useEffect(() => {
    categoryApi.getAll().then((r) => setCategories(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    serviceApi.getAll({ search: search || undefined, categoryId: categoryId || undefined, page, size: 12 })
      .then((r) => {
        setServices(r.data.content)
        setTotalPages(r.data.totalPages)
      })
      .catch(() => setServices([]))
      .finally(() => setLoading(false))
  }, [search, categoryId, page])

  const updateParam = (key, value) => {
    const params = Object.fromEntries(searchParams.entries())
    if (value) params[key] = value
    else delete params[key]
    params.page = '0'
    setSearchParams(params)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Danışmanlık Hizmetleri</h1>
        <p className="text-gray-500">İhtiyacınıza uygun hizmeti seçin, hemen başlayın.</p>
      </div>

      {/* Filtreler */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Arama */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Hizmet ara..."
            defaultValue={search}
            onChange={(e) => updateParam('search', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Kategori filtresi */}
        <select
          value={categoryId}
          onChange={(e) => updateParam('categoryId', e.target.value)}
          className="py-3 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Sonuçlar */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Filter size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">Hizmet bulunamadı.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => <ServiceCard key={s.id} service={s} />)}
          </div>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSearchParams({ ...Object.fromEntries(searchParams.entries()), page: i.toString() })}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    i === page ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
