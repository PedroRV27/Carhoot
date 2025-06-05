import React from "react";
import { useTranslation } from 'react-i18next';
import "./PrivacyPolicyModal.css";

const PrivacyPolicyModal = ({ show, onHide, theme }) => {
  const { t } = useTranslation();
  
  if (!show) return null;
     
  return (
    <div className="custom-modal-overlay">
      <div className={`custom-modal ${theme === "dark" ? "dark-theme" : "light-theme"}`}>
        <div className="custom-modal-header">
          <h2>{t('privacyPolicy.title')}</h2>
          <button className="close-button" onClick={onHide}>×</button>
        </div>
        <div className="custom-modal-body">
          <h4>{t('privacyPolicy.cookiesTitle')}</h4>
          <p>
            {t('privacyPolicy.cookiesDescription')}
          </p>
          <p>
            {t('privacyPolicy.cookiesUsage')}
          </p>
           
          <h4>{t('privacyPolicy.advertisingTitle')}</h4>
          <p>
            {t('privacyPolicy.advertisingDescription')}
          </p>
          <p>
            {t('privacyPolicy.euUsersNotice')}
          </p>
           
          <h4>{t('privacyPolicy.updatesTitle')}</h4>
          <p>
            {t('privacyPolicy.updatesDescription')}
          </p>
        </div>
        <div className="custom-modal-footer">
          <button className="accept-button" onClick={onHide}>
            {t('privacyPolicy.acceptButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;