import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { AppContext } from "./context/AppContext";
import { getCoches } from "./services/api";
import "./JuegoMultijugador.css";
import Header from "./Header";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb, faHome, faArrowLeft, faTrophy, faGamepad } from "@fortawesome/free-solid-svg-icons";
import PrivacyPolicyModal from "./PrivacyPolicyModal";
import DOMPurify from 'dompurify';
import { saveGameProgress, loadGameProgress, checkAndResetDailyProgress } from "./utils/gameProgress";

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

// Función de sanitización mejorada
const sanitizeInput = (input, type = 'text') => {
  if (typeof input !== 'string') return '';
  
  // Sanitización básica con DOMPurify
  let sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
  
  // Validación específica por tipo
  switch(type) {
    case 'year':
      sanitized = sanitized.replace(/[^0-9]/g, '');
      // Limitar a 4 dígitos para años
      if (sanitized.length > 4) {
        sanitized = sanitized.substring(0, 4);
      }
      break;
    case 'brand':
    case 'model':
      // Permitir letras, números, espacios y algunos caracteres especiales comunes
      sanitized = sanitized.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-.,]/g, '');
      // Limitar longitud
      if (sanitized.length > 30) {
        sanitized = sanitized.substring(0, 30);
      }
      break;
    default:
      sanitized = sanitized.replace(/[<>"'`]/g, '');
  }
  
  return sanitized.trim();
};

// Función para normalizar strings para comparación
const normalizeString = (str) => {
  return typeof str === 'string' 
    ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    : String(str).toLowerCase().trim();
};

// Función para renderizar texto seguro
const renderSafeText = (text) => (
  <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(text?.toString() || '') }} />
);

// Componente InputField con validación mejorada
const InputField = ({ value, placeholder, onChange, onKeyDown, status, disabled, type = 'text' }) => {
  const handleChange = (e) => {
    const sanitizedValue = sanitizeInput(e.target.value, type);
    e.target.value = sanitizedValue;
    onChange(e);
  };

  return (
    <input
      type="text"
      className={`form-control input-field ${disabled ? 'disabled-field' : ''} ${status}`}
      placeholder={DOMPurify.sanitize(placeholder || '')}
      value={DOMPurify.sanitize(value || '')}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      disabled={disabled}
      maxLength={type === 'year' ? 4 : 30}
    />
  );
};

const PlayerTurnIndicator = ({ currentPlayer, players, isChanging, currentRound, t }) => (
  <div className={`player-turn-indicator ${isChanging ? 'changing' : ''}`}>
    <h4>{renderSafeText(t('multiplayer.turnOf'))} <span className="player-name">{renderSafeText(players[currentPlayer].name)}</span></h4>
    <div className="player-scores">
      {players.map((player, index) => (
        <div key={index} className={`player-score ${index === currentPlayer ? 'active' : ''}`}>
          {renderSafeText(player.name)}: {player.score} {renderSafeText(t('multiplayer.points'))}
        </div>
      ))}
    </div>
  </div>
);

