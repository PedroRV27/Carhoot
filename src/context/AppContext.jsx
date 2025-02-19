import React, { createContext, useState, useEffect } from "react";

// Crear el contexto
export const AppContext = createContext();

// Proveedor del contexto
export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("es");

  // Establecer el atributo data-theme en el body al cargar la aplicación
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]); // Se ejecuta cada vez que theme cambia

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