import React, { useContext, useState } from "react";
import { AppContext } from "./context/AppContext"; // Importar el contexto
import "./Header.css";
import ExplainModal from "./ExplainModal";

const Header = () => {
  const { theme, language, toggleTheme, toggleLanguage } = useContext(AppContext); // Usar el contexto
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);


  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="app-name">Carhoot</h1>
        </div>
        <div className="header-right">
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

       {/* ExplainModal */}
       <ExplainModal isOpen={isModalOpen} onClose={closeModal} theme={theme} />
    </header>
  );
};

export default Header;