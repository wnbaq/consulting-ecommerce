import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { serviceApi, categoryApi, packageApi } from '../../api/services'

const inputCls =
  'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-900 mb-5">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const emptyForm = {
  title: '',
  description: '',
  shortDescription: '',
  price: '',
  durationMinutes: '',
  imageUrl: '',
  categoryId: '',
  isActive: true,
}

const emptyPkg = {
  name: '',
  description: '',
  sessions: '',
  price: '',
  validityDays: '',
  isActive: true,
}

export default function ServiceFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(emptyForm)
  const [categories, setCategories] = useState([])
  const [packages, setPackages] = useState([])
  const [newPkg, setNewPkg] = useState(emptyPkg)
  const [showPkgForm, setShowPkgForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingPkg, setSavingPkg] = useState(false)

  useEffect(() => {
    categoryApi.getAll().then((r) => setCategories(r.data)).catch(() => {})

    if (isEdit) {
      serviceApi.getById(id).then((r) => {
        const s = r.data
        setForm({
          title: s.title || '',
          description: s.description || '',
          shortDescription: s.shortDescription || '',
          price: s.price || '',
          durationMinutes: s.durationMinutes || '',
          imageUrl: s.imageUrl || '',
          categoryId: s.category?.id || '',
          isActive: s.isActive ?? true,
        })
      }).catch(() => toast.error('Could not load service'))

      serviceApi.getPackages(id).then((r) => setPackages(r.data)).catch(() => {})
    }
  }, [id, isEdit])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const setPkg = (key, val) => setNewPkg((p) => ({ ...p, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.price || !form.categoryId) {
      toast.error('Please fill in the required fields')
      return
    }
    setSaving(true)
    try {
      if (isEdit) {
        await serviceApi.update(id, form)
        toast.success('Service updated')
      } else {
        await serviceApi.create(form)
        toast.success('Service added')
      }
      navigate('/admin/services')
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleAddPackage = async () => {
    if (!newPkg.name || !newPkg.price || !newPkg.sessions) {
      toast.error('Package name, price and session count are required')
      return
    }
    setSavingPkg(true)
    try {
      await packageApi.create({ ...newPkg, serviceId: Number(id) })
      toast.success('Package added')
      const r = await serviceApi.getPackages(id)
      setPackages(r.data)
      setNewPkg(emptyPkg)
      setShowPkgForm(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred')
    } finally {
      setSavingPkg(false)
    }
  }

  const selectedCategory = categories.find((c) => String(c.id) === String(form.categoryId))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={() => navigate('/admin/services')}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Service' : 'Add New Service'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Fill in the consulting service details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — Form */}
          <div className="lg:col-span-2 space-y-6">
            <Section title="Basic Information">
              <Field label="Title *">
                <input
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="e.g. Career Consulting"
                  className={inputCls}
                />
              </Field>
              <Field label="Category *">
                <select
                  value={form.categoryId}
                  onChange={(e) => set('categoryId', e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Short Description">
                <input
                  value={form.shortDescription}
                  onChange={(e) => set('shortDescription', e.target.value)}
                  placeholder="Short text shown on card"
                  className={inputCls}
                />
              </Field>
              <Field label="Detailed Description *">
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={5}
                  placeholder="Detailed description of the service..."
                  className={inputCls + ' resize-none'}
                />
              </Field>
            </Section>

            <Section title="Pricing & Duration">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Price (₺) *">
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => set('price', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={inputCls}
                  />
                </Field>
                <Field label="Duration (minutes)">
                  <input
                    type="number"
                    value={form.durationMinutes}
                    onChange={(e) => set('durationMinutes', e.target.value)}
                    placeholder="60"
                    min="0"
                    className={inputCls}
                  />
                </Field>
              </div>
            </Section>

            <Section title="Image">
              <Field label="Image URL">
                <input
                  value={form.imageUrl}
                  onChange={(e) => set('imageUrl', e.target.value)}
                  placeholder="https://..."
                  className={inputCls}
                />
              </Field>
              {form.imageUrl && (
                <div className="mt-3 rounded-xl overflow-hidden h-48 bg-gray-100">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
              )}
            </Section>

            {/* Packages — edit mode only */}
            {isEdit && (
              <Section title="Service Packages">
                {packages.length > 0 && (
                  <div className="space-y-3 mb-2">
                    {packages.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
                      >
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {p.sessions} sessions · {p.validityDays} days valid
                          </p>
                        </div>
                        <span className="text-blue-600 font-bold text-sm">
                          ₺{Number(p.price).toLocaleString('en-US')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {showPkgForm ? (
                  <div className="border border-blue-100 bg-blue-50/60 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Package Name *">
                        <input
                          value={newPkg.name}
                          onChange={(e) => setPkg('name', e.target.value)}
                          placeholder="e.g. Starter Package"
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Price (₺) *">
                        <input
                          type="number"
                          value={newPkg.price}
                          onChange={(e) => setPkg('price', e.target.value)}
                          placeholder="0.00"
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Session Count *">
                        <input
                          type="number"
                          value={newPkg.sessions}
                          onChange={(e) => setPkg('sessions', e.target.value)}
                          placeholder="3"
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Validity (days)">
                        <input
                          type="number"
                          value={newPkg.validityDays}
                          onChange={(e) => setPkg('validityDays', e.target.value)}
                          placeholder="30"
                          className={inputCls}
                        />
                      </Field>
                    </div>
                    <Field label="Description">
                      <input
                        value={newPkg.description}
                        onChange={(e) => setPkg('description', e.target.value)}
                        placeholder="Short description"
                        className={inputCls}
                      />
                    </Field>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => { setShowPkgForm(false); setNewPkg(emptyPkg) }}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddPackage}
                        disabled={savingPkg}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {savingPkg ? 'Saving...' : 'Save Package'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPkgForm(true)}
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Plus size={16} /> Add Package
                  </button>
                )}
              </Section>
            )}

            {!isEdit && (
              <p className="text-xs text-gray-400 px-1">
                You can add packages after saving the service.
              </p>
            )}
          </div>

          {/* Right column — Status & Preview */}
          <div className="space-y-6">
            {/* Publication status */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Publication Status</h3>
              <button
                type="button"
                onClick={() => set('isActive', !form.isActive)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                  form.isActive
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <span className={`font-medium text-sm ${form.isActive ? 'text-green-700' : 'text-gray-500'}`}>
                  {form.isActive ? 'Active — Published' : 'Inactive — Hidden'}
                </span>
                {form.isActive
                  ? <Eye size={18} className="text-green-600" />
                  : <EyeOff size={18} className="text-gray-400" />
                }
              </button>
            </div>

            {/* Card preview */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Card Preview</h3>
              <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="h-36 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <span className="text-4xl">{selectedCategory?.icon || '💼'}</span>
                  )}
                </div>
                <div className="p-4">
                  {selectedCategory && (
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {selectedCategory.name}
                    </span>
                  )}
                  <h4 className="font-bold text-gray-900 mt-2 text-sm leading-snug">
                    {form.title || 'Service Title'}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {form.shortDescription || form.description || 'Description will appear here...'}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-blue-600 font-bold text-sm">
                      {form.price ? `₺${Number(form.price).toLocaleString('en-US')}` : '₺—'}
                    </span>
                    {form.durationMinutes && (
                      <span className="text-xs text-gray-400">{form.durationMinutes} min</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Save */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Service'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/services')}
              className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
