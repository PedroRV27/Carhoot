import React from "react";
import { auth } from "./services/firebase";
import { signOut } from "firebase/auth";

const Header = ({ user, onLoginClick, onRegisterClick }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <header className="header">
      <h1>Carhoot</h1>
      <nav>
        {user ? (
          <button onClick={handleLogout}>Cerrar Sesión</button>
        ) : (
          <>
            <button onClick={onLoginClick}>Iniciar Sesión</button>
            <button onClick={onRegisterClick}>Registrarse</button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;