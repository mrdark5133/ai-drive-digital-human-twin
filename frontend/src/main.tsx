import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { DigitalTwinProvider } from './context/DigitalTwinContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <DigitalTwinProvider>
          <App />
        </DigitalTwinProvider>
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>,
);
