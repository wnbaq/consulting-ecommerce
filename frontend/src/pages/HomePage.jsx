import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, Users, Award, Clock } from 'lucide-react'
import { serviceApi, categoryApi } from '../api/services'
import ServiceCard from '../components/ui/ServiceCard'

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    serviceApi.getFeatured().then((r) => setFeatured(r.data)).catch(() => {})
    categoryApi.getAll().then((r) => setCategories(r.data)).catch(() => {})
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Uzman Danışmanlık<br />
            <span className="text-blue-200">Hizmetleri</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            İş, hukuk, teknoloji ve finans alanlarında deneyimli danışmanlarımızla
            hedeflerinize ulaşın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/services"
              className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
            >
              Hizmetleri Keşfet <ArrowRight size={20} />
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              Ücretsiz Danışın
            </Link>
          </div>
        </div>
      </section>

      {/* İstatistikler */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, value: '500+', label: 'Mutlu Müşteri' },
              { icon: Award, value: '50+', label: 'Uzman Danışman' },
              { icon: Star, value: '4.9', label: 'Ortalama Puan' },
              { icon: Clock, value: '10+', label: 'Yıllık Deneyim' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon size={32} className="text-blue-600" />
                <div className="text-3xl font-bold text-gray-900">{value}</div>
                <div className="text-gray-500 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kategoriler */}
      {categories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900">Hizmet Kategorileri</h2>
              <p className="text-gray-500 mt-2">İhtiyacınıza uygun kategoriyi seçin</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/services?categoryId=${cat.id}`}
                  className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow border border-gray-100 group"
                >
                  <div className="text-4xl mb-3">{cat.icon || '💼'}</div>
                  <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">{cat.serviceCount} hizmet</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Öne Çıkan Hizmetler */}
      {featured.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900">Öne Çıkan Hizmetler</h2>
              <p className="text-gray-500 mt-2">En çok tercih edilen danışmanlık hizmetlerimiz</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Tüm Hizmetleri Gör <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Neden Biz */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Neden ConsultPro?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { emoji: '🎯', title: 'Uzman Kadro', desc: 'Her alanda en az 10 yıl deneyimli danışmanlarımızla çalışın.' },
              { emoji: '⚡', title: 'Hızlı Randevu', desc: 'Online randevu sistemiyle 24 saat içinde görüşme ayarlayın.' },
              { emoji: '🔒', title: 'Güvenli Ödeme', desc: 'Stripe altyapısıyla güvenli ve şifreli ödeme yapın.' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
                <div className="text-5xl mb-4">{emoji}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Hemen Başlayın</h2>
          <p className="text-blue-100 mb-8 text-lg">İlk görüşmeniz ücretsiz. Uzmanlarımızla tanışın.</p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors inline-block"
          >
            Ücretsiz Üye Ol
          </Link>
        </div>
      </section>
    </div>
  )
}
