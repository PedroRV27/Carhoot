import Cookies from "js-cookie";

// Guardar progreso del juego
export const saveGameProgress = (vehiculoDelDia, progressData) => {
  if (!vehiculoDelDia) return;
  
  const hoy = new Date().toISOString().split("T")[0];
  const progress = {
    fecha: hoy,
    vehiculoId: vehiculoDelDia.id,
    modo: progressData.modo || 'normal', // 'normal' o 'dificil'
    ...progressData,
    // Forzamos a guardar estos valores importantes si no están
    step: progressData.step || 1,
    errorCount: progressData.errorCount || 0,
    totalAttemptsUsed: progressData.totalAttemptsUsed || progressData.errorCount || 0
  };
  
  // Guardar en cookies y localStorage para mejor persistencia
  Cookies.set(`gameProgress_${hoy}`, JSON.stringify(progress), { expires: 1 });
  localStorage.setItem(`gameProgress_${hoy}`, JSON.stringify(progress));
};

// Cargar progreso del juego
export const loadGameProgress = (vehiculoDelDia, modo = null) => {
  if (!vehiculoDelDia) return null;
  
  const hoy = new Date().toISOString().split("T")[0];
  
  // Intentar cargar de localStorage primero, luego de cookies
  const savedData = localStorage.getItem(`gameProgress_${hoy}`) || 
                    Cookies.get(`gameProgress_${hoy}`);
  
  if (!savedData) return null;
  
  try {
    const parsedData = JSON.parse(savedData);
    
    // Verificar que es el mismo vehículo y del día actual
    if (parsedData.vehiculoId !== vehiculoDelDia.id || parsedData.fecha !== hoy) {
      return null;
    }
    
    // Calcular intentos disponibles si es modo difícil
    if (modo === 'dificil') {
      const attemptsUsed = (parsedData.totalAttemptsUsed || 0);
      const remainingAttempts = Math.max(0, 9 - attemptsUsed);
      
      return {
        ...parsedData,
        modo: 'dificil',
        totalAttempts: remainingAttempts
      };
    }
    
    return parsedData;
  } catch (e) {
    console.error("Error parsing saved game progress", e);
    return null;
  }
};

// Resetear progreso diario
export const resetDailyProgress = () => {
  const hoy = new Date().toISOString().split("T")[0];
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const fechaAyer = ayer.toISOString().split("T")[0];
  
  // Eliminar progresos de días anteriores
  Cookies.remove(`gameProgress_${fechaAyer}`);
  localStorage.removeItem(`gameProgress_${fechaAyer}`);
  
  // También podemos limpiar el de hoy si existe (para reinicios manuales)
  Cookies.remove(`gameProgress_${hoy}`);
  localStorage.removeItem(`gameProgress_${hoy}`);
};

// Verificar y resetear si es un nuevo día
export const checkAndResetDailyProgress = () => {
  const hoy = new Date().toISOString().split("T")[0];
  const lastResetDate = Cookies.get('lastResetDate') || localStorage.getItem('lastResetDate');
  
  if (lastResetDate !== hoy) {
    resetDailyProgress();
    Cookies.set('lastResetDate', hoy, { expires: 1 });
    localStorage.setItem('lastResetDate', hoy);
  }
};

// Resetear completamente el progreso del juego actual
export const resetGameProgress = () => {
  const hoy = new Date().toISOString().split("T")[0];
  Cookies.remove(`gameProgress_${hoy}`);
  localStorage.removeItem(`gameProgress_${hoy}`);
};