import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "./context/AppContext";
import { getCoches } from "./services/api";
import "./Juego.css";
import Header from "./Header";
import "bootstrap/dist/css/bootstrap.min.css";
import HintModal from "./HintModal";
import PrivacyPolicyModal from "./PrivacyPolicyModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb,faUsers,faGamepad } from "@fortawesome/free-solid-svg-icons";
import { Link } from 'react-router-dom';
import Cookies from "js-cookie";

const InputField = ({ value, placeholder, onChange, onKeyDown, status, disabled }) => (
  <input
    type="text"
    className={`form-control input-field ${status}`}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    onKeyDown={onKeyDown}
    disabled={disabled}
  />
);

const FailedAttemptsList = ({ attempts, getFallidoStyle }) => (
  <ul className="list-group intentos-fallidos">
    {attempts
      .slice()
      .reverse()
      .map((intento, idx) => (
        <li key={idx} className={`list-group-item ${getFallidoStyle ? getFallidoStyle(intento) : ""}`}>
          {intento}
        </li>
      ))}
  </ul>
);

const Juego = () => {
  const { theme, language } = useContext(AppContext);

  const [vehiculoDelDia, setVehiculoDelDia] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anoFabricacion, setAnoFabricacion] = useState("");
  const [step, setStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [inputStatus, setInputStatus] = useState("");
  const [intentosFallidos, setIntentosFallidos] = useState({
    marca: [],
    modelo: [],
    anoFabricacion: [],
  });
  const [errorCount, setErrorCount] = useState(0);
  const [maxImageIndex, setMaxImageIndex] = useState(0);
  const [showHintModal, setShowHintModal] = useState(false);
  const [revealedLetters, setRevealedLetters] = useState(0);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  useEffect(() => {
    fetchVehiculoDelDia();
  }, []);

  useEffect(() => {
    if (vehiculoDelDia) {
      loadProgressFromCookie();
    }
  }, [vehiculoDelDia]);

  // Guardar progreso cada vez que cambia el estado
  useEffect(() => {
    if (vehiculoDelDia) {
      saveProgressToCookie();
    }
  }, [step, isCompleted, intentosFallidos, errorCount, maxImageIndex, revealedLetters, vehiculoDelDia]);

  const fetchVehiculoDelDia = async () => {
    const coches = await getCoches();
    const hoy = new Date().toISOString().split("T")[0];
    const vehiculo = coches.find((coche) => coche.fechaProgramada === hoy);
    setVehiculoDelDia(vehiculo);
  };

  const loadProgressFromCookie = () => {
    const progress = Cookies.get("progress");
    if (progress) {
      const savedData = JSON.parse(progress);
      
      // Verificar si es el mismo día y el mismo vehículo
      const hoy = new Date().toISOString().split("T")[0];
      const fechaGuardada = savedData.fecha;
      const vehiculoIdGuardado = savedData.vehiculoId;
      
      // Si es un nuevo día o un nuevo vehículo, no cargar el progreso anterior
      if (fechaGuardada !== hoy || vehiculoIdGuardado !== vehiculoDelDia.id) {
        return;
      }
      
      // Si es el mismo día y el mismo vehículo, cargar el progreso
      setStep(savedData.step);
      setIsCompleted(savedData.isCompleted);
      setIntentosFallidos(savedData.intentosFallidos);
      setErrorCount(savedData.errorCount);
      setMaxImageIndex(savedData.maxImageIndex);
      setRevealedLetters(savedData.revealedLetters);
      if (savedData.currentImageIndex !== undefined) {
        setCurrentImageIndex(savedData.currentImageIndex);
      }
    }
  };

  const saveProgressToCookie = () => {
    if (!vehiculoDelDia) return;
    
    const progress = {
      fecha: new Date().toISOString().split("T")[0], // Guardar la fecha actual
      vehiculoId: vehiculoDelDia.id, // Guardar el ID del vehículo actual
      step,
      isCompleted,
      intentosFallidos,
      errorCount,
      maxImageIndex,
      revealedLetters,
      currentImageIndex
    };
    Cookies.set("progress", JSON.stringify(progress), { expires: 1 }); // La cookie expira en 1 día
  };

  const handleInputChange = (e, field) => {
    const value = e.target.value;
    if (field === "marca") setMarca(value);
    if (field === "modelo") setModelo(value);
    if (field === "anoFabricacion") setAnoFabricacion(value);
  };

  const getAnoFallidoStyle = (fallido) => {
    const diferencia = Math.abs(fallido - vehiculoDelDia.AnoFabricacion);
    if (diferencia <= 2) return "fallido custom-bg-warning-light";
    if (diferencia <= 5) return "fallido custom-bg-orange";
    if (diferencia <= 9) return "fallido custom-bg-orange-dark";
    return "fallido custom-bg-danger";
  };

  const handleGuess = () => {
    if (!vehiculoDelDia) return;

    const validateInput = (input, correctValue) =>
      input.toLowerCase() === correctValue.toLowerCase();

    const nuevoIntento = (field, value) => {
      setIntentosFallidos((prev) => ({
        ...prev,
        [field]: [...prev[field], value],
      }));
      setErrorCount((prev) => prev + 1);

      const nuevoMaxIndex = Math.min(maxImageIndex + 1, 3);
      setMaxImageIndex(nuevoMaxIndex);
      setCurrentImageIndex(nuevoMaxIndex);
    };

    if (step === 1 && validateInput(marca, vehiculoDelDia.Marca)) {
      setInputStatus("success");
      setTimeout(() => {
        setStep(2);
        setMarca("");
        setInputStatus("");
        setErrorCount(0);
        setRevealedLetters(0);
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
        setErrorCount(0);
        setRevealedLetters(0);
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

    if (errorCount + 1 >= 5 && (errorCount + 1 - 5) % 3 === 0) {
      setRevealedLetters((prev) => prev + 1);
    }
  };

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      ((step === 1 && marca) ||
      (step === 2 && modelo) ||
      (step === 3 && anoFabricacion))
    ) {
      handleGuess();
    }
  };

  const handleShowHintModal = () => {
    if (errorCount >= 5) {
      const newRevealedLetters = Math.floor((errorCount - 5) / 3) + 1;
      setRevealedLetters(newRevealedLetters);
      setShowHintModal(true);
    }
  };

  const getRevealedText = () => {
    if (step === 1) {
      return vehiculoDelDia.Marca.slice(0, revealedLetters);
    } else if (step === 2) {
      return vehiculoDelDia.Modelo.slice(0, revealedLetters);
    }
    return "";
  };

  const containerClass = theme === "dark" ? "dark-theme" : "light-theme";

  if (!vehiculoDelDia) {
    return (
      <div className={`spinner-container ${containerClass}`}>
        <div className="spinner"></div>
        <span>Cargando vehículo del día...</span>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className={containerClass}>
        <Header />
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="text-center success-container">
                <h2 className="success-message">
                  {vehiculoDelDia.Marca} {vehiculoDelDia.Modelo} {vehiculoDelDia.AnoFabricacion}
                </h2>
                <img
                  src={vehiculoDelDia.Imagenes[4]}
                  alt="Vehículo del día"
                  className="success-image img-fluid rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <Header />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="title-container">
                <h1 className="game-title">Guess the Car</h1>
                <Link to="/multijugador" className="btn btn-secondary multiplayer-btn">
                  <FontAwesomeIcon icon={faUsers} className="me-2" />
                </Link>
              </div>
              <div className="card-body">
                <div className="position-relative">
                  <img
                    src={vehiculoDelDia.Imagenes[currentImageIndex]}
                    alt="Vehículo del día"
                    className="img-fluid rounded vehicle-image"
                  />
                </div>

                <div className="dots-container">
                  {vehiculoDelDia.Imagenes.slice(0, maxImageIndex + 1).map((_, index) => (
                    <button
                      key={index}
                      className={`dot ${index === currentImageIndex ? "active" : ""}`}
                      onClick={() => setCurrentImageIndex(index)}
                    ></button>
                  ))}
                </div>

                {step >= 1 && (
                  <div className="resultado-container">
                    {step > 1 && (
                      <div className="resultado-adivinado animate">
                        Marca: <strong>{vehiculoDelDia.Marca}</strong>
                      </div>
                    )}
                    {step > 2 && (
                      <div className="resultado-adivinado animate">
                        Modelo: <strong>{vehiculoDelDia.Modelo}</strong>
                      </div>
                    )}
                    {isCompleted && (
                      <div className="resultado-adivinado animate">
                        Año: <strong>{vehiculoDelDia.AnoFabricacion}</strong>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3">
                  {step === 1 && (
                    <div className="input-group">
                      <div className="input-container">
                        <InputField
                          value={marca}
                          placeholder="Introduce la marca Ej: Bmw, Mercedes..."
                          onChange={(e) => handleInputChange(e, "marca")}
                          onKeyDown={handleKeyDown}
                          status={inputStatus}
                        />
                      </div>
                      <button
                        className="btn btn-secondary hint-button"
                        onClick={handleShowHintModal}
                        disabled={errorCount < 5}
                      >
                        <FontAwesomeIcon
                          icon={faLightbulb}
                          className={errorCount < 5 ? "text-muted" : "text-warning active"}
                        />
                      </button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="input-group">
                      <div className="input-container">
                        <InputField
                          value={modelo}
                          placeholder="Introduce el modelo Ej: SL Class, Mustang..."
                          onChange={(e) => handleInputChange(e, "modelo")}
                          onKeyDown={handleKeyDown}
                          status={inputStatus}
                        />
                      </div>
                      <button
                        className="btn btn-secondary hint-button"
                        onClick={handleShowHintModal}
                        disabled={errorCount < 5}
                      >
                        <FontAwesomeIcon
                          icon={faLightbulb}
                          className={errorCount < 5 ? "text-muted" : "text-warning active"}
                        />
                      </button>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="input-group">
                      <div className="input-container">
                        <InputField
                          value={anoFabricacion}
                          placeholder="Introduce el año"
                          onChange={(e) => handleInputChange(e, "anoFabricacion")}
                          onKeyDown={handleKeyDown}
                          status={inputStatus}
                          disabled={isCompleted}
                        />
                      </div>
                    </div>
                  )}

                  <div className="d-flex w-100 h-100 gap-2">
                    <button
                      className="btn btn-primary flex-fill mt-2 guess-button"
                      onClick={handleGuess}
                      disabled={!marca && !modelo && !anoFabricacion}
                    >
                      Adivinar
                    </button>
                  </div>

                  <div className="mt-2 failed-attempts">
                    {step === 1 && <FailedAttemptsList attempts={intentosFallidos.marca} />}
                    {step === 2 && <FailedAttemptsList attempts={intentosFallidos.modelo} />}
                    {step === 3 && (
                      <FailedAttemptsList
                        attempts={intentosFallidos.anoFabricacion}
                        getFallidoStyle={getAnoFallidoStyle}
                      />
                    )}
                  </div>

                  {isCompleted && (
                    <div className="mt-4 alert alert-success">
                      ¡Felicidades! Has adivinado correctamente el vehículo del día.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <button
          className={`privacy-policy-button ${theme === "dark" ? "dark-theme" : "light-theme"}`}
          onClick={() => setShowPrivacyPolicy(true)}
        >
          Políticas de Privacidad
        </button>
      </div>

      <PrivacyPolicyModal
        show={showPrivacyPolicy}
        onHide={() => setShowPrivacyPolicy(false)}
        theme={theme}
      />

      <HintModal
        show={showHintModal}
        onHide={() => setShowHintModal(false)}
        revealedText={getRevealedText()}
        attemptsRemaining={3 - ((errorCount - 5) % 3)}
      />
    </div>
  );
};

export default Juego;