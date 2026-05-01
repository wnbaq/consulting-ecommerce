import { Link } from 'react-router-dom'
import { Star, Clock } from 'lucide-react'

export default function ServiceCard({ service }) {
  return (
    <Link
      to={`/services/${service.id}`}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
    >
      {/* Görsel */}
      <div className="h-44 bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            💼
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
            {service.category?.name}
          </span>
        </div>
      </div>

      {/* İçerik */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {service.title}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {service.shortDescription || service.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-blue-600">
              ₺{service.price?.toLocaleString('tr-TR')}
            </span>
            <span className="text-gray-400 text-sm ml-1">/ seans</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-500">
            {service.durationMinutes && (
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {service.durationMinutes} dk
              </span>
            )}
            {service.averageRating && (
              <span className="flex items-center gap-1">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                {service.averageRating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
