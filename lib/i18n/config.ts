import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      auth: {
        login: 'Log In',
        signup: 'Sign Up',
        email: 'Email',
        password: 'Password',
        forgotPassword: 'Forgot Password?',
        or: 'or',
        continueWith: 'Continue with {{provider}}',
        emailRequired: 'Email is required',
        invalidEmail: 'Invalid email address',
        passwordRequired: 'Password is required',
        passwordLength: 'Password must be at least 8 characters',
      },
      roles: {
        client: 'Client',
        service_provider: 'Service Provider',
      },
      onboarding: {
        welcome: 'Welcome to {{appName}}',
        steps: {
          profile: 'Profile Information',
          verification: 'Account Verification',
          preferences: 'Preferences',
          complete: 'All Set!',
        },
      },
    },
  },
  es: {
    translation: {
      auth: {
        login: 'Iniciar Sesión',
        signup: 'Registrarse',
        email: 'Correo Electrónico',
        password: 'Contraseña',
        forgotPassword: '¿Olvidaste tu contraseña?',
        or: 'o',
        continueWith: 'Continuar con {{provider}}',
        emailRequired: 'El correo electrónico es requerido',
        invalidEmail: 'Correo electrónico inválido',
        passwordRequired: 'La contraseña es requerida',
        passwordLength: 'La contraseña debe tener al menos 8 caracteres',
      },
      roles: {
        client: 'Cliente',
        service_provider: 'Proveedor de Servicios',
      },
      onboarding: {
        welcome: 'Bienvenido a {{appName}}',
        steps: {
          profile: 'Información del Perfil',
          verification: 'Verificación de Cuenta',
          preferences: 'Preferencias',
          complete: '¡Todo Listo!',
        },
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['cookie', 'localStorage'],
    },
  });

export default i18n; 