import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

declare global {
  interface Window {
    google?: any;
  }
}

if (typeof window !== 'undefined' && !document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
  const script = document.createElement('script');
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="200628903576-matrf8d1fosen9d64ralgu3fetpltcmh.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)