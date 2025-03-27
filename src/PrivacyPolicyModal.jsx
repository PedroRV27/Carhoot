import React from "react";
import "./PrivacyPolicyModal.css"; // Asegúrate de crear este archivo CSS

const PrivacyPolicyModal = ({ show, onHide, theme }) => {
  if (!show) return null;
  
  return (
    <div className="custom-modal-overlay">
      <div className={`custom-modal ${theme === "dark" ? "dark-theme" : "light-theme"}`}>
        <div className="custom-modal-header">
          <h2>Política de Privacidad</h2>
          <button className="close-button" onClick={onHide}>×</button>
        </div>
        <div className="custom-modal-body">
          <h4>Cookies y Tecnologías de Seguimiento</h4>
          <p>
            Este sitio utiliza cookies y tecnologías de seguimiento similares para mejorar la experiencia 
            del usuario y ofrecer un entorno publicitario más relevante. Las cookies son esenciales para 
            medir la efectividad de la publicidad y garantizar una industria publicitaria en línea sólida.  
          </p>
          <p>
            Utilizamos una cookie propia para almacenar el progreso del usuario en el juego, permitiéndole 
            continuar desde donde lo dejó en visitas posteriores. Además, nuestros socios publicitarios 
            pueden utilizar identificadores únicos almacenados en cookies para mejorar la personalización 
            de anuncios y la compatibilidad en navegadores como iOS y macOS.
          </p>

          <h4>Preferencias de Publicidad</h4>
          <p>
            Algunos anuncios en nuestro sitio pueden estar basados en su actividad de navegación y pueden 
            utilizar tecnologías de seguimiento para mostrar contenido relevante. Estas cookies publicitarias 
            permiten una mejor experiencia adaptada a los intereses de cada usuario.
          </p>
          <p>
            PARA USUARIOS EN LA UE: Al utilizar nuestro sitio, ciertas empresas preseleccionadas pueden acceder 
            y utilizar información de su dispositivo para mostrar anuncios personalizados.
          </p>

          <h4>Actualización de la Política</h4>
          <p>
            Esta política de privacidad puede actualizarse ocasionalmente. Cualquier cambio será reflejado en 
            esta página.
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
