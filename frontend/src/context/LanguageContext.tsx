import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLanguage } from '../types';
import en from '../locales/en.json';
import ta from '../locales/ta.json';
import hi from '../locales/hi.json';
import te from '../locales/te.json';
import ml from '../locales/ml.json';
import kn from '../locales/kn.json';

const dictionaries: Record<SupportedLanguage, any> = {
  en,
  ta,
  hi,
  te,
  ml,
  kn
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (path: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('digital_twin_lang') as SupportedLanguage;
    return (saved && dictionaries[saved]) ? saved : 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    if (dictionaries[lang]) {
      setLanguageState(lang);
      localStorage.setItem('digital_twin_lang', lang);
    }
  };

  const t = (path: string, fallback?: string): string => {
    const dict = dictionaries[language] || dictionaries.en;
    const keys = path.split('.');
    let current = dict;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English dictionary
        let engFallback: any = dictionaries.en;
        for (const k of keys) {
          if (engFallback && typeof engFallback === 'object' && k in engFallback) {
            engFallback = engFallback[k];
          } else {
            engFallback = null;
            break;
          }
        }
        return (typeof engFallback === 'string') ? engFallback : (fallback || path);
      }
    }

    return typeof current === 'string' ? current : (fallback || path);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
