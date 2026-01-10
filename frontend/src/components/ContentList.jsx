import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { contentApi } from '../utils/api'
import { CONTENT_CATEGORIES } from '../utils/constants'

function ContentList() {
  const { t, i18n } = useTranslation()
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        const response = await contentApi.getContent({ language: i18n.language })
        setContent(response.data)
        setError(null)
      } catch (err) {
        console.error('Error fetching content:', err)
        setError(t('errors.contentFetchFailed'))
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [i18n.language, t])

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>{t('loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {content.map((item) => (
        <div key={item._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
          <p className="text-gray-600 mb-4">{item.description}</p>
          <div className="flex justify-between items-center">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {CONTENT_CATEGORIES[item.category] || item.category}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ContentList