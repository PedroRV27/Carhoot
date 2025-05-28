import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "./context/AppContext";
import "./Header.css";
import ExplainModal from "./ExplainModal";
import { useNavigate, useLocation } from "react-router-dom";
import { FaGamepad, FaUsers } from "react-icons/fa";
import { Link } from 'react-router-dom';

const Header = () => {
  const { theme, language, toggleTheme, toggleLanguage } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isHardMode, setIsHardMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sincronizar el estado con la ruta actual
  useEffect(() => {
    setIsHardMode(location.pathname === "/dificil");
  }, [location.pathname]);

  const toggleGameMode = () => {
    const newMode = !isHardMode;
    setIsHardMode(newMode);
    navigate(newMode ? "/dificil" : "/");
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  const openGameModal = () => setIsGameModalOpen(true);
  const closeGameModal = () => setIsGameModalOpen(false);

  // Verificar si estamos en la ruta de multijugador
  const isMultiplayerRoute = location.pathname === "/multijugador";

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="app-name">Carhoot</h1>
        </div>
        <div className="header-right">
          <button className="game-button" onClick={openGameModal}>
            <FaGamepad className="game-icon" />
          </button>
          <div className="theme-selector" onClick={toggleTheme}>
            <div className={`theme-circle ${theme}`}></div>
          </div>
          <button className="language-button" onClick={toggleLanguage}>
            {language === "es" ? "ES" : "EN"}
          </button>
          <button className="info-button" onClick={openModal}>
            ?
          </button>
        </div>
      </div>

      <ExplainModal isOpen={isModalOpen} onClose={closeModal} theme={theme} />
      
      {/* Modal de opciones de juego */}
      {isGameModalOpen && (
        <div className={`game-modal ${theme}`}>
          <div className="game-modal-content">
            <h3>Opciones de Juego</h3>
            <div className="game-option">
              <div className="game-mode-toggle">
                <span className="mode-label">Modo {isHardMode ? "Difícil" : "Normal"}</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={isHardMode} 
                    onChange={toggleGameMode} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
            <div className="game-option">
              {isMultiplayerRoute ? (
                <Link to="/" className="multiplayer-button" onClick={closeGameModal}>
                  <FaUsers className="multiplayer-icon" />
                  Modo Normal
                </Link>
              ) : (
                <Link to="/multijugador" className="multiplayer-button" onClick={closeGameModal}>
                  <FaUsers className="multiplayer-icon" />
                  Multijugador Local
                </Link>
              )}
            </div>
            <button className="close-game-modal" onClick={closeGameModal}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;