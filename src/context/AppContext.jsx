import React, { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie"; 


export const AppContext = createContext();

// Proveedor del contexto
export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(Cookies.get("theme") || "dark");
  const [language, setLanguage] = useState(Cookies.get("language") || "es");

  // Establecer el atributo data-theme en el body al cargar la aplicación
  useEffect(() => {
    Cookies.set("theme", theme, { expires: 365 }); 
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    Cookies.set("language", language, { expires: 365 }); 
  }, [language]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const toggleLanguage = () => {
    const newLanguage = language === "es" ? "en" : "es";
    setLanguage(newLanguage);
  };

  return (
    <AppContext.Provider value={{ theme, language, toggleTheme, toggleLanguage }}>
      {children}
    </AppContext.Provider>
  );
};