import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "./context/AppContext";
import { getCoches } from "./services/api";
import "./Juego.css";
import Header from "./Header";
import 'bootstrap/dist/css/bootstrap.min.css';

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
    {attempts.slice().reverse().map((intento, idx) => (
      <li key={idx} className={`list-group-item ${getFallidoStyle ? getFallidoStyle(intento) : ''}`}>
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
  const [showHint, setShowHint] = useState(false);
  const [maxImageIndex, setMaxImageIndex] = useState(0);

  useEffect(() => {
    fetchVehiculoDelDia();
  }, []);

  const fetchVehiculoDelDia = async () => {
    const coches = await getCoches();
    const hoy = new Date().toISOString().split("T")[0];
    const vehiculo = coches.find((coche) => coche.fechaProgramada === hoy);
    setVehiculoDelDia(vehiculo);
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
        setShowHint(false);
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
        setShowHint(false);
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

    if (errorCount + 1 >= 7 && step !== 3) {
      setShowHint(true);
    }
  };

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      ((step === 1 && marca) || (step === 2 && modelo) || (step === 3 && anoFabricacion))
    ) {
      handleGuess();
    }
  };

  const getHint = () => {
    if (step === 1) {
      return `Pista: La marca comienza con "${vehiculoDelDia.Marca[0]}"`;
    } else if (step === 2) {
      return `Pista: El modelo comienza con "${vehiculoDelDia.Modelo[0]}"`;
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

  return (
    <div className={containerClass}>
      <Header />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            {isCompleted ? (
              <div className="text-center">
                <h2 className="success-message">¡Felicidades! 🎉</h2>
                <p>Has acertado todos los datos del vehículo del día.</p>
                <img
                  src={vehiculoDelDia.Imagenes[4]}
                  alt="Vehículo del día"
                  className="success-image img-fluid rounded"
                />
              </div>
            ) : (
              <div className="card">
                <div className="title-container">
                  <h1 className="game-title">Guess the Car</h1>
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

                  {showHint && step !== 3 && (
                    <div className="alert alert-info mt-3 hint">{getHint()}</div>
                  )}

                  <div className="mt-3">
                    {step >= 1 && (
                      <>
                        {step > 1 && (
                          <div className="resultado-adivinado animate">
                            Marca: <strong>{vehiculoDelDia.Marca}</strong>
                          </div>
                        )}
                        {step === 1 && (
                          <>
                            <InputField
                              value={marca}
                              placeholder="Introduce la marca Ej: Bmw, Mercedes..."
                              onChange={(e) => handleInputChange(e, "marca")}
                              onKeyDown={handleKeyDown}
                              status={inputStatus}
                            />
                            <button
                              className="btn btn-primary w-100 mt-2 guess-button mx-auto d-block"
                              onClick={handleGuess}
                              disabled={!marca}
                            >
                              Adivinar
                            </button>
                            <div className="mt-2 failed-attempts">
                              <FailedAttemptsList attempts={intentosFallidos.marca} />
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {step >= 2 && (
                      <>
                        {step > 2 && (
                          <div className="resultado-adivinado animate">
                            Modelo: <strong>{vehiculoDelDia.Modelo}</strong>
                          </div>
                        )}
                        {step === 2 && (
                          <>
                            <InputField
                              value={modelo}
                              placeholder="Introduce el modelo Ej: SL Class, Mustang..."
                              onChange={(e) => handleInputChange(e, "modelo")}
                              onKeyDown={handleKeyDown}
                              status={inputStatus}
                            />
                            <button
                              className="btn btn-primary w-100 mt-2 guess-button mx-auto d-block"
                              onClick={handleGuess}
                              disabled={!modelo}
                            >
                              Adivinar
                            </button>
                            <div className="mt-2 failed-attempts">
                              <FailedAttemptsList attempts={intentosFallidos.modelo} />
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {step === 3 && (
                      <>
                        {isCompleted && (
                          <div className="resultado-adivinado animate">
                            Año: <strong>{vehiculoDelDia.AnoFabricacion}</strong>
                          </div>
                        )}
                        <InputField
                          value={anoFabricacion}
                          placeholder="Introduce el año"
                          onChange={(e) => handleInputChange(e, "anoFabricacion")}
                          onKeyDown={handleKeyDown}
                          status={inputStatus}
                          disabled={isCompleted}
                        />
                        <button
                          className="btn btn-primary w-100 mt-2 guess-button mx-auto d-block"
                          onClick={handleGuess}
                          disabled={!anoFabricacion}
                        >
                          Adivinar
                        </button>
                        <div className="mt-2 failed-attempts">
                          <FailedAttemptsList
                            attempts={intentosFallidos.anoFabricacion}
                            getFallidoStyle={getAnoFallidoStyle}
                          />
                        </div>
                      </>
                    )}

                    {isCompleted && (
                      <div className="mt-4 alert alert-success">
                        ¡Felicidades! Has adivinado correctamente el vehículo del día.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Juego;