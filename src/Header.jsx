import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "./context/AppContext";
import "./Header.css";
import ExplainModal from "./ExplainModal";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const { theme, language, toggleTheme, toggleLanguage } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="app-name">Carhoot</h1>
        </div>
        <div className="header-right">
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
    </header>
  );
};

export default Header;