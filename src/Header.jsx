import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "./context/AppContext";
import { useTranslation } from "react-i18next"; // Importar useTranslation
import "./Header.css";
import ExplainModal from "./ExplainModal";
import { useNavigate, useLocation } from "react-router-dom";
import { FaGamepad, FaUsers } from "react-icons/fa";
import { Link } from 'react-router-dom';

const Header = () => {
  const { theme, toggleTheme } = useContext(AppContext);
  const { t, i18n } = useTranslation(); // Obtener funciones de traducción
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isHardMode, setIsHardMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Cambiar idioma
  const toggleLanguage = () => {
    const newLang = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(newLang);
  };

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
          <h1 className="app-name">{t("header.appName")}</h1>
        </div>
        <div className="header-right">
          <button className="game-button" onClick={openGameModal}>
            <FaGamepad className="game-icon" />
          </button>
          <div className="theme-selector" onClick={toggleTheme}>
            <div className={`theme-circle ${theme}`}></div>
          </div>
          <button className="language-button" onClick={toggleLanguage}>
            {i18n.language === "es" ? "ES" : "EN"}
          </button>
          <button className="info-button" onClick={openModal}>
            {t("header.info")}
          </button>
        </div>
      </div>

      <ExplainModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        theme={theme}
        gameMode={
          isMultiplayerRoute ? "multiplayer" : 
          isHardMode ? "hard" : "normal"
        }
      />
      
      {/* Modal de opciones de juego */}
      {isGameModalOpen && (
        <div className={`game-modal ${theme}`}>
          <div className="game-modal-content">
            <h3>{t("header.gameOptions")}</h3>
            <div className="game-option">
              <div className="game-mode-toggle">
                <span className="mode-label">
                  {isHardMode ? t("header.hardMode") : t("header.normalMode")}
                </span>
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
                  {t("header.normalModeM")}
                </Link>
              ) : (
                <Link to="/multijugador" className="multiplayer-button" onClick={closeGameModal}>
                  <FaUsers className="multiplayer-icon" />
                  {t("header.multiplayer")}
                </Link>
              )}
            </div>
            <button className="close-game-modal" onClick={closeGameModal}>
              {t("header.close")}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;