import Cookies from "js-cookie";

export const saveGameProgress = (vehiculoDelDia, progressData) => {
  if (!vehiculoDelDia) return;
  
  const hoy = new Date().toISOString().split("T")[0];
  const progress = {
    fecha: hoy,
    vehiculoId: vehiculoDelDia.id,
    modo: progressData.modo || 'normal', // 'normal' o 'dificil'
    ...progressData
  };
  
  // Guardar en cookies y localStorage para mejor persistencia
  Cookies.set(`gameProgress_${hoy}`, JSON.stringify(progress), { expires: 1 });
  localStorage.setItem(`gameProgress_${hoy}`, JSON.stringify(progress));
};

export const loadGameProgress = (vehiculoDelDia, modo = null) => {
  if (!vehiculoDelDia) return null;
  
  const hoy = new Date().toISOString().split("T")[0];
  const savedData = localStorage.getItem(`gameProgress_${hoy}`) || 
                    Cookies.get(`gameProgress_${hoy}`);
  
  if (!savedData) return null;
  
  const parsedData = JSON.parse(savedData);
  
  // Verificar que es el mismo vehículo
  if (parsedData.vehiculoId !== vehiculoDelDia.id || parsedData.fecha !== hoy) {
    return null;
  }
  
  // Si se especificó un modo, verificar coincidencia
  if (modo && parsedData.modo !== modo) {
    // Si el modo no coincide pero el juego está completo, compartir progreso
    if (parsedData.isCompleted) {
      return {
        ...parsedData,
        modo: modo // Actualizar al modo actual
      };
    }
    return null;
  }
  
  return parsedData;
};

export const resetGameProgress = () => {
  const hoy = new Date().toISOString().split("T")[0];
  Cookies.remove(`gameProgress_${hoy}`);
  localStorage.removeItem(`gameProgress_${hoy}`);
};