import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { logout } from '../../store/slices/authSlice'
import AskAIModal from '../ui/AskAIModal'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const { isAuthenticated, user } = useSelector((s) => s.auth)
  const { itemCount } = useSelector((s) => s.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-xl text-gray-900">ConsultPro</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/services" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Services
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              About
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Contact
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Ask AI */}
            <button
              onClick={() => setAiOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Sparkles size={15} />
              Ask AI
            </button>
            {isAuthenticated ? (
              <>
                {/* Cart */}
                <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600">
                  <ShoppingCart size={22} />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* Admin Panel */}
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="p-2 text-gray-600 hover:text-blue-600">
                    <LayoutDashboard size={22} />
                  </Link>
                )}

                {/* Account */}
                <Link to="/account" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                  <User size={18} />
                  <span className="text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <button
            onClick={() => { setAiOpen(true); setMenuOpen(false) }}
            className="block text-blue-600 font-medium text-left w-full"
          >
            ✨ Ask AI
          </button>
          <Link to="/services" className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Services</Link>
          <Link to="/about" className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/contact" className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Contact</Link>
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Cart ({itemCount})</Link>
              <Link to="/account" className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>My Account</Link>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
              )}
              <button onClick={handleLogout} className="block text-red-500 font-medium">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="block text-blue-600 font-medium" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
      <AskAIModal open={aiOpen} onClose={() => setAiOpen(false)} />
    </nav>
  )
}
