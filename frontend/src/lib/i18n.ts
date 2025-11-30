import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation files
import enCommon from '@/locales/en/common.json';
import viCommon from '@/locales/vi/common.json';

// Initialize i18n immediately
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
      },
      vi: {
        common: viCommon,
      },
    },
    lng: typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
