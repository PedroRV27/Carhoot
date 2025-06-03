import React, { useContext } from "react";
import Modal from "react-bootstrap/Modal";
import { AppContext } from "./context/AppContext";
import "./HintModal.css";

const HintModal = ({ show, onHide, revealedText, attemptsRemaining }) => {
  const { theme } = useContext(AppContext);
  
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="md"
      className={`hint-modal ${theme}-modal`}
      backdropClassName="custom-backdrop"
      animation={true}
    >
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title className="modal-title-custom">Pista Revelada</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body-custom">
        <div className="hint-content">
          <p className="hint-label">Letras reveladas:</p>
          <div className="revealed-text">{revealedText}</div>
          <p className="attempts-remaining">
            Intentos restantes para próxima letra: 
            <span className="attempts-count"> {attemptsRemaining}</span>
          </p>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default HintModal;