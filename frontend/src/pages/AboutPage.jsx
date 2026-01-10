import { useTranslation } from 'react-i18next'

function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t('about.title')}</h1>
      <p className="text-lg mb-4">{t('about.description')}</p>
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">{t('about.mission')}</h2>
        <p>{t('about.missionDescription')}</p>
      </div>
    </div>
  )
}

export default AboutPage