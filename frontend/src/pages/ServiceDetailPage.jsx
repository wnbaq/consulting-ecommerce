import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Star, Clock, ShoppingCart, Calendar, ArrowLeft } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { toast } from 'react-hot-toast'
import { serviceApi, reviewApi, cartApi, appointmentApi } from '../api/services'
import { setCart } from '../store/slices/cartSlice'

export default function ServiceDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((s) => s.auth)

  const [service, setService] = useState(null)
  const [packages, setPackages] = useState([])
  const [reviews, setReviews] = useState([])
  const [slots, setSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('packages')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      serviceApi.getById(id),
      serviceApi.getPackages(id),
      reviewApi.getByService(id),
    ]).then(([s, p, r]) => {
      setService(s.data)
      setPackages(p.data)
      setReviews(r.data)
    }).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (selectedDate && id) {
      const dateStr = selectedDate.toISOString().split('T')[0]
      appointmentApi.getSlots(id, dateStr)
        .then((r) => setSlots(r.data))
        .catch(() => setSlots([]))
    }
  }, [selectedDate, id])

  const addToCart = async (pkg) => {
    if (!isAuthenticated) return toast.error('Sepete eklemek için giriş yapın')
    try {
      const res = await cartApi.addItem({
        packageId: pkg.id,
        itemType: 'PACKAGE',
        quantity: 1,
      })
      dispatch(setCart(res.data))
      toast.success(`${pkg.name} sepete eklendi!`)
    } catch {
      toast.error('Sepete eklenirken hata oluştu')
    }
  }

  const bookAppointment = async (slotId) => {
    if (!isAuthenticated) return toast.error('Randevu almak için giriş yapın')
    try {
      await appointmentApi.create({ serviceId: parseInt(id), slotId })
      toast.success('Randevu başarıyla alındı!')
      // Slotları güncelle
      const dateStr = selectedDate.toISOString().split('T')[0]
      appointmentApi.getSlots(id, dateStr).then((r) => setSlots(r.data))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Randevu alınamadı')
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded-xl" />
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-full" />
        </div>
      </div>
    )
  }

  if (!service) return <div className="text-center py-20 text-gray-400">Hizmet bulunamadı.</div>

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Geri */}
      <Link to="/services" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6">
        <ArrowLeft size={18} /> Hizmetlere Dön
      </Link>

      {/* Başlık */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        {service.imageUrl && (
          <img src={service.imageUrl} alt={service.title} className="w-full h-64 object-cover" />
        )}
        <div className="p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                {service.category?.name}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-3">{service.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                {service.durationMinutes && (
                  <span className="flex items-center gap-1"><Clock size={15} />{service.durationMinutes} dk</span>
                )}
                {service.averageRating && (
                  <span className="flex items-center gap-1">
                    <Star size={15} className="text-yellow-400 fill-yellow-400" />
                    {service.averageRating.toFixed(1)} ({service.reviewCount} yorum)
                  </span>
                )}
              </div>
              <p className="text-gray-600 leading-relaxed">{service.description}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">
                ₺{service.price?.toLocaleString('tr-TR')}
              </div>
              <div className="text-gray-400 text-sm">/ seans</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {['packages', 'appointment', 'reviews'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'packages' && 'Paketler'}
            {tab === 'appointment' && 'Randevu Al'}
            {tab === 'reviews' && `Yorumlar (${reviews.length})`}
          </button>
        ))}
      </div>

      {/* Paketler */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.length === 0 ? (
            <p className="text-gray-400 col-span-3 py-10 text-center">Henüz paket eklenmemiş.</p>
          ) : packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
              <h3 className="font-bold text-xl text-gray-900 mb-2">{pkg.name}</h3>
              <p className="text-gray-500 text-sm mb-4 flex-1">{pkg.description}</p>
              <div className="text-sm text-gray-500 space-y-1 mb-5">
                <div>📅 {pkg.sessions} seans</div>
                {pkg.validityDays && <div>⏱ {pkg.validityDays} gün geçerli</div>}
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-4">₺{pkg.price?.toLocaleString('tr-TR')}</div>
              <button
                onClick={() => addToCart(pkg)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingCart size={18} /> Sepete Ekle
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Randevu */}
      {activeTab === 'appointment' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={20} /> Tarih Seçin
          </h3>
          <DatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
            minDate={new Date()}
            inline
            className="w-full"
          />

          {selectedDate && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-700 mb-3">
                Müsait Saatler — {selectedDate.toLocaleDateString('tr-TR')}
              </h4>
              {slots.length === 0 ? (
                <p className="text-gray-400 text-sm">Bu tarihte müsait slot yok.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => bookAppointment(slot.id)}
                      className="bg-blue-50 text-blue-700 border border-blue-200 px-5 py-2.5 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      {slot.startTime} – {slot.endTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Yorumlar */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-center py-10">Henüz yorum yapılmamış.</p>
          ) : reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">{r.userName}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm">{r.comment}</p>
              <p className="text-gray-400 text-xs mt-2">
                {new Date(r.createdAt).toLocaleDateString('tr-TR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
