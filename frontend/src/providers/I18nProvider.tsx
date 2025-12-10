'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for i18n to be fully initialized
    if (i18n.isInitialized) {
      const savedLang = localStorage.getItem('language') || 'en';
      if (i18n.language !== savedLang) {
        i18n.changeLanguage(savedLang).then(() => {
          setIsReady(true);
        });
      } else {
        setIsReady(true);
      }
    } else {
      // If not initialized yet, wait for it
      i18n.on('initialized', () => {
        const savedLang = localStorage.getItem('language') || 'en';
        i18n.changeLanguage(savedLang).then(() => {
          setIsReady(true);
        });
      });
    }
  }, []);

  // Show children immediately, i18n will hydrate
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
