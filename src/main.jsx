import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import Juego from './Juego.jsx'; 
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Juego />} /> {/* Ruta principal */}
        <Route path="/Radmin" element={<App />} /> {/* Ruta para el admin */}
      </Routes>
    </Router>
  </React.StrictMode>
);
