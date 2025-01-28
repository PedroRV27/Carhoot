import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.reload(); // Recargar la página después de iniciar sesión
    } catch (err) {
      setError("Credenciales incorrectas. Inténtalo de nuevo.");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Iniciar Sesión</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", margin: "10px auto", padding: "10px", width: "300px" }}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", margin: "10px auto", padding: "10px", width: "300px" }}
      />
      <button
        onClick={handleLogin}
        style={{
          padding: "10px 20px",
          backgroundColor: "blue",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Iniciar Sesión
      </button>
    </div>
  );
};

export default Login;
