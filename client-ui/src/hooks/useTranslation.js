import { useContext, createContext } from 'react';
import en from '../locales/en.json';
import lg from '../locales/lg.json';

const TranslationContext = createContext();

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
};

export const getTranslationProvider = () => TranslationContext;

export const getLocalizedStrings = (language) => {
  const translations = {
    en,
    lg
  };
  return translations[language] || en;
};

// Helper function to get a nested translation value
export const getTranslationValue = (translations, key) => {
  return key.split('.').reduce((obj, k) => obj?.[k], translations);
};

// Helper function to interpolate variables in translation strings
export const interpolate = (string, values = {}) => {
  return string.replace(/{(\w+)}/g, (match, key) => values[key] || match);
};
