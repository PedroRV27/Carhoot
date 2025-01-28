import React, { useEffect, useState } from "react";
import { getCoches } from "./services/api";
import "./Juego.css";

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
    if (diferencia <= 2) return "custom-bg-warning-light";
    if (diferencia <= 5) return "custom-bg-orange";
    if (diferencia <= 9) return "custom-bg-orange-dark";
    return "custom-bg-danger";
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
      setErrorCount((prev) => prev + 1); // Incrementar el contador de errores
      setCurrentImageIndex((prevIndex) =>
        Math.min(prevIndex + 1, vehiculoDelDia.Imagenes.length - 1)
      ); // Cambiar a la siguiente imagen en caso de fallo
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

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      ((step === 1 && marca) || (step === 2 && modelo) || (step === 3 && anoFabricacion))
    ) {
      handleGuess();
    }
  };

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
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold">Carhoot</h1>
        <p className="text-muted">Adivina la marca, modelo y año del vehículo</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8">
          {isCompleted ? (
            <div className="text-center p-5 bg-success text-white rounded">
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
                {errorCount > 0 && currentImageIndex < vehiculoDelDia.Imagenes.length - 1 && (
                  <button
                    className="btn btn-secondary position-absolute end-0 top-50 translate-middle-y"
                    onClick={() =>
                      setCurrentImageIndex((prevIndex) =>
                        Math.min(prevIndex + 1, vehiculoDelDia.Imagenes.length - 1)
                      )
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
      </div>
    </div>
  );
};

export default Juego;
