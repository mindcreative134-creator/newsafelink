import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SafelinkProvider } from './context/SafelinkContext';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SafelinkProvider>
        <App />
      </SafelinkProvider>
    </BrowserRouter>
  </React.StrictMode>
);
