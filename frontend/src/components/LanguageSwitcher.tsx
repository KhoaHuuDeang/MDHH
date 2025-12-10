'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    if (i18n && i18n.language) {
      setCurrentLang(i18n.language);
    }
  }, [i18n, i18n.language]);

  const toggleLanguage = async () => {
    if (!i18n || typeof i18n.changeLanguage !== 'function') {
      console.error('i18n is not properly initialized');
      return;
    }

    const newLang = currentLang === 'en' ? 'vi' : 'en';

    try {
      await i18n.changeLanguage(newLang);
      setCurrentLang(newLang);
      localStorage.setItem('language', newLang);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300
                 text-white hover:text-[#6A994E] hover:bg-[#386641]/20
                 hover:shadow-lg hover:shadow-[#386641]/25 hover:scale-105
                 border border-[#386641]/30 hover:border-[#6A994E]
                 focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50"
      title="Change Language"
    >
      <span className="text-sm font-semibold">{currentLang === 'en' ? '🇬🇧 EN' : '🇻🇳 VI'}</span>
    </button>
  );
}
