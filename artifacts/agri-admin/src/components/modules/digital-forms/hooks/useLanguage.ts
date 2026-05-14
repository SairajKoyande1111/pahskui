import { useState, useCallback } from 'react';
import { Language, translations } from '../lib/translations';

export function useLanguage(initialLang: Language = 'mr') {
  const [language, setLanguage] = useState<Language>(initialLang);

  const t = useCallback((key: keyof typeof translations['en']) => {
    return translations[language][key] || translations['en'][key] || key;
  }, [language]);

  return { language, setLanguage, t };
}
