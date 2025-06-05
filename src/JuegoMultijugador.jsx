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

const InputField = ({ value, placeholder, onChange, onKeyDown, status, disabled }) => (
  <input
    type="text"
    className={`form-control input-field ${disabled ? 'disabled-field' : ''} ${status}`}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    onKeyDown={onKeyDown}
    disabled={disabled}
  />
);

const PlayerTurnIndicator = ({ currentPlayer, players, isChanging, currentRound, t }) => (
  <div className={`player-turn-indicator ${isChanging ? 'changing' : ''}`}>
    <h4>{t('multiplayer.turnOf')} <span className="player-name">{players[currentPlayer].name}</span></h4>
    {currentRound === 1 && <small className="turn-reason"></small>}
    {currentRound === 2 && <small className="turn-reason"></small>}
    {currentRound === 3 && <small className="turn-reason"></small>}
    <div className="player-scores">
      {players.map((player, index) => (
        <div key={index} className={`player-score ${index === currentPlayer ? 'active' : ''}`}>
          {player.name}: {player.score} pts
        </div>
      ))}
    </div>
  </div>
);

const FailedAttemptsList = ({ attempts, currentPlayerIndex, getFallidoStyle, t }) => (
  <ul className="list-group intentos-fallidos">
    {attempts
      .filter(intento => intento.playerIndex === currentPlayerIndex)
      .slice()
      .reverse()
      .map((intento, idx) => (
        <li key={idx} className="list-group-item">
          {intento.marca && <span className={intento.marcaCorrecta ? "text-success fw-bold" : ""}>
            {intento.marca}
          </span>}
          {intento.modelo && <span className={intento.modeloCorrecto ? "text-success fw-bold" : !intento.modeloCorrecto && intento.modelo ? "text-danger" : ""}>
            {intento.modelo}
          </span>}
          {intento.ano && <span className={getFallidoStyle(intento)}>
            {intento.ano}
          </span>}
          {intento.marcaCorrecta && !intento.modeloCorrecto && !intento.anoCorrecto && (
            <div className="feedback-message text-warning">{t('multiplayer.correctBrand')}</div>
          )}
          {intento.modeloCorrecto && (
            <div className="feedback-message text-warning">{t('multiplayer.correctModel')}</div>
          )}
          {intento.anoCorrecto && (
            <div className="feedback-message text-warning">{t('multiplayer.correctYear')}</div>
          )}
        </li>
      ))}
  </ul>
);

