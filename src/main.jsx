import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ProvedorIdioma } from './i18n/index.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ProvedorIdioma>
      <App />
    </ProvedorIdioma>
  </React.StrictMode>
);
