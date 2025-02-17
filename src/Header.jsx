import React, { useContext } from "react";
import { AppContext } from "./context/AppContext"; // Importar el contexto
import "./Header.css";

const Header = () => {
  const { theme, language, toggleTheme, toggleLanguage } = useContext(AppContext); // Usar el contexto

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
        </div>
      </div>
    </header>
  );
};

export default Header;