const FailedAttemptsList = ({ attempts, currentPlayerIndex, getFallidoStyle, t, vehiculoActual }) => {
  // Función mejorada para verificar coincidencias parciales
  const getPartialMatchStyle = (inputText, correctText) => {
    if (!inputText || !correctText) return "";
    
    const input = normalizeString(inputText);
    const correct = normalizeString(correctText);
    
    // Coincidencia exacta (ya manejada por el componente padre)
    if (input === correct) return "";
    
    // Verificar si hay palabras en común
    const inputWords = input.split(/\s+/);
    const correctWords = correct.split(/\s+/);
    
    const hasCommonWords = inputWords.some(inputWord => 
      correctWords.some(correctWord => 
        inputWord.length > 2 && correctWord.includes(inputWord) || 
        correctWord.length > 2 && inputWord.includes(correctWord)
      )
    );
    
    return hasCommonWords ? "text-warning" : "";
  };

  return (
    <div className="intentos-fallidos-container">
      <ul className="list-group intentos-fallidos">
        {attempts
          .filter(intento => intento.playerIndex === currentPlayerIndex)
          .slice()
          .reverse()
          .map((intento, idx) => (
            <li key={idx} className="list-group-item">
              {intento.marca && (
                <span className={
                  intento.marcaCorrecta 
                    ? "text-success fw-bold" 
                    : getPartialMatchStyle(intento.marca, vehiculoActual?.Marca)
                }>
                  {renderSafeText(intento.marca)}
                </span>
              )}
              {intento.modelo && (
                <span className={
                  intento.modeloCorrecto 
                    ? "text-success fw-bold" 
                    : getPartialMatchStyle(intento.modelo, vehiculoActual?.Modelo)
                }>
                  {renderSafeText(intento.modelo)}
                </span>
              )}
              {intento.ano && (
                <span className={getFallidoStyle(intento)}>
                  {renderSafeText(intento.ano)}
                </span>
              )}
              {intento.marcaCorrecta && !intento.modeloCorrecto && !intento.anoCorrecto && (
                <div className="feedback-message text-success">{renderSafeText(t('multiplayer.correctBrand'))}</div>
              )}
              {intento.modeloCorrecto && (
                <div className="feedback-message text-success">{renderSafeText(t('multiplayer.correctModel'))}</div>
              )}
              {intento.anoCorrecto && (
                <div className="feedback-message text-success">{renderSafeText(t('multiplayer.correctYear'))}</div>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
};

const WinnerModal = ({ players, onClose, t }) => {
  const winnerScore = Math.max(...players.map(p => p.score));
  const winners = players.filter(p => p.score === winnerScore);
  
  return (
    <div className="winner-modal-overlay">
      <div className="winner-modal">
        <div className="winner-modal-header">
          <FontAwesomeIcon icon={faTrophy} className="trophy-icon" />
          <h2 className="JuegoCompletado">{renderSafeText(t('multiplayer.gameCompleted'))}</h2>
        </div>
        
        <div className="winner-modal-body">
          <h3>{renderSafeText(t('multiplayer.finalResults'))}</h3>
          {players.map((player, index) => (
            <div key={index} className={`player-result ${player.score === winnerScore ? 'winner' : ''}`}>
              <span className="player-name">{renderSafeText(player.name)}</span>
              <span className="player-score">{player.score} {renderSafeText(t('multiplayer.points'))}</span>
              {player.score === winnerScore && <span className="winner-badge">{renderSafeText(t('multiplayer.winner'))}</span>}
            </div>
          ))}
        </div>
        
        <button onClick={onClose} className="btn btn-primary winner-modal-button">
          {renderSafeText(t('multiplayer.backToHome'))}
        </button>
      </div>
    </div>
  );
};

const JuegoMultijugador = () => {
  const { theme, language } = useContext(AppContext);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [vehiculosDelDia, setVehiculosDelDia] = useState([]);
  const [currentVehiculoIndex, setCurrentVehiculoIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anoFabricacion, setAnoFabricacion] = useState("");
  const [inputStatus, setInputStatus] = useState("");
  const [intentosFallidos, setIntentosFallidos] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const [maxImageIndex, setMaxImageIndex] = useState(0);
  const [showPlayerNamesModal, setShowPlayerNamesModal] = useState(true);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [players, setPlayers] = useState([
    { name: "", score: 0 },
    { name: "", score: 0 }
  ]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [isChangingPlayer, setIsChangingPlayer] = useState(false);
  const [tempPlayerNames, setTempPlayerNames] = useState(["", ""]);
  const [gameState, setGameState] = useState({
    marcaAdivinada: false,
    modeloAdivinado: false,
    anoAdivinado: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [noVehicleToday, setNoVehicleToday] = useState(false);

  // Función mejorada de validación
  const validateInput = (input, correctValue) => {
    if (!input || !correctValue) return false;
    return normalizeString(input) === normalizeString(correctValue);
  };

  // Función mejorada para validar año
  const validateYear = (input, correctValue) => {
    // Verificar que solo contiene números
    if (!/^\d+$/.test(input)) return false;
    
    const userYear = parseInt(input);
    const correctYear = parseInt(correctValue);
    
    // Validar rango razonable para un año de fabricación
    if (userYear < 1886 || userYear > new Date().getFullYear() + 1) {
      return false;
    }
    
    return !isNaN(userYear) && userYear === correctYear;
  };

  useEffect(() => {
    checkAndResetDailyProgress();
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const coches = await getCoches();
        const hoy = new Date().toISOString().split("T")[0];
        
        // Función para sanitizar los datos del vehículo
        const sanitizeVehicle = (vehicle) => {
          if (!vehicle) return null;
          return {
            ...vehicle,
            Marca: sanitizeInput(vehicle.Marca, 'brand'),
            Modelo: sanitizeInput(vehicle.Modelo, 'model'),
            AnoFabricacion: sanitizeInput(vehicle.AnoFabricacion?.toString(), 'year'),
            Imagenes: vehicle.Imagenes?.map(img => 
              DOMPurify.sanitize(img, {
                ALLOWED_URI_REGEXP: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i
              })
            ) || []
          };
        };
        
        const vehiculosAleatorios = [];
        const indicesUsados = new Set();
        const cantidad = Math.min(3, coches.length);
        
        while (vehiculosAleatorios.length < cantidad) {
          const indiceAleatorio = Math.floor(Math.random() * coches.length);
          if (!indicesUsados.has(indiceAleatorio)) {
            indicesUsados.add(indiceAleatorio);
            vehiculosAleatorios.push(sanitizeVehicle(coches[indiceAleatorio]));
          }
        }
        
        if (vehiculosAleatorios.length === 0) {
          setNoVehicleToday(true);
        } else {
          setVehiculosDelDia(vehiculosAleatorios);
        }
      } catch (error) {
        console.error("Error al obtener los coches:", error);
        setNoVehicleToday(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const allFieldsGuessed = currentVehiculoIndex !== 2 
      ? gameState.marcaAdivinada && gameState.modeloAdivinado && gameState.anoAdivinado
      : gameState.modeloAdivinado && gameState.anoAdivinado;

    if (allFieldsGuessed && vehiculosDelDia.length > 0) {
      const timer = setTimeout(() => {
        if (currentVehiculoIndex < vehiculosDelDia.length - 1) {
          const nextVehiculoIndex = currentVehiculoIndex + 1;
          setCurrentVehiculoIndex(nextVehiculoIndex);

          // Determinar el próximo jugador basado en el puntaje
          if (nextVehiculoIndex === 1) {
            setCurrentPlayer(1);
          } else if (nextVehiculoIndex === 2) {
            if (players[0].score > players[1].score) {
              setCurrentPlayer(0);
            } else if (players[1].score > players[0].score) {
              setCurrentPlayer(1);
            } else {
              setCurrentPlayer(Math.random() < 0.5 ? 0 : 1);
            }
          }

          setIsChangingPlayer(true);
          setTimeout(() => setIsChangingPlayer(false), 500);

          setGameState({
            marcaAdivinada: nextVehiculoIndex === 2,
            modeloAdivinado: false,
            anoAdivinado: false
          });
          setIntentosFallidos([]);
          setErrorCount(0);
          setMaxImageIndex(0);
          setCurrentImageIndex(0);
          setMarca("");
          setModelo("");
          setAnoFabricacion("");
        } else {
          setShowWinnerModal(true);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [gameState, currentVehiculoIndex, vehiculosDelDia.length, players]);

  const handlePlayerNameSubmit = (e) => {
    e.preventDefault();
    if (tempPlayerNames[0].trim() && tempPlayerNames[1].trim()) {
      setPlayers([
        { name: sanitizeInput(tempPlayerNames[0].trim(), 'name'), score: 0 },
        { name: sanitizeInput(tempPlayerNames[1].trim(), 'name'), score: 0 }
      ]);
      setCurrentPlayer(0);
      setShowPlayerNamesModal(false);
    }
  };

  const handlePlayerNameChange = (index, value) => {
    const newNames = [...tempPlayerNames];
    newNames[index] = sanitizeInput(value, 'name');
    setTempPlayerNames(newNames);
  };

  const getAnoFallidoStyle = (fallido) => {
    if (fallido.anoCorrecto) return "text-success fw-bold";
    
    const diferencia = Math.abs(parseInt(fallido.ano) - parseInt(fallido.anoCorrectoValor));
    if (isNaN(diferencia)) return "fallido custom-bg-danger";
    
    if (diferencia <= 2) return "fallido custom-bg-warning-light";
    if (diferencia <= 5) return "fallido custom-bg-orange";
    if (diferencia <= 9) return "fallido custom-bg-orange-dark";
    return "fallido custom-bg-danger";
  };

  const changePlayer = () => {
    setIsChangingPlayer(true);
    
    // Limpiar solo los campos no adivinados
    if (!gameState.marcaAdivinada && currentVehiculoIndex !== 2) {
      setMarca("");
    }
    if (!gameState.modeloAdivinado) {
      setModelo("");
    }
    if (!gameState.anoAdivinado) {
      setAnoFabricacion("");
    }
    
    setTimeout(() => {
      setCurrentPlayer((currentPlayer + 1) % players.length);
      setIsChangingPlayer(false);
    }, 500);
  };

  const handleGuess = () => {
    if (!vehiculosDelDia[currentVehiculoIndex] || isChangingPlayer) return;

    const vehiculoActual = vehiculosDelDia[currentVehiculoIndex];
    const safeMarca = sanitizeInput(marca, 'brand');
    const safeModelo = sanitizeInput(modelo, 'model');
    const safeAno = sanitizeInput(anoFabricacion, 'year');

    const marcaCorrecta = currentVehiculoIndex !== 2 
      ? validateInput(safeMarca, vehiculoActual.Marca)
      : true;
    
    const modeloCorrecto = validateInput(safeModelo, vehiculoActual.Modelo);
    const anoCorrecto = validateYear(safeAno, vehiculoActual.AnoFabricacion);
    
    const updatedPlayers = [...players];
    let newGameState = {...gameState};

    if (marcaCorrecta && !newGameState.marcaAdivinada && currentVehiculoIndex !== 2) {
      updatedPlayers[currentPlayer].score += 10;
      newGameState.marcaAdivinada = true;
    }
    if (modeloCorrecto && !newGameState.modeloAdivinado) {
      updatedPlayers[currentPlayer].score += 30;
      newGameState.modeloAdivinado = true;
    }
    if (anoCorrecto && !newGameState.anoAdivinado) {
      updatedPlayers[currentPlayer].score += 30;
      newGameState.anoAdivinado = true;
    }

    const allGuessedNow = currentVehiculoIndex !== 2
      ? newGameState.marcaAdivinada && newGameState.modeloAdivinado && newGameState.anoAdivinado
      : newGameState.modeloAdivinado && newGameState.anoAdivinado;

    if (allGuessedNow) {
      setInputStatus("success");
    } else {
      setInputStatus("error");
      setIntentosFallidos(prev => [
        ...prev,
        {
          marca: currentVehiculoIndex !== 2 ? safeMarca : null,
          modelo: safeModelo,
          ano: safeAno,
          playerIndex: currentPlayer,
          marcaCorrecta,
          modeloCorrecto,
          anoCorrecto,
          anoCorrectoValor: vehiculoActual.AnoFabricacion
        }
      ]);
      
      setErrorCount(prev => prev + 1);
      setMaxImageIndex(prev => Math.min(prev + 1, 3));
      setCurrentImageIndex(prev => Math.min(prev + 1, 3));
      
      changePlayer();
    }

    setPlayers(updatedPlayers);
    setGameState(newGameState);

    if (inputStatus === "error") {
      setTimeout(() => setInputStatus(""), 300);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isGuessButtonDisabled()) {
      handleGuess();
    }
  };

  const isGuessButtonDisabled = () => {
    if (isChangingPlayer) return true;
    
    const needsBrand = currentVehiculoIndex !== 2 && !gameState.marcaAdivinada;
    const needsModel = !gameState.modeloAdivinado;
    const needsYear = !gameState.anoAdivinado;
    
    if (needsBrand && !marca.trim()) return true;
    if (needsModel && !modelo.trim()) return true;
    if (needsYear && !anoFabricacion.trim()) return true;
    
    return false;
  };

  const containerClass = theme === "dark" ? "dark-theme" : "light-theme";

  if (isLoading) {
    return (
      <div className={`spinner-container ${containerClass}`}>
        <div className="spinner"></div>
        <span>{renderSafeText(t('multiplayer.loadingVehicles'))}</span>
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

  if (showPlayerNamesModal) {
    return (
      <div className={`jm-player-names-modal-wrapper ${containerClass}`}>
        <div className="jm-road-background"></div>
        <div className="jm-modal-blur-overlay"></div>
        
        <div className="jm-player-names-modal">
          <div className="jm-modal-content">
            <div className="jm-modal-header">
              <div className="jm-btn-back-container">
                <button 
                  onClick={() => navigate("/")} 
                  className="btn jm-btn-back"
                >
                  <FontAwesomeIcon icon={faArrowLeft} /> {renderSafeText(t('multiplayer.back'))}
                </button>
              </div>
              <div className="jm-modal-title-container">
                <h2 className="jm-modal-title">
                  <FontAwesomeIcon icon={faGamepad} className="jm-button-icon" />
                  {renderSafeText(t('multiplayer.playerConfiguration'))}
                </h2>
              </div>
            </div>
            
            <form onSubmit={handlePlayerNameSubmit} className="jm-modal-form">
              <div className="jm-form-group">
                <label htmlFor="player1" className="jm-form-label">
                  <span className="jm-player-number">{renderSafeText(t('multiplayer.player1'))}</span>
                </label>
                <input
                  type="text"
                  id="player1"
                  className="form-control jm-player-input"
                  value={tempPlayerNames[0]}
                  onChange={(e) => handlePlayerNameChange(0, e.target.value)}
                  required
                  minLength="2"
                  maxLength="20"
                  pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-]+"
                  title={t('multiplayer.nameValidationMessage')}
                  autoFocus
                />
              </div>
              
              <div className="jm-form-group">
                <label htmlFor="player2" className="jm-form-label">
                  <span className="jm-player-number">{renderSafeText(t('multiplayer.player2'))}</span>
                </label>
                <input
                  type="text"
                  id="player2"
                  className="form-control jm-player-input"
                  value={tempPlayerNames[1]}
                  onChange={(e) => handlePlayerNameChange(1, e.target.value)}
                  required
                  minLength="2"
                  maxLength="20"
                  pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-]+"
                  title={t('multiplayer.nameValidationMessage')}
                />
              </div>
              
              <button type="submit" className="btn jm-start-game-button">
                <FontAwesomeIcon icon={faTrophy} className="jm-button-icon" />
                {renderSafeText(t('multiplayer.startGame'))}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (showWinnerModal) {
    return (
      <div className={containerClass}>
        <Header />
        <WinnerModal 
          players={players} 
          onClose={() => navigate("/")} 
          t={t}
        />
      </div>
    );
  }

  const vehiculoActual = vehiculosDelDia[currentVehiculoIndex];

  return (
    <div className={containerClass}>
      <Header />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="title-container">
                <h1 className="game-title">
                  {renderSafeText(t('multiplayer.round'))} {currentVehiculoIndex + 1}/3
                </h1>
              </div>
              <div className="card-body">
                <PlayerTurnIndicator 
                  currentPlayer={currentPlayer} 
                  players={players} 
                  isChanging={isChangingPlayer}
                  currentRound={currentVehiculoIndex + 1}
                  t={t}
                />
                
                <div className="position-relative">
                  <img
                    src={DOMPurify.sanitize(vehiculoActual.Imagenes[currentImageIndex], {
                      ALLOWED_URI_REGEXP: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i
                    })}
                    alt={t('multiplayer.vehicleAlt', { number: currentVehiculoIndex + 1 })}
                    className="img-fluid rounded vehicle-image"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = 'placeholder-image.jpg';
                    }}
                  />
                </div>

                <div className="dots-container">
                  {vehiculoActual.Imagenes.slice(0, maxImageIndex + 1).map((_, index) => (
                    <button
                      key={index}
                      className={`dot ${index === currentImageIndex ? "active" : ""}`}
                      onClick={() => setCurrentImageIndex(index)}
                      disabled={isChangingPlayer}
                    ></button>
                  ))}
                </div>

                <div className="mt-3">
                  {currentVehiculoIndex !== 2 && (
                    <div className="input-group mb-2">
                      <InputField
                        value={gameState.marcaAdivinada ? vehiculoActual.Marca : marca}
                        placeholder={gameState.marcaAdivinada ? t('multiplayer.brandGuessed') : t('multiplayer.brandPlaceholder')}
                        onChange={(e) => !gameState.marcaAdivinada && setMarca(e.target.value)}
                        onKeyDown={handleKeyDown}
                        status={gameState.marcaAdivinada ? "success" : ""}
                        disabled={gameState.marcaAdivinada || isChangingPlayer}
                        type="brand"
                      />
                    </div>
                  )}
                  
                  <div className="input-group mb-2">
                    <InputField
                      value={gameState.modeloAdivinado ? vehiculoActual.Modelo : modelo}
                      placeholder={gameState.modeloAdivinado ? t('multiplayer.modelGuessed') : t('multiplayer.modelPlaceholder')}
                      onChange={(e) => !gameState.modeloAdivinado && setModelo(e.target.value)}
                      onKeyDown={handleKeyDown}
                      status={gameState.modeloAdivinado ? "success" : ""}
                      disabled={gameState.modeloAdivinado || isChangingPlayer}
                      type="model"
                    />
                  </div>
                  
                  <div className="input-group mb-2">
                    <InputField
                      value={gameState.anoAdivinado ? vehiculoActual.AnoFabricacion : anoFabricacion}
                      placeholder={gameState.anoAdivinado ? t('multiplayer.yearGuessed') : t('multiplayer.yearPlaceholder')}
                      onChange={(e) => !gameState.anoAdivinado && setAnoFabricacion(e.target.value)}
                      onKeyDown={handleKeyDown}
                      status={gameState.anoAdivinado ? "success" : ""}
                      disabled={gameState.anoAdivinado || isChangingPlayer}
                      type="year"
                    />
                  </div>

                  <div className="d-flex w-100 h-100 gap-2">
                    <button
                      className="btn btn-primary flex-fill mt-2 guess-button"
                      onClick={handleGuess}
                      disabled={isGuessButtonDisabled()}
                    >
                      {renderSafeText(t('game.guessButton'))}
                    </button>
                  </div>

                  <div className="mt-3 failed-attempts">
                    <FailedAttemptsList 
                      attempts={intentosFallidos} 
                      currentPlayerIndex={currentPlayer}
                      getFallidoStyle={getAnoFallidoStyle}
                      t={t}
                      vehiculoActual={vehiculoActual}
                    />
                  </div>
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
            <style jsx>{`
        .intentos-fallidos-container {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #dee2e6;
          border-radius: 0.375rem;
          padding: 0.5rem;
        }
        
        .intentos-fallidos {
          margin-bottom: 0;
        }
        
        .intentos-fallidos .list-group-item {
          padding: 0.5rem;
          margin-bottom: 0.25rem;
          border-radius: 0.25rem;
        }
        
        .intentos-fallidos .list-group-item:last-child {
          margin-bottom: 0;
        }
        
        .intentos-fallidos .list-group-item span {
          margin-right: 0.5rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default JuegoMultijugador;