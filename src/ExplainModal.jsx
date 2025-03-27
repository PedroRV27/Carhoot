import React, { useContext } from "react";
import { Modal, Button } from "react-bootstrap"; // Cambia la importación para usar los mismos componentes
import "./ExplainModal.css";
import { AppContext } from "./context/AppContext";

const ExplainModal = ({ isOpen, onClose }) => {
  const { theme } = useContext(AppContext);
  
  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      centered
      className={theme === "dark" ? "dark-modal" : "light-modal"} // Mantiene la clase basada en el tema
    >
      <Modal.Header closeButton>
        <Modal.Title>Cómo Jugar</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>El objetivo del juego</strong> es adivinar <strong>la marca, el modelo y el año</strong> de un coche a partir de imágenes.</p>
        
        <p><strong>1. Adivina la marca:</strong> Escribe el nombre de la marca a la que pertenece el coche.</p>
        <div class="modelo" style={{ padding: "10px", backgroundColor: "#f8d7da", borderRadius: "8px", fontWeight: "bold", fontSize: "1.1em" }}>
          <p><strong>2. Adivina el modelo:</strong> Si aciertas la marca, ahora debes escribir el modelo del coche.</p>
          <p>Para marcas como BMW o Mercedes-Benz, no es necesario especificar el modelo de motor. En su lugar, indica la serie o clase correspondiente, como <strong>"Serie 3"</strong> en BMW o <strong>"C-Class", "E-Class", "SL-Class"</strong> en Mercedes.</p>
        </div>
        <p><strong>3. Adivina el año:</strong> Una vez que hayas acertado el modelo, intenta descubrir el año de fabricación.</p>
        
        <h5>Imágenes</h5>
        <p>Tienes <strong>cuatro imágenes disponibles</strong>, pero al inicio solo podrás ver una. Cada vez que cometas un error, se desbloqueará una nueva imagen hasta que se muestren todas.</p>
        
        <h5>Pistas</h5>
        <p>Si fallas <strong>5 veces</strong>, se activará un <strong>botón de pista</strong> que te mostrará una letra de la respuesta correcta. <strong>Este botón desaparecerá en la fase del año.</strong> Sientente libre de utilizar esta opcion o ignorarla</p>
        
        <h5>Ayuda para el año</h5>
        <p>Cuando intentes adivinar el año, el color de los intentos te indicará si estás cerca o lejos:</p>
        <ul>
          <li><span style={{ color: "red" }}>🔴 Rojo/Naranja</span> → Muy lejos del año correcto.</li>
          <li><span style={{ color: "yellow" }}>🟡 Amarillo</span> → Te estás acercando.</li>
          <li><span style={{ color: "green" }}>🟢 Verde</span> → ¡Muy cerca!</li>
        </ul>
        
        <p>¡Buena suerte! 🚗💨</p>
      </Modal.Body>
    </Modal>
  );
};

export default ExplainModal;
