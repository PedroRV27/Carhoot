import React, { useEffect, useState } from "react";
import { getCoches } from "./services/api";
import "./Juego.css";
import Ranking from "./Ranking";
import Auth from "./Auth";
import Header from "./Header";
import { auth } from "./services/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./services/firebase";
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";

const Juego = () => {
  const [vehiculoDelDia, setVehiculoDelDia] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anoFabricacion, setAnoFabricacion] = useState("");
  const [step, setStep] = useState(1); // 1: Marca, 2: Modelo, 3: Año
  const [isCompleted, setIsCompleted] = useState(false);
  const [inputStatus, setInputStatus] = useState(""); // success, error
  const [intentosFallidos, setIntentosFallidos] = useState({
    marca: [],
    modelo: [],
    anoFabricacion: [],
  });
  const [errorCount, setErrorCount] = useState(0); // Número de errores cometidos
  const [user, setUser] = useState(null); // Estado para el usuario autenticado
  const [nickname, setNickname] = useState(""); // Estado para el nickname del usuario
  const [showAuth, setShowAuth] = useState(false); // Mostrar/ocultar el componente Auth
  const [nicknameSaved, setNicknameSaved] = useState(false); // Estado para saber si el nickname ha sido guardado
  const [showNicknameModal, setShowNicknameModal] = useState(false); // Mostrar/ocultar el modal para elegir nickname
  const [tiempoTotal, setTiempoTotal] = useState(0); // Tiempo total en segundos
  const [intervalId, setIntervalId] = useState(null); // ID del intervalo del temporizador

  // Obtener el vehículo del día
  useEffect(() => {
    fetchVehiculoDelDia();
  }, []);

  // Configurar la persistencia de la sesión y verificar el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Actualiza el estado del usuario
        fetchUserNickname(user.uid); // Obtener el nickname del usuario
      } else {
        setUser(null); // Si no hay usuario, establecer el estado como null
      }
    });

    // Configurar la persistencia de la sesión
    setPersistence(auth, browserLocalPersistence);

    return () => unsubscribe(); // Limpiar el listener al desmontar el componente
  }, []);

  // Obtener el nickname del usuario desde Firestore
  const fetchUserNickname = async (uid) => {
    const userDoc = await getDoc(doc(db, "userNicknames", uid));
    if (userDoc.exists() && userDoc.data().nickname) {
      setNickname(userDoc.data().nickname);
      setNicknameSaved(true); // Marcar que el nickname ya está guardado
    }
  };

  // Obtener el vehículo del día
  const fetchVehiculoDelDia = async () => {
    try {
      const coches = await getCoches();
      const hoy = new Date().toISOString().split("T")[0];
      const vehiculo = coches.find((coche) => coche.fechaProgramada === hoy);
      if (vehiculo) {
        setVehiculoDelDia(vehiculo);
      } else {
        console.error("No se encontró el vehículo del día.");
      }
    } catch (error) {
      console.error("Error al obtener el vehículo del día:", error);
    }
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e, field) => {
    const value = e.target.value;
    if (field === "marca") setMarca(value);
    if (field === "modelo") setModelo(value);
    if (field === "anoFabricacion") setAnoFabricacion(value);
  };

  // Estilos para los años fallidos
  const getAnoFallidoStyle = (fallido) => {
    const diferencia = Math.abs(fallido - vehiculoDelDia.AnoFabricacion);
    if (diferencia <= 2) return "custom-bg-warning-light";
    if (diferencia <= 5) return "custom-bg-orange";
    if (diferencia <= 9) return "custom-bg-orange-dark";
    return "custom-bg-danger";
  };

  // Lógica para adivinar
  const handleGuess = () => {
    if (!vehiculoDelDia) return;

    const validateInput = (input, correctValue) =>
      input.toLowerCase() === correctValue.toLowerCase();

    const nuevoIntento = (field, value) => {
      setIntentosFallidos((prev) => ({
        ...prev,
        [field]: [...prev[field], value],
      }));
      setErrorCount((prev) => prev + 1); // Incrementar el contador de errores
      setCurrentImageIndex((prevIndex) => Math.min(prevIndex + 1, 3)); // Solo permite avanzar hasta la cuarta imagen
    };

    if (step === 1 && validateInput(marca, vehiculoDelDia.Marca)) {
      setInputStatus("success");
      setTimeout(() => {
        setStep(2);
        setMarca("");
        setInputStatus("");
      }, 800);
    } else if (step === 1) {
      setInputStatus("error");
      nuevoIntento("marca", marca);
      setMarca("");
    } else if (step === 2 && validateInput(modelo, vehiculoDelDia.Modelo)) {
      setInputStatus("success");
      setTimeout(() => {
        setStep(3);
        setModelo("");
        setInputStatus("");
      }, 800);
    } else if (step === 2) {
      setInputStatus("error");
      nuevoIntento("modelo", modelo);
      setModelo("");
    } else if (
      step === 3 &&
      anoFabricacion.toString() === vehiculoDelDia.AnoFabricacion.toString()
    ) {
      setInputStatus("success");
      setTimeout(() => {
        setIsCompleted(true);
        setInputStatus("");
      }, 800);
    } else if (step === 3) {
      setInputStatus("error");
      nuevoIntento("anoFabricacion", anoFabricacion);
      setAnoFabricacion("");
    }

    if (inputStatus === "error") {
      setTimeout(() => setInputStatus(""), 300);
    }
  };

  // Manejar la tecla Enter
  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      ((step === 1 && marca) || (step === 2 && modelo) || (step === 3 && anoFabricacion))
    ) {
      handleGuess();
    }
  };

  // Guardar el nickname del usuario
  const handleNicknameSubmit = async () => {
    if (!nickname) return;

    // Verificar si el nickname ya existe
    const nicknameQuery = query(
      collection(db, "userNicknames"),
      where("nickname", "==", nickname)
    );
    const querySnapshot = await getDocs(nicknameQuery);

    if (querySnapshot.empty) {
      // Guardar el nickname en Firestore asociado al uid del usuario
      await setDoc(doc(db, "userNicknames", user.uid), {
        nickname: nickname,
      });
      setNicknameSaved(true); // Marcar el nickname como guardado
      setShowNicknameModal(false); // Ocultar el modal de nickname
      alert("Nickname guardado correctamente.");
    } else {
      alert("Este nickname ya está en uso. Por favor, elige otro.");
    }
  };

  // Guardar la puntuación del usuario
  const guardarPuntuacion = async () => {
    const hoy = new Date();
    const fecha = hoy.toISOString().split("T")[0]; // Formato YYYY-MM-DD
    const userId = user.uid; // ID del usuario autenticado

    const puntuacion = {
      userId: userId,
      nickname: nickname,
      fallosTotales: errorCount, // Número de intentos fallidos
      tiempoTotal: tiempoTotal, // Tiempo total en segundos
      fecha: fecha,
    };

    try {
      // Guardar la puntuación en Firestore
      await setDoc(doc(db, "ranking", `${fecha}-${userId}`), puntuacion);
      console.log("Puntuación guardada correctamente.");
    } catch (error) {
      console.error("Error al guardar la puntuación:", error);
    }
  };

  // Iniciar el temporizador cuando el usuario comienza a jugar
  useEffect(() => {
    if (step === 1 && !intervalId) {
      const id = setInterval(() => {
        setTiempoTotal((prev) => prev + 1); // Incrementar el tiempo cada segundo
      }, 1000);
      setIntervalId(id);
    }
  }, [step]);

  // Detener el temporizador cuando el usuario completa el juego
  useEffect(() => {
    if (isCompleted && intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [isCompleted]);

  // Mostrar el modal para elegir nickname después de completar el juego
  useEffect(() => {
    if (isCompleted && user && !nicknameSaved) {
      setShowNicknameModal(true);
    } else if (isCompleted && user && nicknameSaved) {
      guardarPuntuacion(); // Guardar la puntuación cuando el juego se complete
    }
  }, [isCompleted, user, nicknameSaved]);

  if (!vehiculoDelDia) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando vehículo del día...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <Header
        user={user}
        onLoginClick={() => setShowAuth(true)}
        onRegisterClick={() => setShowAuth(true)}
      />
      {showAuth && !user && <Auth onLogin={(user) => setUser(user)} />}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold">Carhoot</h1>
        <p className="text-muted">Adivina la marca, modelo y año del vehículo</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8">
          {isCompleted ? (
            <div className="text-center p-5 bg-success text-white rounded">
              <img
                src={vehiculoDelDia.Imagenes[4]} // Muestra la quinta imagen
                alt="Vehículo del día"
                className="img-fluid rounded mb-3"
                style={{ maxHeight: "300px" }}
              />
              <h2>¡Felicidades! 🎉</h2>
              <p>Has acertado todos los datos del vehículo del día.</p>
            </div>
          ) : (
            <div className="card shadow">
              <div className="card-body text-center position-relative">
                {/* Flecha izquierda */}
                {currentImageIndex > 0 && (
                  <button
                    className="btn btn-secondary position-absolute start-0 top-50 translate-middle-y"
                    onClick={() =>
                      setCurrentImageIndex((prevIndex) => Math.max(prevIndex - 1, 0))
                    }
                  >
                    ←
                  </button>
                )}

                {/* Imagen */}
                <img
                  src={vehiculoDelDia.Imagenes[currentImageIndex]}
                  alt="Vehículo del día"
                  className="img-fluid rounded mb-3"
                  style={{ maxHeight: "300px" }}
                />

                {/* Flecha derecha */}
                {errorCount > 0 && currentImageIndex < 3 && (
                  <button
                    className="btn btn-secondary position-absolute end-0 top-50 translate-middle-y"
                    onClick={() =>
                      setCurrentImageIndex((prevIndex) => Math.min(prevIndex + 1, 3))
                    }
                  >
                    →
                  </button>
                )}

                {step === 1 && (
                  <div className="mb-3">
                    <input
                      type="text"
                      className={`form-control ${inputStatus}`}
                      placeholder="Introduce la marca"
                      value={marca}
                      onChange={(e) => handleInputChange(e, "marca")}
                      onKeyDown={handleKeyDown}
                      style={{ backgroundColor: inputStatus === "error" ? "#f8d7da" : "" }}
                    />
                    <button
                      className="btn btn-primary mt-3"
                      onClick={handleGuess}
                      disabled={!marca}
                    >
                      Adivinar
                    </button>
                    <div className="mt-2">
                      <ul className="intentos-fallidos">
                        {intentosFallidos.marca.slice().reverse().map((intento, idx) => (
                          <li key={idx}>{intento}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="mb-3">
                    <input
                      type="text"
                      className={`form-control ${inputStatus}`}
                      placeholder="Introduce el modelo"
                      value={modelo}
                      onChange={(e) => handleInputChange(e, "modelo")}
                      onKeyDown={handleKeyDown}
                      style={{ backgroundColor: inputStatus === "error" ? "#f8d7da" : "" }}
                    />
                    <button
                      className="btn btn-primary mt-3"
                      onClick={handleGuess}
                      disabled={!modelo}
                    >
                      Adivinar
                    </button>
                    <div className="mt-2">
                      <ul className="intentos-fallidos">
                        {intentosFallidos.modelo.slice().reverse().map((intento, idx) => (
                          <li key={idx}>{intento}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="mb-3">
                    <input
                      type="number"
                      className={`form-control ${inputStatus}`}
                      placeholder="Introduce el año"
                      value={anoFabricacion}
                      onChange={(e) => handleInputChange(e, "anoFabricacion")}
                      onKeyDown={handleKeyDown}
                      style={{ backgroundColor: inputStatus === "error" ? "#f8d7da" : "" }}
                    />
                    <button
                      className="btn btn-primary mt-3"
                      onClick={handleGuess}
                      disabled={!anoFabricacion}
                    >
                      Adivinar
                    </button>
                    <div className="mt-2">
                      <ul className="intentos-fallidos">
                        {intentosFallidos.anoFabricacion.slice().reverse().map((intento, idx) => (
                          <li key={idx} className={`fallido ${getAnoFallidoStyle(intento)}`}>
                            {intento}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="col-md-4">
          {user && nicknameSaved ? (
            <Ranking />
          ) : (
            <p>Inicia sesión y completa el juego para ver el ranking.</p>
          )}
        </div>
      </div>

      {/* Modal para elegir nickname */}
      {showNicknameModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-content">
              <h5>Elige un nombre para mostrar en el ranking</h5>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={handleNicknameSubmit}
              >
                Guardar Nickname
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Juego;