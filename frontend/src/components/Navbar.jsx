import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSelector from './LanguageSelector'

function Navbar() {
  const { t } = useTranslation()

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-6">
          <Link to="/" className="hover:text-blue-200 transition-colors">
            {t('nav.home')}
          </Link>
          <Link to="/about" className="hover:text-blue-200 transition-colors">
            {t('nav.about')}
          </Link>
        </div>
        <LanguageSelector />
      </div>
    </nav>
  )
}

export default Navbar