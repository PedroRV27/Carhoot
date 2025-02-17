import React, { useState } from "react";
import "./Header.css"; // Asegúrate de crear este archivo CSS para los estilos

const Header = () => {
  const [theme, setTheme] = useState("light"); // Estado para el tema
  const [language, setLanguage] = useState("es"); // Estado para el idioma

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.setAttribute("data-theme", newTheme); // Cambiar el tema en el body
  };

  const toggleLanguage = () => {
    const newLanguage = language === "es" ? "en" : "es";
    setLanguage(newLanguage);
    // Aquí podrías agregar lógica para cambiar el idioma de la aplicación
  };

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