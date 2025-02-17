import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "./context/AppContext"; // Importar el contexto
import { getCoches } from "./services/api";
import "./Juego.css";
import Header from "./Header";

const Juego = () => {
  const { theme, language } = useContext(AppContext); // Usar el contexto

  // Estados del juego
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
  const [errorCount, setErrorCount] = useState(0); // Número de errores cometidos en el paso actual
  const [showHint, setShowHint] = useState(false); // Mostrar pista después de 7 intentos
  const [maxImageIndex, setMaxImageIndex] = useState(0); // Máximo índice de imagen que se puede ver

  // Obtener el vehículo del día
  useEffect(() => {
    fetchVehiculoDelDia();
  }, []);

  const fetchVehiculoDelDia = async () => {
    const coches = await getCoches();
    const hoy = new Date().toISOString().split("T")[0];
    const vehiculo = coches.find((coche) => coche.fechaProgramada === hoy);
    setVehiculoDelDia(vehiculo);
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
      setErrorCount((prev) => prev + 1); // Incrementar el contador de errores en el paso actual

      // Desbloquear la siguiente imagen
      const nuevoMaxIndex = Math.min(maxImageIndex + 1, 3); // Asegurar que no se exceda el límite de imágenes
      setMaxImageIndex(nuevoMaxIndex);

      // Mostrar directamente la nueva imagen desbloqueada
      setCurrentImageIndex(nuevoMaxIndex);
    };

    if (step === 1 && validateInput(marca, vehiculoDelDia.Marca)) {
      setInputStatus("success");
      setTimeout(() => {
        setStep(2);
        setMarca("");
        setInputStatus("");
        setErrorCount(0); // Reiniciar el contador de errores al cambiar de paso
        setShowHint(false); // Ocultar la pista al cambiar de paso
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
        setErrorCount(0); // Reiniciar el contador de errores al cambiar de paso
        setShowHint(false); // Ocultar la pista al cambiar de paso
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

    // Mostrar pista después de 7 intentos fallidos en el paso actual
    if (errorCount + 1 >= 7 && step !== 3) {
      setShowHint(true);
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

  // Obtener pista
  const getHint = () => {
    if (step === 1) {
      return `Pista: La marca comienza con "${vehiculoDelDia.Marca[0]}"`;
    } else if (step === 2) {
      return `Pista: El modelo comienza con "${vehiculoDelDia.Modelo[0]}"`;
    }
    return "";
  };

  // Clase dinámica para el tema
  const containerClass = theme === "dark" ? "dark-theme" : "light-theme";

  if (!vehiculoDelDia) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <span>Cargando vehículo del día...</span>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <Header />
      <div className="container">
        <div className="game-container">
          {isCompleted ? (
            <div className="success-message">
              <h2>¡Felicidades! 🎉</h2>
              <p>Has acertado todos los datos del vehículo del día.</p>
              <img
                src={vehiculoDelDia.Imagenes[4]}
                alt="Vehículo del día"
                className="success-image"
              />
            </div>
          ) : (
            <div className="card">
              <div className="title-container">
                <h1 className="game-title">Guess the Car</h1>
              </div>
              <div className="card-content">
                <div className="image-container">
                  {currentImageIndex > 0 && (
                    <button
                      className="nav-button left"
                      onClick={() => setCurrentImageIndex((prevIndex) => Math.max(prevIndex - 1, 0))}
                    >
                      {"<"}
                    </button>
                  )}

                  <img
                    src={vehiculoDelDia.Imagenes[currentImageIndex]}
                    alt="Vehículo del día"
                    className="vehicle-image"
                  />

                  {currentImageIndex < maxImageIndex && (
                    <button
                      className="nav-button right"
                      onClick={() => setCurrentImageIndex((prevIndex) => Math.min(prevIndex + 1, maxImageIndex))}
                    >
                      {">"}
                    </button>
                  )}
                </div>

                {showHint && step !== 3 && (
                  <div className="hint">{getHint()}</div>
                )}

                <div className="input-container">
                  {step === 1 && (
                    <>
                      <input
                        type="text"
                        className={`input-field ${inputStatus}`}
                        placeholder="Introduce la marca  Ej: Bmw,Mercedes.."
                        value={marca}
                        onChange={(e) => handleInputChange(e, "marca")}
                        onKeyDown={handleKeyDown}
                      />
                      <button
                        className="guess-button"
                        onClick={handleGuess}
                        disabled={!marca}
                      >
                        Adivinar
                      </button>
                      <div className="failed-attempts">
                        <ul className="intentos-fallidos">
                          {intentosFallidos.marca.slice().reverse().map((intento, idx) => (
                            <li key={idx}>{intento}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <input
                        type="text"
                        className={`input-field ${inputStatus}`}
                        placeholder="Introduce el modelo Ej: SL CLass,Mustang..."
                        value={modelo}
                        onChange={(e) => handleInputChange(e, "modelo")}
                        onKeyDown={handleKeyDown}
                      />
                      <button
                        className="guess-button"
                        onClick={handleGuess}
                        disabled={!modelo}
                      >
                        Adivinar
                      </button>
                      <div className="failed-attempts">
                        <ul className="intentos-fallidos">
                          {intentosFallidos.modelo.slice().reverse().map((intento, idx) => (
                            <li key={idx}>{intento}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <input
                        type="number"
                        className={`input-field ${inputStatus}`}
                        placeholder="Introduce el año"
                        value={anoFabricacion}
                        onChange={(e) => handleInputChange(e, "anoFabricacion")}
                        onKeyDown={handleKeyDown}
                      />
                      <button
                        className="guess-button"
                        onClick={handleGuess}
                        disabled={!anoFabricacion}
                      >
                        Adivinar
                      </button>
                      <div className="failed-attempts">
                        <ul className="intentos-fallidos">
                          {intentosFallidos.anoFabricacion.slice().reverse().map((intento, idx) => (
                            <li key={idx} className={`fallido ${getAnoFallidoStyle(intento)}`}>
                              {intento}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Juego;