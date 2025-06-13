import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "./context/AppContext";
import { getCoches } from "./services/api";
import { useTranslation } from "react-i18next";
import "./Juego.css";
import Header from "./Header";
import "bootstrap/dist/css/bootstrap.min.css";
import HintModal from "./HintModal";
import PrivacyPolicyModal from "./PrivacyPolicyModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import { saveGameProgress, loadGameProgress, checkAndResetDailyProgress } from "./utils/gameProgress";
import DOMPurify from 'dompurify';

// Configuración avanzada de DOMPurify
DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
  if (data.attrName === 'style') return false;
});

DOMPurify.setConfig({
  FORBID_TAGS: ['style', 'script', 'iframe', 'frame', 'object', 'embed'],
  FORBID_ATTR: ['style', 'onclick', 'onerror', 'onload', 'onmouseover'],
  USE_PROFILES: { html: true },
  ADD_ATTR: ['target'],
});

const InputField = ({ value, placeholder, onChange, onKeyDown, status, disabled }) => (
  <input
    type="text"
    className={`form-control input-field ${status}`}
    placeholder={placeholder}
    value={DOMPurify.sanitize(value || '')}
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
        <li 
          key={idx} 
          className={`list-group-item ${getFallidoStyle ? getFallidoStyle(intento) : ""}`}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(intento || '') }}
        />
      ))}
  </ul>
);

const normalizeString = (str) => {
  return typeof str === 'string' 
    ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    : String(str).toLowerCase().trim();
};

