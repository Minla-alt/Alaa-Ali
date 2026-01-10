import { useTranslation } from 'react-i18next'
import ContentList from '../components/ContentList'

function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">{t('home.title')}</h1>
        <p className="text-lg mb-4">{t('home.welcome')}</p>
        <p className="mb-6">{t('home.description')}</p>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{t('home.features')}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('home.feature1')}</li>
            <li>{t('home.feature2')}</li>
            <li>{t('home.feature3')}</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">{t('home.availableContent')}</h2>
        <ContentList />
      </div>
    </div>
  )
}

export default HomePage