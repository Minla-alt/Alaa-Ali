import { useTranslation } from 'react-i18next'
import { FRONTEND_CONSTANTS } from '../utils/constants'

function LanguageSelector() {
  const { i18n } = useTranslation()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="flex space-x-2">
      {FRONTEND_CONSTANTS.SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang}
          onClick={() => changeLanguage(lang)}
          className={`px-3 py-1 rounded ${
            i18n.language === lang ? 'bg-blue-800' : 'bg-blue-500 hover:bg-blue-700'
          } text-white`}
        >
          {lang === 'en' ? 'English' : 'العربية'}
        </button>
      ))}
    </div>
  )
}

export default LanguageSelector