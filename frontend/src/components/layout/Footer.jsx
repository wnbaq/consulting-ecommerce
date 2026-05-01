import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Marka */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-bold text-xl text-white">ConsultPro</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Uzman danışmanlık hizmetleriyle işinizi ve kariyerinizi bir adım öteye taşıyın.
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="text-white font-semibold mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/services" className="hover:text-white transition-colors">Hizmetler</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Hakkımızda</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">İletişim</Link></li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="text-white font-semibold mb-4">İletişim</h4>
            <ul className="space-y-2 text-sm">
              <li>info@consultpro.com</li>
              <li>+90 212 000 00 00</li>
              <li>İstanbul, Türkiye</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} ConsultPro. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}
