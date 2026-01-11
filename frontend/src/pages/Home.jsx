import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, Globe } from 'lucide-react';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('home.hero.title', 'Learn Without Limits')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              {t('home.hero.subtitle', 'Discover thousands of courses and books in Arabic and English')}
            </p>
            <div className="space-x-4 space-x-reverse">
              <Link
                to="/courses"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 inline-block"
              >
                {t('home.hero.ctaCourses', 'Explore Courses')}
              </Link>
              <Link
                to="/books"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors duration-200 inline-block"
              >
                {t('home.hero.ctaBooks', 'Browse Books')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              {t('home.features.title', 'Why Choose EduLearn?')}
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              {t('home.features.subtitle', 'Everything you need for effective learning')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('home.features.bilingual.title', 'Bilingual Support')}
              </h3>
              <p className="text-secondary-600">
                {t('home.features.bilingual.description', 'Learn in Arabic or English with seamless language switching')}
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('home.features.courses.title', 'Quality Courses')}
              </h3>
              <p className="text-secondary-600">
                {t('home.features.courses.description', 'Curated content from top educational institutions')}
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('home.features.community.title', 'Learn Together')}
              </h3>
              <p className="text-secondary-600">
                {t('home.features.community.description', 'Join a community of learners and share your progress')}
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('home.features.ai.title', 'AI Recommendations')}
              </h3>
              <p className="text-secondary-600">
                {t('home.features.ai.description', 'Get personalized learning suggestions powered by AI')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            {t('home.cta.title', 'Ready to Start Learning?')}
          </h2>
          <p className="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
            {t('home.cta.subtitle', 'Join thousands of learners and start your educational journey today')}
          </p>
          <Link
            to="/signup"
            className="btn-primary text-lg px-8 py-3"
          >
            {t('home.cta.button', 'Get Started Free')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;