import { useEffect, useState } from 'react'
import { Trash2, Star } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { reviewApi } from '../../api/services'

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])

  const load = () => reviewApi.getAll().then((r) => setReviews(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    try {
      await reviewApi.delete(id)
      toast.success('Review deleted')
      load()
    } catch {
      toast.error('An error occurred')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Review Management</h1>
      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">User</th>
              <th className="text-left p-4 font-medium text-gray-600">Service ID</th>
              <th className="text-left p-4 font-medium text-gray-600">Rating</th>
              <th className="text-left p-4 font-medium text-gray-600">Comment</th>
              <th className="text-left p-4 font-medium text-gray-600">Date</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reviews.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{r.userName}</td>
                <td className="p-4 text-gray-500">{r.serviceId}</td>
                <td className="p-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                    ))}
                  </div>
                </td>
                <td className="p-4 text-gray-600 max-w-xs truncate">{r.comment}</td>
                <td className="p-4 text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-US')}</td>
                <td className="p-4">
                  <button onClick={() => handleDelete(r.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.length === 0 && <p className="text-center text-gray-400 py-12">No reviews found.</p>}
      </div>
    </div>
  )
}
