import React, { useContext } from "react";
import Modal from "react-bootstrap/Modal";
import { useTranslation } from "react-i18next";
import { AppContext } from "./context/AppContext";
import "./HintModal.css";

const HintModal = ({ show, onHide, revealedText, attemptsRemaining }) => {
  const { theme } = useContext(AppContext);
  const { t } = useTranslation();
  
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
        <Modal.Title className="modal-title-custom">{t('hintModal.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body-custom">
        <div className="hint-content">
          <p className="hint-label">{t('hintModal.revealedLetters')}:</p>
          <div className="revealed-text">{revealedText}</div>
          <p className="attempts-remaining">
            {t('hintModal.attemptsRemaining')}:
            <span className="attempts-count"> {attemptsRemaining}</span>
          </p>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default HintModal;