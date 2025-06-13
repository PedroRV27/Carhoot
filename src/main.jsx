import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next'; // Importa I18nextProvider
import i18n from './i18n'; // Importa la configuración de i18next
import App from './App.jsx';
import Juego from './Juego.jsx'; 
import JuegoMultijugador from './JuegoMultijugador.jsx';
import { AppProvider } from './context/AppContext'; 
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import JuegoPorIntentos from './JuegoPorIntentos.jsx';
import DOMPurify from 'dompurify';

// Configuración de máxima seguridad para DOMPurify
DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
  if (data.attrName === 'style') {
    return false; // Elimina todos los estilos inline
  }
});

// Configuración adicional recomendada para DOMPurify
DOMPurify.setConfig({
  ADD_ATTR: ['target'], // Solo permite atributos target (para enlaces seguros)
  FORBID_TAGS: ['style', 'script', 'iframe', 'frame', 'object', 'embed'],
  FORBID_ATTR: ['style', 'onclick', 'onerror', 'onload', 'onmouseover'],
  USE_PROFILES: { html: true }, // Solo permite HTML seguro
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envuelve todo con I18nextProvider y pasa i18n */}
    <I18nextProvider i18n={i18n}>
      <AppProvider> {/* AppProvider ahora está dentro de I18nextProvider */}
        <Router>
          <Routes>
            <Route path="/" element={<Juego />} />
            <Route path="/mvm" element={<App />} />
            <Route path="/multijugador" element={<JuegoMultijugador />} />
            <Route path="/dificil" element={<JuegoPorIntentos />} />
          </Routes>
        </Router>
      </AppProvider>
    </I18nextProvider>
  </React.StrictMode>
);