import React, { createContext, useContext, useState } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('EN'); // 'EN' | 'TE'

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'EN' ? 'TE' : 'EN');
  };

  // Translation function: t('key') returns text in current language
  const t = (key) => {
    return translations[language]?.[key] || translations['EN']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