const WinnerModal = ({ players, onClose, t }) => {
  const winnerScore = Math.max(...players.map(p => p.score));
  const winners = players.filter(p => p.score === winnerScore);
  
  return (
    <div className="winner-modal-overlay">
      <div className="winner-modal">
        <div className="winner-modal-header">
          <FontAwesomeIcon icon={faTrophy} className="trophy-icon" />
          <h2>{t('multiplayer.gameCompleted')}</h2>
        </div>
        
        <div className="winner-modal-body">
          <h3>{t('multiplayer.finalResults')}</h3>
          {players.map((player, index) => (
            <div key={index} className={`player-result ${player.score === winnerScore ? 'winner' : ''}`}>
              <span className="player-name">{player.name}</span>
              <span className="player-score">{player.score} {t('multiplayer.points')}</span>
              {player.score === winnerScore && <span className="winner-badge">{t('multiplayer.winner')}</span>}
            </div>
          ))}
        </div>
        
        <button onClick={onClose} className="btn btn-primary winner-modal-button">
          {t('multiplayer.backToHome')}
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

  useEffect(() => {
    fetchVehiculosDelDia();
  }, []);

  useEffect(() => {
    const allFieldsGuessed = currentVehiculoIndex !== 2 
      ? gameState.marcaAdivinada && gameState.modeloAdivinado && gameState.anoAdivinado
      : gameState.modeloAdivinado && gameState.anoAdivinado;

    if (allFieldsGuessed) {
      const timer = setTimeout(() => {
        if (currentVehiculoIndex < vehiculosDelDia.length - 1) {
          const nextVehiculoIndex = currentVehiculoIndex + 1;
          setCurrentVehiculoIndex(nextVehiculoIndex);

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
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [gameState, currentVehiculoIndex, vehiculosDelDia.length]);

  const fetchVehiculosDelDia = async () => {
    try {
      const coches = await getCoches();
      
      const vehiculosAleatorios = [];
      const indicesUsados = new Set();
      const cantidad = Math.min(3, coches.length);
      
      while (vehiculosAleatorios.length < cantidad) {
        const indiceAleatorio = Math.floor(Math.random() * coches.length);
        if (!indicesUsados.has(indiceAleatorio)) {
          indicesUsados.add(indiceAleatorio);
          vehiculosAleatorios.push(coches[indiceAleatorio]);
        }
      }
      
      setVehiculosDelDia(vehiculosAleatorios);
    } catch (error) {
      console.error("Error al obtener los coches:", error);
    }
  };

  const handlePlayerNameSubmit = (e) => {
    e.preventDefault();
    if (tempPlayerNames[0].trim() && tempPlayerNames[1].trim()) {
      setPlayers([
        { name: tempPlayerNames[0], score: 0 },
        { name: tempPlayerNames[1], score: 0 }
      ]);
      setCurrentPlayer(0);
      setShowPlayerNamesModal(false);
    }
  };

  const handlePlayerNameChange = (index, value) => {
    const newNames = [...tempPlayerNames];
    newNames[index] = value;
    setTempPlayerNames(newNames);
  };

  const getAnoFallidoStyle = (fallido) => {
    if (fallido.anoCorrecto) return "text-success fw-bold";
    
    const diferencia = Math.abs(fallido.ano - fallido.anoCorrectoValor);
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
    if (!vehiculosDelDia[currentVehiculoIndex]) return;

    const vehiculoActual = vehiculosDelDia[currentVehiculoIndex];
    const marcaCorrecta = marca.toLowerCase() === vehiculoActual.Marca.toLowerCase();
    const modeloCorrecto = modelo.toLowerCase() === vehiculoActual.Modelo.toLowerCase();
    const anoCorrecto = anoFabricacion.toString() === vehiculoActual.AnoFabricacion.toString();
    
    const updatedPlayers = [...players];
    let newGameState = {...gameState};

    if (marcaCorrecta && !newGameState.marcaAdivinada) {
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
          marca: currentVehiculoIndex !== 2 ? marca : null,
          modelo,
          ano: anoFabricacion,
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
    if (e.key === "Enter") {
      handleGuess();
    }
  };

  const containerClass = theme === "dark" ? "dark-theme" : "light-theme";

  if (!vehiculosDelDia.length) {
    return (
      <div className={`spinner-container ${containerClass}`}>
        <div className="spinner"></div>
        <span>{t('multiplayer.loadingVehicles')}</span>
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
                  <FontAwesomeIcon icon={faArrowLeft} /> {t('multiplayer.back')}
                </button>
              </div>
              <div className="jm-modal-title-container">
                <h2 className="jm-modal-title">
                  <FontAwesomeIcon icon={faGamepad} className="jm-button-icon" />
                  {t('multiplayer.playerConfiguration')}
                </h2>
              </div>
            </div>
            
            <form onSubmit={handlePlayerNameSubmit} className="jm-modal-form">
              <div className="jm-form-group">
                <label htmlFor="player1" className="jm-form-label">
                  <span className="jm-player-number">{t('multiplayer.player1')}</span>
                </label>
                <input
                  type="text"
                  id="player1"
                  className="form-control jm-player-input"
                  value={tempPlayerNames[0]}
                  onChange={(e) => handlePlayerNameChange(0, e.target.value)}
                  required
                  autoFocus
                />
              </div>
              
              <div className="jm-form-group">
                <label htmlFor="player2" className="jm-form-label">
                  <span className="jm-player-number">{t('multiplayer.player2')}</span>
  
                </label>
                <input
                  type="text"
                  id="player2"
                  className="form-control jm-player-input"
                  value={tempPlayerNames[1]}
                  onChange={(e) => handlePlayerNameChange(1, e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="btn jm-start-game-button">
                <FontAwesomeIcon icon={faTrophy} className="jm-button-icon" />
                {t('multiplayer.startGame')}
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
                <h1 className="game-title">({t('multiplayer.round')} {currentVehiculoIndex + 1}/3)</h1>
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
                    src={vehiculoActual.Imagenes[currentImageIndex]}
                    alt={t('multiplayer.vehicleAlt', { number: currentVehiculoIndex + 1 })}
                    className="img-fluid rounded vehicle-image"
                  />
                </div>

                <div className="dots-container">
                  {vehiculoActual.Imagenes.slice(0, maxImageIndex + 1).map((_, index) => (
                    <button
                      key={index}
                      className={`dot ${index === currentImageIndex ? "active" : ""}`}
                      onClick={() => setCurrentImageIndex(index)}
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
                        disabled={gameState.marcaAdivinada}
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
                      disabled={gameState.modeloAdivinado}
                    />
                  </div>
                  
                  <div className="input-group mb-2">
                    <InputField
                      value={gameState.anoAdivinado ? vehiculoActual.AnoFabricacion : anoFabricacion}
                      placeholder={gameState.anoAdivinado ? t('multiplayer.yearGuessed') : t('multiplayer.yearPlaceholder')}
                      onChange={(e) => !gameState.anoAdivinado && setAnoFabricacion(e.target.value)}
                      onKeyDown={handleKeyDown}
                      status={gameState.anoAdivinado ? "success" : ""}
                      disabled={gameState.anoAdivinado}
                    />
                  </div>

                  <div className="d-flex w-100 h-100 gap-2">
                    <button
                      className="btn btn-primary flex-fill mt-2 guess-button"
                      onClick={handleGuess}
                      disabled={
                        (currentVehiculoIndex !== 2 && (gameState.marcaAdivinada || !marca)) ||
                        (gameState.modeloAdivinado || !modelo) ||
                        (gameState.anoAdivinado || !anoFabricacion)
                      }
                    >
                      {t('game.guessButton')}
                    </button>
                  </div>

                  <div className="mt-3 failed-attempts">
                    <FailedAttemptsList 
                      attempts={intentosFallidos} 
                      currentPlayerIndex={currentPlayer}
                      getFallidoStyle={getAnoFallidoStyle}
                      t={t}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JuegoMultijugador;