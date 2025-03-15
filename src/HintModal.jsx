import React, { useContext } from "react";
import Modal from "react-bootstrap/Modal";
import { AppContext } from "./context/AppContext"; // Importa el contexto
import "./HintModal.css"; // Importa los estilos
const HintModal = ({ show, onHide, revealedText, attemptsRemaining }) => {
  const { theme } = useContext(AppContext);
  
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className={`${theme}-modal`}
      backdropClassName="transparent-backdrop" // Opcional: clase adicional para el fondo
    >
      <Modal.Header closeButton>
        <Modal.Title>Pista</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Letras reveladas: <strong>{revealedText}</strong></p>
        <p>Intentos restantes para la próxima letra: {attemptsRemaining}</p>
      </Modal.Body>
    </Modal>
  );
};
export default HintModal;