const Juego = () => {
  const { theme, language } = useContext(AppContext);
  const { t } = useTranslation();

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
  const [noVehicleToday, setNoVehicleToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const validateInput = (input, correctValue) => {
    if (!input || !correctValue) return false;
    return normalizeString(input) === normalizeString(correctValue);
  };

  const validateYear = (input, correctValue) => {
    const userYear = parseInt(input);
    const correctYear = parseInt(correctValue);
    return !isNaN(userYear) && userYear === correctYear;
  };

  useEffect(() => {
  checkAndResetDailyProgress();
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const coches = await getCoches();
      const hoy = new Date().toISOString().split("T")[0];
      const vehiculo = coches.find((coche) => coche.fechaProgramada === hoy);
      
      if (vehiculo) {
        setVehiculoDelDia(vehiculo);
        const savedData = loadGameProgress(vehiculo);
        
        if (savedData) {
          // Verificar intentos usados en modo difícil
          const totalAttemptsKey = `totalAttemptsUsed_${hoy}`;
          const attemptsUsed = savedData.totalAttemptsUsed || 0;
          const remainingAttempts = 9 - attemptsUsed;
          
          // Si quedan menos de 5 intentos (umbral para pistas), mostrar advertencia
          if (remainingAttempts < 5) {
            // Puedes mostrar un mensaje al usuario si lo deseas
          }
        }
      } else {
        setNoVehicleToday(true);
      }
    } catch (error) {
      setNoVehicleToday(true);
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, []);

  useEffect(() => {
    if (vehiculoDelDia) {
      loadProgress();
    }
  }, [vehiculoDelDia]);

  useEffect(() => {
    if (!vehiculoDelDia) return;

    const progressData = {
      step,
      isCompleted,
      intentosFallidos,
      errorCount,
      maxImageIndex,
      revealedLetters,
      currentImageIndex,
    };
    
    saveGameProgress(vehiculoDelDia, progressData);
  }, [step, isCompleted, intentosFallidos, errorCount, maxImageIndex, revealedLetters, currentImageIndex, vehiculoDelDia]);

  const loadProgress = () => {
    const savedData = loadGameProgress(vehiculoDelDia);
    if (savedData) {
      setStep(savedData.step || 1);
      setIsCompleted(savedData.isCompleted || false);
      setIntentosFallidos(savedData.intentosFallidos || {
        marca: [],
        modelo: [],
        anoFabricacion: []
      });
      setErrorCount(savedData.errorCount || 0);
      setMaxImageIndex(savedData.maxImageIndex || 0);
      setRevealedLetters(savedData.revealedLetters || 0);
      setCurrentImageIndex(savedData.currentImageIndex || 0);
      
      if (savedData.isCompleted) {
        setMaxImageIndex(4);
        setCurrentImageIndex(4);
      }
    }
  };

  const handleInputChange = (e, field) => {
    const rawValue = e.target.value;
    const value = DOMPurify.sanitize(rawValue);
    if (field === "marca") setMarca(value);
    if (field === "modelo") setModelo(value);
    if (field === "anoFabricacion") setAnoFabricacion(value);
  };

  const getAnoFallidoStyle = (fallido) => {
    const userYear = parseInt(fallido);
    const correctYear = parseInt(vehiculoDelDia?.AnoFabricacion || 0);
    
    if (isNaN(userYear)) return "fallido custom-bg-danger";
    
    const diferencia = Math.abs(userYear - correctYear);
    if (diferencia <= 2) return "fallido custom-bg-warning-light";
    if (diferencia <= 5) return "fallido custom-bg-orange";
    if (diferencia <= 9) return "fallido custom-bg-orange-dark";
    return "fallido custom-bg-danger";
  };

  const renderSafeText = (text) => (
    <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(text?.toString() || '') }} />
  );

 const handleGuess = () => {
  if (!vehiculoDelDia) return;

  const nuevoIntento = (field, value) => {
    const sanitizedValue = DOMPurify.sanitize(value);
    const newIntentosFallidos = {
      ...intentosFallidos,
      [field]: [...intentosFallidos[field], sanitizedValue]
    };
    const newErrorCount = errorCount + 1;
    
    setIntentosFallidos(newIntentosFallidos);
    setErrorCount(newErrorCount);

    const nuevoMaxIndex = Math.min(maxImageIndex + 1, 3);
    setMaxImageIndex(nuevoMaxIndex);
    setCurrentImageIndex(nuevoMaxIndex);

    return { newIntentosFallidos, newErrorCount, nuevoMaxIndex };
  };

  const saveProgress = (newState = {}) => {
    // Calcular intentos usados (sumando los nuevos errores)
    const attemptsUsed = (newState.errorCount || errorCount) + 
                       (newState.intentosFallidos?.marca?.length || intentosFallidos.marca.length) +
                       (newState.intentosFallidos?.modelo?.length || intentosFallidos.modelo.length) +
                       (newState.intentosFallidos?.anoFabricacion?.length || intentosFallidos.anoFabricacion.length);
    
    saveGameProgress(vehiculoDelDia, {
      modo: 'normal',
      step: newState.step !== undefined ? newState.step : step,
      isCompleted: newState.isCompleted !== undefined ? newState.isCompleted : isCompleted,
      intentosFallidos: newState.intentosFallidos || intentosFallidos,
      errorCount: newState.errorCount !== undefined ? newState.errorCount : errorCount,
      maxImageIndex: newState.maxImageIndex !== undefined ? newState.maxImageIndex : maxImageIndex,
      revealedLetters: newState.revealedLetters !== undefined ? newState.revealedLetters : revealedLetters,
      currentImageIndex: newState.currentImageIndex !== undefined ? newState.currentImageIndex : currentImageIndex,
      totalAttemptsUsed: attemptsUsed
    });
  };

    if (step === 1 && validateInput(marca, vehiculoDelDia.Marca)) {
      setInputStatus("success");
      setTimeout(() => {
        setStep(2);
        setMarca("");
        setInputStatus("");
        setErrorCount(0);
        setRevealedLetters(0);
        
        saveProgress({
          step: 2,
          errorCount: 0,
          revealedLetters: 0
        });
      }, 800);
    } else if (step === 1) {
      setInputStatus("error");
      const { newIntentosFallidos, newErrorCount, nuevoMaxIndex } = nuevoIntento("marca", marca);
      setMarca("");
      
      saveProgress({
        intentosFallidos: newIntentosFallidos,
        errorCount: newErrorCount,
        maxImageIndex: nuevoMaxIndex,
        currentImageIndex: nuevoMaxIndex
      });
    } else if (step === 2 && validateInput(modelo, vehiculoDelDia.Modelo)) {
      setInputStatus("success");
      setTimeout(() => {
        setStep(3);
        setModelo("");
        setInputStatus("");
        setErrorCount(0);
        setRevealedLetters(0);
        
        saveProgress({
          step: 3,
          errorCount: 0,
          revealedLetters: 0
        });
      }, 800);
    } else if (step === 2) {
      setInputStatus("error");
      const { newIntentosFallidos, newErrorCount, nuevoMaxIndex } = nuevoIntento("modelo", modelo);
      setModelo("");
      
      saveProgress({
        intentosFallidos: newIntentosFallidos,
        errorCount: newErrorCount,
        maxImageIndex: nuevoMaxIndex,
        currentImageIndex: nuevoMaxIndex
      });
    } else if (step === 3 && validateYear(anoFabricacion, vehiculoDelDia.AnoFabricacion)) {
      setInputStatus("success");
      setTimeout(() => {
        setIsCompleted(true);
        setInputStatus("");
        
        saveProgress({
          isCompleted: true
        });
      }, 800);
    } else if (step === 3) {
      setInputStatus("error");
      const { newIntentosFallidos, newErrorCount, nuevoMaxIndex } = nuevoIntento("anoFabricacion", anoFabricacion);
      setAnoFabricacion("");
      
      saveProgress({
        intentosFallidos: newIntentosFallidos,
        errorCount: newErrorCount,
        maxImageIndex: nuevoMaxIndex,
        currentImageIndex: nuevoMaxIndex
      });
    }

    if (inputStatus === "error") {
      setTimeout(() => setInputStatus(""), 300);
    }

    if (errorCount + 1 >= 5 && (errorCount + 1 - 5) % 3 === 0) {
      const newRevealedLetters = revealedLetters + 1;
      setRevealedLetters(newRevealedLetters);
      
      saveProgress({
        revealedLetters: newRevealedLetters,
        errorCount: errorCount + 1
      });
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
    if (!vehiculoDelDia) return "";
    
    if (step === 1) {
      return DOMPurify.sanitize(vehiculoDelDia.Marca?.slice(0, revealedLetters) || '');
    } else if (step === 2) {
      return DOMPurify.sanitize(vehiculoDelDia.Modelo?.slice(0, revealedLetters) || '');
    }
    return "";
  };

  const containerClass = theme === "dark" ? "dark-theme" : "light-theme";

  if (isLoading) {
    return (
      <div className={`spinner-container ${containerClass}`}>
        <div className="spinner"></div>
        <span>{renderSafeText(t("game.loading"))}</span>
      </div>
    );
  }

  if (noVehicleToday) {
    return (
      <div className={containerClass}>
        <Header />
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card no-vehicle-card">
                <div className="card-body text-center">
                  <h2 className="mb-4 no-vehicle-title">
                    {renderSafeText(t("game.noVehicleTitle"))}
                  </h2>
                  <p className="lead no-vehicle-message">
                    {renderSafeText(t("game.noVehicleMessage"))}
                  </p>
                  <p className="no-vehicle-submessage">
                    {renderSafeText(t("game.noVehicleSubmessage"))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vehiculoDelDia) {
    return (
      <div className={`spinner-container ${containerClass}`}>
        <div className="spinner"></div>
        <span>{renderSafeText(t("game.loading"))}</span>
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
                  {renderSafeText(vehiculoDelDia.Marca)} {renderSafeText(vehiculoDelDia.Modelo)} {renderSafeText(vehiculoDelDia.AnoFabricacion?.toString())}
                </h2>
                <img
                  src={vehiculoDelDia.Imagenes[4]}
                  alt={t("game.vehicleImageAlt")}
                  className="success-image img-fluid rounded"
                />
                <p className="come-back-tomorrow">{renderSafeText(t("game.comeBackTomorrow"))}</p>
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
                <h1 className="game-title">{renderSafeText(t("game.title"))}</h1>
              </div>
              <div className="card-body">
                <div className="position-relative">
                  <img
                    src={vehiculoDelDia.Imagenes[currentImageIndex]}
                    alt={t("game.vehicleImageAlt")}
                    className="img-fluid rounded vehicle-image"
                  />
                </div>

                <div className="dots-container">
                  {vehiculoDelDia.Imagenes.slice(0, maxImageIndex + 1).map((_, index) => (
                    <button
                      key={index}
                      className={`dot ${index === currentImageIndex ? "active" : ""}`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>

                {step >= 1 && (
                  <div className="resultado-container">
                    {step > 1 && (
                      <div className="resultado-adivinado animate">
                        {renderSafeText(t("game.brand"))}: <strong>{renderSafeText(vehiculoDelDia.Marca)}</strong>
                      </div>
                    )}
                    {step > 2 && (
                      <div className="resultado-adivinado animate">
                        {renderSafeText(t("game.model"))}: <strong>{renderSafeText(vehiculoDelDia.Modelo)}</strong>
                      </div>
                    )}
                    {isCompleted && (
                      <div className="resultado-adivinado animate">
                        {renderSafeText(t("game.year"))}: <strong>{renderSafeText(vehiculoDelDia.AnoFabricacion?.toString())}</strong>
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
                          placeholder={t("game.marcaPlaceholder")}
                          onChange={(e) => handleInputChange(e, "marca")}
                          onKeyDown={handleKeyDown}
                          status={inputStatus}
                        />
                      </div>
                      <button
                        className="btn btn-secondary hint-button"
                        onClick={handleShowHintModal}
                        disabled={errorCount < 5}
                        title={t("game.hintButtonTitle")}
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
                          placeholder={t("game.modeloPlaceholder")}
                          onChange={(e) => handleInputChange(e, "modelo")}
                          onKeyDown={handleKeyDown}
                          status={inputStatus}
                        />
                      </div>
                      <button
                        className="btn btn-secondary hint-button"
                        onClick={handleShowHintModal}
                        disabled={errorCount < 5}
                        title={t("game.hintButtonTitle")}
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
                          placeholder={t("game.anoPlaceholder")}
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
                      {renderSafeText(t("game.guessButton"))}
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
                      {renderSafeText(t("game.congratulations"))}
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
          {renderSafeText(t("game.privacyPolicy"))}
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