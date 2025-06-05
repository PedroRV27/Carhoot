import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "./context/AppContext";
import { getCoches } from "./services/api";
import "./JuegoPorIntentos.css";
import Header from "./Header";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { saveGameProgress, loadGameProgress, checkAndResetDailyProgress } from "./utils/gameProgress";
import { useTranslation } from 'react-i18next';

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

const JuegoPorIntentos = () => {
  const { t } = useTranslation();
  const { theme } = useContext(AppContext);
  const navigate = useNavigate();

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
  const [revealedLetters, setRevealedLetters] = useState(0);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [totalAttempts, setTotalAttempts] = useState(9);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const coches = await getCoches();
      const hoy = new Date().toISOString().split("T")[0];
      const vehiculo = coches.find((coche) => coche.fechaProgramada === hoy);
      setVehiculoDelDia(vehiculo);
      
      if (vehiculo) {
        loadProgress();
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (totalAttempts <= 0 && !isCompleted) {
      setShowGameOverModal(true);
    }
  }, [totalAttempts, isCompleted]);

  useEffect(() => {
    if (!vehiculoDelDia) return;
    
    saveGameProgress(vehiculoDelDia, {
      modo: 'dificil',
      step,
      isCompleted,
      intentosFallidos,
      errorCount,
      maxImageIndex,
      revealedLetters,
      currentImageIndex,
      totalAttempts
    });
  }, [step, isCompleted, intentosFallidos, errorCount, maxImageIndex, revealedLetters, currentImageIndex, totalAttempts, vehiculoDelDia]);

  useEffect(() => {
    checkAndResetDailyProgress();
    
    const fetchData = async () => {
      const coches = await getCoches();
      const hoy = new Date().toISOString().split("T")[0];
      const vehiculo = coches.find((coche) => coche.fechaProgramada === hoy);
      setVehiculoDelDia(vehiculo);
      
      if (vehiculo) {
        const savedData = loadGameProgress(vehiculo, 'dificil');
        
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
          setTotalAttempts(Math.max(0, 9 - (savedData.totalAttemptsUsed || 0)));
          
          if (savedData.isCompleted) {
            setMaxImageIndex(4);
            setCurrentImageIndex(4);
          }
        } else {
          setTotalAttempts(9);
        }
      }
    };

    fetchData();
  }, []);

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
      setTotalAttempts(savedData.totalAttempts || 9);
    }
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
    if (!vehiculoDelDia || totalAttempts <= 0) return;

    const validateInput = (input, correctValue) =>
      input.toLowerCase() === correctValue.toLowerCase();

    const nuevoIntento = (field, value) => {
      const newIntentosFallidos = {
        ...intentosFallidos,
        [field]: [...intentosFallidos[field], value]
      };
      const newErrorCount = errorCount + 1;
      const newTotalAttempts = totalAttempts - 1;
      const nuevoMaxIndex = Math.min(maxImageIndex + 1, 3);

      setIntentosFallidos(newIntentosFallidos);
      setErrorCount(newErrorCount);
      setTotalAttempts(newTotalAttempts);
      setMaxImageIndex(nuevoMaxIndex);
      setCurrentImageIndex(nuevoMaxIndex);

      return { newIntentosFallidos, newErrorCount, newTotalAttempts, nuevoMaxIndex };
    };

    const saveProgress = (newState = {}) => {
      const attemptsUsed = 9 - (newState.totalAttempts !== undefined ? newState.totalAttempts : totalAttempts);
      
      saveGameProgress(vehiculoDelDia, {
        modo: 'dificil',
        step: newState.step !== undefined ? newState.step : step,
        isCompleted: newState.isCompleted !== undefined ? newState.isCompleted : isCompleted,
        intentosFallidos: newState.intentosFallidos || intentosFallidos,
        errorCount: newState.errorCount !== undefined ? newState.errorCount : errorCount,
        maxImageIndex: newState.maxImageIndex !== undefined ? newState.maxImageIndex : maxImageIndex,
        revealedLetters: newState.revealedLetters !== undefined ? newState.revealedLetters : revealedLetters,
        currentImageIndex: newState.currentImageIndex !== undefined ? newState.currentImageIndex : currentImageIndex,
        totalAttempts: newState.totalAttempts !== undefined ? newState.totalAttempts : totalAttempts,
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
      const { newIntentosFallidos, newErrorCount, newTotalAttempts, nuevoMaxIndex } = nuevoIntento("marca", marca);
      setMarca("");
      
      saveProgress({
        intentosFallidos: newIntentosFallidos,
        errorCount: newErrorCount,
        totalAttempts: newTotalAttempts,
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
      const { newIntentosFallidos, newErrorCount, newTotalAttempts, nuevoMaxIndex } = nuevoIntento("modelo", modelo);
      setModelo("");
      
      saveProgress({
        intentosFallidos: newIntentosFallidos,
        errorCount: newErrorCount,
        totalAttempts: newTotalAttempts,
        maxImageIndex: nuevoMaxIndex,
        currentImageIndex: nuevoMaxIndex
      });
    } else if (step === 3 && anoFabricacion.toString() === vehiculoDelDia.AnoFabricacion.toString()) {
      setInputStatus("success");
      setTimeout(() => {
        setIsCompleted(true);
        setInputStatus("");
        setMaxImageIndex(4);
        setCurrentImageIndex(4);
        
        saveProgress({
          isCompleted: true,
          maxImageIndex: 4,
          currentImageIndex: 4
        });
      }, 800);
    } else if (step === 3) {
      setInputStatus("error");
      const { newIntentosFallidos, newErrorCount, newTotalAttempts, nuevoMaxIndex } = nuevoIntento("anoFabricacion", anoFabricacion);
      setAnoFabricacion("");
      
      saveProgress({
        intentosFallidos: newIntentosFallidos,
        errorCount: newErrorCount,
        totalAttempts: newTotalAttempts,
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
    if (e.key === "Enter" && ((step === 1 && marca) || (step === 2 && modelo) || (step === 3 && anoFabricacion))) {
      handleGuess();
    }
  };

  const handleContinueToNormalMode = () => {
    navigate('/');
    setShowGameOverModal(false);
  };

  const handleShowResult = () => {
    setShowGameOverModal(false);
    setIsCompleted(true);
    setMaxImageIndex(4);
    setCurrentImageIndex(4);
    
    saveGameProgress(vehiculoDelDia, {
      modo: 'dificil',
      step: 3,
      isCompleted: true,
      intentosFallidos,
      errorCount,
      maxImageIndex: 4,
      revealedLetters,
      currentImageIndex: 4,
      totalAttempts,
      totalAttemptsUsed: 9 - totalAttempts
    });
  };

  const handleBackToNormalMode = () => {
    navigate('/');
  };

  const containerClass = theme === "dark" ? "dark-theme" : "light-theme";

  if (!vehiculoDelDia) {
    return (
      <div className={`spinner-container ${containerClass}`}>
        <div className="spinner"></div>
        <span>{t('game.loading')}</span>
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
                  {vehiculoDelDia.Marca} {vehiculoDelDia.Modelo} ({vehiculoDelDia.AnoFabricacion})
                </h2>
                <img
                  src={vehiculoDelDia.Imagenes[4]}
                  alt={t('game.vehicleImageAlt')}
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
                <h1 className="game-title">{t('game.title')}</h1>
                <div className="attempts-counter">
                  {t('game.attempts')}: <strong>{totalAttempts}/9</strong>
                </div>
              </div>
              <div className="card-body">
                <div className="position-relative">
                  <img
                    src={vehiculoDelDia.Imagenes[currentImageIndex]}
                    alt={t('game.vehicleImageAlt')}
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
                        {t('game.brand')}: <strong>{vehiculoDelDia.Marca}</strong>
                      </div>
                    )}
                    {step > 2 && (
                      <div className="resultado-adivinado animate">
                        {t('game.model')}: <strong>{vehiculoDelDia.Modelo}</strong>
                      </div>
                    )}
                    {isCompleted && (
                      <div className="resultado-adivinado animate">
                        {t('game.year')}: <strong>{vehiculoDelDia.AnoFabricacion}</strong>
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
                          placeholder={t('game.marcaPlaceholder')}
                          onChange={(e) => handleInputChange(e, "marca")}
                          onKeyDown={handleKeyDown}
                          status={inputStatus}
                          disabled={totalAttempts <= 0 || isCompleted}
                        />
                      </div>
                      <button
                        className="btn btn-secondary hint-button"
                        disabled={errorCount < 5 || totalAttempts <= 0}
                        title={t('game.hintButtonTitle')}
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
                          placeholder={t('game.modeloPlaceholder')}
                          onChange={(e) => handleInputChange(e, "modelo")}
                          onKeyDown={handleKeyDown}
                          status={inputStatus}
                          disabled={totalAttempts <= 0 || isCompleted}
                        />
                      </div>
                      <button
                        className="btn btn-secondary hint-button"
                        disabled={errorCount < 5 || totalAttempts <= 0}
                        title={t('game.hintButtonTitle')}
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
                          placeholder={t('game.anoPlaceholder')}
                          onChange={(e) => handleInputChange(e, "anoFabricacion")}
                          onKeyDown={handleKeyDown}
                          status={inputStatus}
                          disabled={totalAttempts <= 0 || isCompleted}
                        />
                      </div>
                    </div>
                  )}

                  <div className="d-flex w-100 h-100 gap-2">
                    <button
                      className="btn btn-primary flex-fill mt-2 guess-button"
                      onClick={handleGuess}
                      disabled={(!marca && !modelo && !anoFabricacion) || totalAttempts <= 0 || isCompleted}
                    >
                      {t('game.guessButton')}
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
                      {t('game.congratulations')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      <Modal 
        show={showGameOverModal} 
        onHide={() => setShowGameOverModal(false)}
        centered
        className={theme === "dark" ? "dark-modal" : ""}
      >
        <Modal.Header 
          closeButton 
          className={theme === "dark" ? "bg-dark text-white border-secondary" : ""}
          closeVariant={theme === "dark" ? "white" : undefined}
        >
          <Modal.Title style={{ fontFamily: "'Grechen', sans-serif", fontSize: "28px" }}>
            {t('gameOverModal.title')}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className={theme === "dark" ? "bg-dark text-white" : ""}>
          <div style={{ 
            fontFamily: "'Kanit', sans-serif",
            fontSize: "18px",
            marginBottom: "20px"
          }}>
            {t('gameOverModal.message')}
          </div>
          
          <div style={{
            backgroundColor: theme === "dark" ? "#2a2a2a" : "#f8f9fa",
            padding: "15px",
            borderRadius: "8px",
            border: theme === "dark" ? "1px solid #444" : "1px solid #dee2e6",
            fontFamily: "'KanitD', sans-serif",
            fontSize: "14px"
          }}>
            <FontAwesomeIcon 
              icon={faLightbulb} 
              style={{ 
                color: "#ffc107",
                marginRight: "10px"
              }} 
            />
            {t('gameOverModal.hint')}
          </div>
        </Modal.Body>
        
        <Modal.Footer className={theme === "dark" ? "bg-dark border-secondary" : ""}>
          <Button 
            variant={theme === "dark" ? "outline-light" : "outline-secondary"}
            onClick={handleContinueToNormalMode}
            style={{
              fontFamily: "'Kanit', sans-serif",
              border: theme === "dark" ? "1px solid #fff" : "1px solid #000",
              borderRadius: "5px"
            }}
          >
            {t('gameOverModal.continueButton')}
          </Button>
          
          <Button 
            variant="warning"
            onClick={() => setShowConfirmationModal(true)}
            style={{
              fontFamily: "'Kanit', sans-serif",
              fontWeight: "bold",
              borderRadius: "5px",
              backgroundColor: "#ffc107",
              border: "none",
              color: "#000"
            }}
          >
            {t('gameOverModal.showResultButton')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirmation Modal */}
      <Modal 
        show={showConfirmationModal} 
        onHide={() => setShowConfirmationModal(false)}
        centered
        className={theme === "dark" ? "dark-modal" : ""}
      >
        <Modal.Header 
          closeButton 
          className={theme === "dark" ? "bg-dark text-white border-secondary" : ""}
          closeVariant={theme === "dark" ? "white" : undefined}
        >
          <Modal.Title style={{ fontFamily: "'Grechen', sans-serif", fontSize: "28px" }}>
            {t('confirmationModal.title')}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className={theme === "dark" ? "bg-dark text-white" : ""}>
          <div style={{ 
            fontFamily: "'Kanit', sans-serif",
            fontSize: "18px",
            marginBottom: "20px"
          }}>
            {t('confirmationModal.message')}
          </div>
        </Modal.Body>
        
        <Modal.Footer className={theme === "dark" ? "bg-dark border-secondary" : ""}>
          <Button 
            variant={theme === "dark" ? "outline-light" : "outline-secondary"}
            onClick={() => setShowConfirmationModal(false)}
            style={{
              fontFamily: "'Kanit', sans-serif",
              border: theme === "dark" ? "1px solid #fff" : "1px solid #000",
              borderRadius: "5px"
            }}
          >
            {t('confirmationModal.cancelButton')}
          </Button>
          
          <Button 
            variant="warning"
            onClick={() => {
              setShowConfirmationModal(false);
              setShowGameOverModal(false);
              handleShowResult();
            }}
            style={{
              fontFamily: "'Kanit', sans-serif",
              fontWeight: "bold",
              borderRadius: "5px",
              backgroundColor: "#ffc107",
              border: "none",
              color: "#000"
            }}
          >
            {t('confirmationModal.showResultButton')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Result Modal */}
      <Modal 
        show={showResultModal} 
        onHide={() => setShowResultModal(false)}
        centered
        className={theme === "dark" ? "dark-modal" : ""}
      >
        <Modal.Header 
          closeButton 
          className={theme === "dark" ? "bg-dark text-white border-secondary" : ""}
          closeVariant={theme === "dark" ? "white" : undefined}
        >
          <Modal.Title>{t('resultModal.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={`text-center ${theme === "dark" ? "bg-dark text-white" : ""}`}>
          <h4>{vehiculoDelDia.Marca} {vehiculoDelDia.Modelo} ({vehiculoDelDia.AnoFabricacion})</h4>
          <img
            src={vehiculoDelDia.Imagenes[4]}
            alt={t('game.vehicleImageAlt')}
            className="img-fluid rounded mt-3"
          />
          <div className="mt-3">
            <p>{t('resultModal.progress')}</p>
            {step > 1 && <p>{t('game.brand')}: <strong>{vehiculoDelDia.Marca}</strong></p>}
            {step > 2 && <p>{t('game.model')}: <strong>{vehiculoDelDia.Modelo}</strong></p>}
            {step === 3 && !isCompleted && <p>{t('game.year')}: <strong>{t('resultModal.notGuessed')}</strong></p>}
            {isCompleted && <p className="text-success">{t('resultModal.completed')}</p>}
          </div>
        </Modal.Body>
        <Modal.Footer className={theme === "dark" ? "bg-dark" : ""}>
          <Button variant="secondary" onClick={handleContinueToNormalMode}>
            {t('resultModal.goToNormalButton')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default JuegoPorIntentos;