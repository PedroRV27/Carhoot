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