import React, { createContext, useState, useContext, useEffect } from 'react';
import en from '../locales/en.json';
import lg from '../locales/lg.json';

const LocalizationContext = createContext();

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }
  return context;
};

export const LocalizationProvider = ({ children }) => {
  // Initialize language from localStorage or default to 'en'
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('appLanguage') || 'en';
    }
    return 'en';
  });

  // Store language preference when changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('appLanguage', language);
    }
  }, [language]);

  const translations = {
    en,
    lg
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  // Advanced t function that supports interpolation
  const translate = (key, variables = {}) => {
    let value = t(key);
    
    // Replace {variableName} with actual values
    if (typeof value === 'string' && Object.keys(variables).length > 0) {
      value = value.replace(/{(\w+)}/g, (match, varName) => variables[varName] || match);
    }
    
    return value;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'lg' : 'en');
  };

  const value = {
    language,
    setLanguage,
    t,
    translate,
    toggleLanguage,
    translations: translations[language]
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export default LocalizationContext;
