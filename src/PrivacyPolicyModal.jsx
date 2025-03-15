import React from "react";
import "./PrivacyPolicyModal.css"; // Asegúrate de crear este archivo CSS

const PrivacyPolicyModal = ({ show, onHide, theme }) => {
  if (!show) return null;
  
  return (
    <div className="custom-modal-overlay">
      <div className={`custom-modal ${theme === "dark" ? "dark-theme" : "light-theme"}`}>
        <div className="custom-modal-header">
          <h2>Políticas de Privacidad</h2>
          <button className="close-button" onClick={onHide}>×</button>
        </div>
        <div className="custom-modal-body">
          <h4>Introducción</h4>
          <p>
            En nuestra aplicación, la privacidad de nuestros usuarios es muy importante para nosotros. 
            Esta política de privacidad explica cómo recopilamos, usamos, compartimos y protegemos su 
            información personal.
          </p>

          <h4>Información que Recopilamos</h4>
          <p>
            Recopilamos información que usted nos proporciona directamente, como su nombre, dirección 
            de correo electrónico y cualquier otra información que decida compartir con nosotros.
          </p>

          <h4>Uso de la Información</h4>
          <p>
            Utilizamos la información recopilada para proporcionar, mantener y mejorar nuestros 
            servicios, así como para desarrollar nuevos servicios y proteger a nuestros usuarios.
          </p>

          <h4>Compartir Información</h4>
          <p>
            No compartimos su información personal con terceros, excepto en los casos en que sea 
            necesario para proporcionar nuestros servicios o cuando estemos legalmente obligados a hacerlo.
          </p>

          <h4>Seguridad</h4>
          <p>
            Implementamos medidas de seguridad para proteger su información personal contra el acceso 
            no autorizado, la alteración, la divulgación o la destrucción.
          </p>

          <h4>Cambios en la Política de Privacidad</h4>
          <p>
            Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos cualquier 
            cambio publicando la nueva política en esta página.
          </p>
        </div>
        <div className="custom-modal-footer">
          <button className="accept-button" onClick={onHide}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;