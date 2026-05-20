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
            Expert Consulting<br />
            <span className="text-blue-200">Services</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Achieve your goals with experienced consultants in business, law, technology and finance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/services"
              className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
            >
              Explore Services <ArrowRight size={20} />
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              Free Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, value: '500+', label: 'Happy Clients' },
              { icon: Award, value: '50+', label: 'Expert Consultants' },
              { icon: Star, value: '4.9', label: 'Average Rating' },
              { icon: Clock, value: '10+', label: 'Years of Experience' },
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

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900">Service Categories</h2>
              <p className="text-gray-500 mt-2">Choose the category that suits your needs</p>
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
                  <div className="text-gray-400 text-sm mt-1">{cat.serviceCount} services</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Services */}
      {featured.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900">Featured Services</h2>
              <p className="text-gray-500 mt-2">Our most preferred consulting services</p>
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
                View All Services <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why ConsultPro?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { emoji: '🎯', title: 'Expert Team', desc: 'Work with consultants who have at least 10 years of experience in every field.' },
              { emoji: '⚡', title: 'Quick Appointments', desc: 'Schedule a meeting within 24 hours with our online appointment system.' },
              { emoji: '🔒', title: 'Secure Payment', desc: 'Make secure, encrypted payments powered by Stripe.' },
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
          <h2 className="text-3xl font-bold mb-4">Get Started Today</h2>
          <p className="text-blue-100 mb-8 text-lg">Your first consultation is free. Meet our experts.</p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors inline-block"
          >
            Sign Up Free
          </Link>
        </div>
      </section>
    </div>
  )
}
