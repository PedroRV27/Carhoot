import React, { useContext } from "react";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "./ExplainModal.css";
import { AppContext } from "./context/AppContext";

const ExplainModal = ({ isOpen, onClose, gameMode }) => {
  const { theme } = useContext(AppContext);
  const { t } = useTranslation();
  
  // Contenido común para todos los modos
  const commonContent = (
    <>
      <h5>{t('howToPlay.images.title')}</h5>
      <p>{t('howToPlay.images.description')}</p>
    </>
  );

  // Contenido específico para cada modo
  const modeSpecificContent = {
    normal: (
      <>
        <p>{t('howToPlay.normal.objective')}</p>
        
        <p>{t('howToPlay.normal.step1')}</p>
        <div className="modelo" style={{ padding: "10px", backgroundColor: "#f8d7da", borderRadius: "8px", fontWeight: "bold", fontSize: "1.1em" }}>
          <p>{t('howToPlay.normal.step2.title')}</p>
          <p>{t('howToPlay.normal.step2.description')}</p>
        </div>
        <p>{t('howToPlay.normal.step3')}</p>
        
        <h5>{t('howToPlay.hints.title')}</h5>
        <p>{t('howToPlay.hints.description')}</p>

        <h5>{t('howToPlay.yearHelp.title')}</h5>
        <p>{t('howToPlay.yearHelp.description')}</p>
        <ul>
          <li><span style={{ color: "red" }}>🔴 {t('howToPlay.yearHelp.red')}</span></li>
          <li><span style={{ color: "yellow" }}>🟡 {t('howToPlay.yearHelp.yellow')}</span></li>
          <li><span style={{ color: "green" }}>🟢 {t('howToPlay.yearHelp.green')}</span></li>
        </ul>
      </>
    ),
    hard: (
      <>
        <p>{t('howToPlay.hard.objective')}</p>
        
        <p>{t('howToPlay.hard.step1')}</p>
        <div className="modelo" style={{ padding: "10px", backgroundColor: "#f8d7da", borderRadius: "8px", fontWeight: "bold", fontSize: "1.1em" }}>
          <p>{t('howToPlay.hard.step2')}</p>
        </div>
        <p>{t('howToPlay.hard.step3')}</p>

        <h5>{t('howToPlay.hints.title')}</h5>
        <p>{t('howToPlay.hints.description')}</p>
      </>
    ),
    multiplayer: (
      <>
        <p>{t('howToPlay.multiplayer.objective')}</p>
        
        <p>{t('howToPlay.multiplayer.round1')}</p>
        <p>{t('howToPlay.multiplayer.round2')}</p>
        <p>{t('howToPlay.multiplayer.round3')}</p>
        
        <h5>{t('howToPlay.multiplayer.winCondition')}</h5>
        
        <p>{t('howToPlay.multiplayer.note')}</p>
      </>
    )
  };

  const getModalTitle = () => {
    switch(gameMode) {
      case 'hard':
        return `${t('howToPlay.title')} ${t('howToPlay.hardMode')}`;
      case 'multiplayer':
        return `${t('howToPlay.title')} ${t('howToPlay.multiplayerMode')}`;
      default:
        return t('howToPlay.title');
    }
  };

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      centered
      className={theme === "dark" ? "dark-modal" : "light-modal"}
    >
      <Modal.Header closeButton>
        <Modal.Title>{getModalTitle()}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {modeSpecificContent[gameMode]}
        {commonContent}
        <p>{t('howToPlay.goodLuck')}</p>
      </Modal.Body>
    </Modal>
  );
};

export default ExplainModal;