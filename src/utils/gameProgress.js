import Cookies from "js-cookie";

// Guardar progreso del juego 
export const saveGameProgress = (vehiculoDelDia, progressData) => {
  if (!vehiculoDelDia) return;
  
  const hoy = new Date().toISOString().split("T")[0];
  
  // Calcular intentos usados sumando todos los fallos
  const totalFallos = 
    (progressData.intentosFallidos?.marca?.length || 0) +
    (progressData.intentosFallidos?.modelo?.length || 0) +
    (progressData.intentosFallidos?.anoFabricacion?.length || 0);
  
  const progress = {
    fecha: hoy,
    vehiculoId: vehiculoDelDia.id,
    modo: progressData.modo || 'normal',
    ...progressData,
    step: progressData.step || 1,
    errorCount: totalFallos,
    totalAttemptsUsed: totalFallos,
    intentosFallidos: progressData.intentosFallidos || {
      marca: [],
      modelo: [],
      anoFabricacion: []
    }
  };
  
  // Guardar en cookies y localStorage
  Cookies.set(`gameProgress_${hoy}`, JSON.stringify(progress), { expires: 1 });
  localStorage.setItem(`gameProgress_${hoy}`, JSON.stringify(progress));
  
  // Guardar total de intentos usados (compartido entre modos)
  const totalAttemptsKey = `totalAttemptsUsed_${hoy}`;
  Cookies.set(totalAttemptsKey, totalFallos, { expires: 1 });
  localStorage.setItem(totalAttemptsKey, totalFallos.toString());
};

// Cargar progreso del juego
export const loadGameProgress = (vehiculoDelDia, modo = null) => {
  if (!vehiculoDelDia) return null;
  
  const hoy = new Date().toISOString().split("T")[0];
  
  // Cargar total de intentos usados (compartido)
  const totalAttemptsKey = `totalAttemptsUsed_${hoy}`;
  const totalAttemptsUsed = parseInt(
    localStorage.getItem(totalAttemptsKey) || 
    Cookies.get(totalAttemptsKey) || 
    '0'
  );
  
  // Cargar datos específicos del modo
  const savedData = localStorage.getItem(`gameProgress_${hoy}`) ||
                   Cookies.get(`gameProgress_${hoy}`);
  
  if (!savedData) {
    return {
      fecha: hoy,
      vehiculoId: vehiculoDelDia.id,
      modo: modo || 'normal',
      step: 1,
      errorCount: 0,
      totalAttemptsUsed: totalAttemptsUsed,
      intentosFallidos: {
        marca: [],
        modelo: [],
        anoFabricacion: []
      },
      ...(modo === 'dificil' && {
        totalAttempts: Math.max(0, 9 - totalAttemptsUsed)
      })
    };
  }
  
  try {
    const parsedData = JSON.parse(savedData);
    
    // Verificar que es el mismo vehículo
    if (parsedData.vehiculoId !== vehiculoDelDia.id || parsedData.fecha !== hoy) {
      return null;
    }
    
    // Combinar con el total actualizado de intentos
    const combinedData = {
      ...parsedData,
      totalAttemptsUsed: Math.max(totalAttemptsUsed, parsedData.totalAttemptsUsed || 0),
      intentosFallidos: parsedData.intentosFallidos || {
        marca: [],
        modelo: [],
        anoFabricacion: []
      }
    };
    
    // Calcular intentos restantes para modo difícil
    if (modo === 'dificil') {
      combinedData.totalAttempts = Math.max(0, 9 - combinedData.totalAttemptsUsed);
      combinedData.modo = 'dificil';
    }
    
    return combinedData;
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
  
  // Eliminar progresos anteriores
  [fechaAyer, hoy].forEach(fecha => {
    Cookies.remove(`gameProgress_${fecha}`);
    localStorage.removeItem(`gameProgress_${fecha}`);
    Cookies.remove(`totalAttemptsUsed_${fecha}`);
    localStorage.removeItem(`totalAttemptsUsed_${fecha}`);
  });
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

// Resetear progreso actual
export const resetGameProgress = () => {
  const hoy = new Date().toISOString().split("T")[0];
  Cookies.remove(`gameProgress_${hoy}`);
  localStorage.removeItem(`gameProgress_${hoy}`);
  Cookies.remove(`totalAttemptsUsed_${hoy}`);
  localStorage.removeItem(`totalAttemptsUsed_${hoy}`);
};