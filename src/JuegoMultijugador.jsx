import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "./context/AppContext";
import { getCoches } from "./services/api";
import "./Juego.css";
import "./JuegoMultijugador.css";
import Header from "./Header";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb, faHome, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

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

const PlayerTurnIndicator = ({ currentPlayer, players }) => (
  <div className="player-turn-indicator">
    <h4>Turno de: <span className="player-name">{players[currentPlayer].name}</span></h4>
    <div className="player-scores">
      {players.map((player, index) => (
        <div key={index} className={`player-score ${index === currentPlayer ? 'active' : ''}`}>
          {player.name}: {player.score} pts
        </div>
      ))}
    </div>
  </div>
);

const FailedAttemptsList = ({ attempts, currentPlayerIndex, getFallidoStyle }) => (
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
            <div className="feedback-message text-warning">¡Marca correcta! +10pts</div>
          )}
          {intento.modeloCorrecto && (
            <div className="feedback-message text-warning">¡Modelo correcto! +30pts</div>
          )}
          {intento.anoCorrecto && (
            <div className="feedback-message text-warning">¡Año correcto! +30pts</div>
          )}
        </li>
      ))}
  </ul>
);

const JuegoMultijugador = () => {
  const { theme, language } = useContext(AppContext);
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
  const [players, setPlayers] = useState([
    { name: "", score: 0 },
    { name: "", score: 0 }
  ]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [tempPlayerNames, setTempPlayerNames] = useState(["", ""]);
  const [gameState, setGameState] = useState({
    marcaAdivinada: false,
    modeloAdivinado: false,
    anoAdivinado: false
  });

  useEffect(() => {
    fetchVehiculosDelDia();
  }, []);

  const fetchVehiculosDelDia = async () => {
    const coches = await getCoches();
    const hoy = new Date().toISOString().split("T")[0];
    const vehiculos = coches.filter((coche) => coche.fechaProgramada === hoy).slice(0, 3);
    setVehiculosDelDia(vehiculos);
  };

  const handlePlayerNameSubmit = (e) => {
    e.preventDefault();
    if (tempPlayerNames[0].trim() && tempPlayerNames[1].trim()) {
      setPlayers([
        { name: tempPlayerNames[0], score: 0 },
        { name: tempPlayerNames[1], score: 0 }
      ]);
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

  const handleGuess = () => {
    if (!vehiculosDelDia[currentVehiculoIndex]) return;

    const vehiculoActual = vehiculosDelDia[currentVehiculoIndex];
    const marcaCorrecta = marca.toLowerCase() === vehiculoActual.Marca.toLowerCase();
    const modeloCorrecto = modelo.toLowerCase() === vehiculoActual.Modelo.toLowerCase();
    const anoCorrecto = anoFabricacion.toString() === vehiculoActual.AnoFabricacion.toString();
    
    const updatedPlayers = [...players];
    let newGameState = {...gameState};
    let allCorrect = false;

    // Determinar si todos los campos requeridos son correctos
    if (currentVehiculoIndex !== 2) {
      allCorrect = marcaCorrecta && modeloCorrecto && anoCorrecto;
    } else {
      allCorrect = modeloCorrecto && anoCorrecto;
    }

    // Asignar puntos por campos adivinados
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

    if (allCorrect) {
      setInputStatus("success");
      setTimeout(() => {
        if (currentVehiculoIndex < vehiculosDelDia.length - 1) {
          // Pasar a la siguiente ronda sin cambiar de turno
          setCurrentVehiculoIndex(currentVehiculoIndex + 1);
          setGameState({
            marcaAdivinada: currentVehiculoIndex === 2, // No mostrar marca en el 3er coche
            modeloAdivinado: false,
            anoAdivinado: false
          });
          setIntentosFallidos([]);
          setErrorCount(0);
          setMaxImageIndex(0);
          setCurrentImageIndex(0);
        } else {
          // Juego completado
          setGameState({
            marcaAdivinada: true,
            modeloAdivinado: true,
            anoAdivinado: true
          });
        }
        setInputStatus("");
      }, 800);
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
      
      const nuevoMaxIndex = Math.min(maxImageIndex + 1, 3);
      setMaxImageIndex(nuevoMaxIndex);
      setCurrentImageIndex(nuevoMaxIndex);
      
      // Cambiar de turno solo si no se acertó todo
      setCurrentPlayer((currentPlayer + 1) % players.length);
    }

    setPlayers(updatedPlayers);
    setGameState(newGameState);
    
    // Limpiar campos
    if (marcaCorrecta || currentVehiculoIndex === 2) setMarca("");
    if (modeloCorrecto) setModelo("");
    if (anoCorrecto) setAnoFabricacion("");

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
        <span>Cargando vehículos del día...</span>
      </div>
    );
  }

  if (showPlayerNamesModal) {
    return (
      <div className={`player-names-modal ${containerClass}`}>
        <div className="player-names-container">
          <button 
            onClick={() => navigate("/")} 
            className="btn btn-back"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Volver
          </button>
          <h2>Ingresa los nombres de los jugadores</h2>
          <form onSubmit={handlePlayerNameSubmit}>
            <div className="mb-3">
              <label htmlFor="player1" className="form-label">Jugador 1:</label>
              <input
                type="text"
                id="player1"
                className="form-control"
                value={tempPlayerNames[0]}
                onChange={(e) => handlePlayerNameChange(0, e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="mb-3">
              <label htmlFor="player2" className="form-label">Jugador 2:</label>
              <input
                type="text"
                id="player2"
                className="form-control"
                value={tempPlayerNames[1]}
                onChange={(e) => handlePlayerNameChange(1, e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Comenzar Juego
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (currentVehiculoIndex >= vehiculosDelDia.length) {
    return (
      <div className={containerClass}>
        <Header />
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="text-center success-container">
                <h2 className="success-message">¡Juego completado!</h2>
                <div className="final-scores mt-4">
                  <h3>Puntuaciones Finales</h3>
                  {players.map((player, index) => (
                    <div key={index} className={`final-score ${player.score === Math.max(...players.map(p => p.score)) ? 'winner' : ''}`}>
                      {player.name}: {player.score} puntos
                      {player.score === Math.max(...players.map(p => p.score)) && <span> 🏆</span>}
                    </div>
                  ))}
                </div>
                <Link to="/" className="btn btn-primary mt-3">
                  <FontAwesomeIcon icon={faHome} /> Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
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
                <h1 className="game-title">Guess the Car (Ronda {currentVehiculoIndex + 1}/3)</h1>
                <Link to="/" className="btn btn-secondary home-btn">
                  <FontAwesomeIcon icon={faHome} />
                </Link>
              </div>
              <div className="card-body">
                <PlayerTurnIndicator currentPlayer={currentPlayer} players={players} />
                
                <div className="position-relative">
                  <img
                    src={vehiculoActual.Imagenes[currentImageIndex]}
                    alt={`Vehículo ${currentVehiculoIndex + 1} del día`}
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
                        value={marca}
                        placeholder={gameState.marcaAdivinada ? "Marca ya adivinada" : "Introduce la marca"}
                        onChange={(e) => setMarca(e.target.value)}
                        onKeyDown={handleKeyDown}
                        status={inputStatus}
                        disabled={gameState.marcaAdivinada}
                      />
                    </div>
                  )}
                  
                  <div className="input-group mb-2">
                    <InputField
                      value={modelo}
                      placeholder={gameState.modeloAdivinado ? "Modelo ya adivinado" : "Introduce el modelo"}
                      onChange={(e) => setModelo(e.target.value)}
                      onKeyDown={handleKeyDown}
                      status={inputStatus}
                      disabled={gameState.modeloAdivinado}
                    />
                  </div>
                  
                  <div className="input-group mb-2">
                    <InputField
                      value={anoFabricacion}
                      placeholder={gameState.anoAdivinado ? "Año ya adivinado" : "Introduce el año"}
                      onChange={(e) => setAnoFabricacion(e.target.value)}
                      onKeyDown={handleKeyDown}
                      status={inputStatus}
                      disabled={gameState.anoAdivinado}
                    />
                  </div>

                  <div className="d-flex w-100 h-100 gap-2">
                    <button
                      className="btn btn-primary flex-fill mt-2 guess-button"
                      onClick={handleGuess}
                      disabled={
                        (currentVehiculoIndex !== 2 && (gameState.marcaAdivinada || !marca)) &&
                        (gameState.modeloAdivinado || !modelo) &&
                        (gameState.anoAdivinado || !anoFabricacion)
                      }
                    >
                      Adivinar
                    </button>
                    <button
                      className="btn btn-secondary hint-button mt-2"
                      disabled={errorCount < 5}
                    >
                      <FontAwesomeIcon
                        icon={faLightbulb}
                        className={errorCount < 5 ? "text-muted" : "text-warning active"}
                      />
                    </button>
                  </div>

                  <div className="mt-3 failed-attempts">
                    <FailedAttemptsList 
                      attempts={intentosFallidos} 
                      currentPlayerIndex={currentPlayer}
                      getFallidoStyle={getAnoFallidoStyle}
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