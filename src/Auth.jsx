import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "./services/firebase";

const Auth = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onLogin(auth.currentUser); // Pasar el usuario autenticado al componente Juego
    } catch (error) {
      console.error("Error en autenticación:", error.message);
      alert(error.message); // Mostrar un mensaje de error al usuario
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onLogin(auth.currentUser); // Pasar el usuario autenticado al componente Juego
    } catch (error) {
      console.error("Error en autenticación con Google:", error.message);
      alert(error.message); // Mostrar un mensaje de error al usuario
    }
  };

  return (
    <div className="auth">
      <h2>{isLogin ? "Iniciar Sesión" : "Registrarse"}</h2>
      <form onSubmit={handleAuth}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? "Iniciar Sesión" : "Registrarse"}</button>
      </form>
      <button onClick={handleGoogleLogin}>Iniciar Sesión con Google</button>
      <p>
        {isLogin ? "¿No tienes una cuenta? " : "¿Ya tienes una cuenta? "}
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Regístrate" : "Inicia Sesión"}
        </button>
      </p>
    </div>
  );
};

export default Auth;