import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationDictionary } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
  isAdmin: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children, isAdmin = false }: { children: ReactNode; isAdmin?: boolean }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get saved language preference
    const storageKey = isAdmin ? 'admin_language' : 'buyer_language';
    const saved = localStorage.getItem(storageKey) as Language;
    if (saved && ['en', 'hi', 'gu'].includes(saved)) {
      return saved;
    }
    
    // Detect browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('hi')) return 'hi';
    if (browserLang.startsWith('gu')) return 'gu';
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    const storageKey = isAdmin ? 'admin_language' : 'buyer_language';
    localStorage.setItem(storageKey, lang);
  };

  const t = translations[language];

  // Update document language attribute
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = 'ltr';
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, isAdmin }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

// Helper function to replace placeholders in translations
export function translate(template: string, params: Record<string, string | number> = {}): string {
  let result = template;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  });
  return result;
}
