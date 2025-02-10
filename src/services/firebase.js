import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export { collection, doc, getDoc, setDoc, getDocs, query, updateDoc, deleteDoc, addDoc, where, onSnapshot } from "firebase/firestore";

export { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup,
    sendPasswordResetEmail, fetchSignInMethodsForEmail, sendEmailVerification 
} from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_PROJECT_ID + '.firebaseapp.com',
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_PROJECT_ID + ".appspot.com",
};

const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore();
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);

setPersistence(auth, browserLocalPersistence);


// Obtener el número de la semana en el mes (1 a 4)
export const getSemanaDelMes = (fecha) => {
    const primerDiaMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    const diferenciaDias = Math.floor((fecha - primerDiaMes) / (1000 * 60 * 60 * 24));
    return Math.floor(diferenciaDias / 7) + 1;
  };
  
  // Obtener el mes y el año actual
  export const getMesYAnoActual = () => {
    const fecha = new Date();
    return {
      mes: fecha.getMonth() + 1, // Los meses van de 1 a 12
      año: fecha.getFullYear(),
    };
  };
  
  // Obtener el ranking mensual
  export const obtenerRankingMensual = async (mes, año) => {
    const q = query(
      collection(db, "ranking"),
      where("mes", "==", mes),
      where("año", "==", año)
    );
    const querySnapshot = await getDocs(q);
    const partidas = querySnapshot.docs.map((doc) => doc.data());
  
    // Agrupar por usuario y contar días jugados
    const usuarios = partidas.reduce((acc, partida) => {
      if (!acc[partida.userId]) {
        acc[partida.userId] = {
          nickname: partida.nickname,
          tiempoTotal: 0,
          fallosTotales: 0,
          diasJugados: new Set(), // Usamos un Set para contar días únicos
        };
      }
      acc[partida.userId].tiempoTotal += partida.tiempo;
      acc[partida.userId].fallosTotales += partida.intentosFallidos;
      acc[partida.userId].diasJugados.add(partida.fecha);
      return acc;
    }, {});
  
    // Convertir a array y ordenar
    const rankingArray = Object.values(usuarios).map((usuario) => ({
      ...usuario,
      diasJugados: usuario.diasJugados.size, // Número de días únicos jugados
    }));
  
    // Ordenar por días jugados, tiempo y fallos
    rankingArray.sort((a, b) => {
      if (a.diasJugados === b.diasJugados) {
        if (a.tiempoTotal === b.tiempoTotal) {
          return a.fallosTotales - b.fallosTotales;
        }
        return a.tiempoTotal - b.tiempoTotal;
      }
      return b.diasJugados - a.diasJugados; // Más días jugados primero
    });
  
    return rankingArray;
  };
  
  // Obtener el ranking semanal
  export const obtenerRankingSemanal = async (semana, mes, año) => {
    const q = query(
      collection(db, "ranking"),
      where("semana", "==", semana),
      where("mes", "==", mes),
      where("año", "==", año)
    );
    const querySnapshot = await getDocs(q);
    const partidas = querySnapshot.docs.map((doc) => doc.data());
  
    // Agrupar por usuario y contar días jugados
    const usuarios = partidas.reduce((acc, partida) => {
      if (!acc[partida.userId]) {
        acc[partida.userId] = {
          nickname: partida.nickname,
          tiempoTotal: 0,
          fallosTotales: 0,
          diasJugados: new Set(), // Usamos un Set para contar días únicos
        };
      }
      acc[partida.userId].tiempoTotal += partida.tiempo;
      acc[partida.userId].fallosTotales += partida.intentosFallidos;
      acc[partida.userId].diasJugados.add(partida.fecha);
      return acc;
    }, {});
  
    // Convertir a array y ordenar
    const rankingArray = Object.values(usuarios).map((usuario) => ({
      ...usuario,
      diasJugados: usuario.diasJugados.size, // Número de días únicos jugados
    }));
  
    // Ordenar por días jugados, tiempo y fallos
    rankingArray.sort((a, b) => {
      if (a.diasJugados === b.diasJugados) {
        if (a.tiempoTotal === b.tiempoTotal) {
          return a.fallosTotales - b.fallosTotales;
        }
        return a.tiempoTotal - b.tiempoTotal;
      }
      return b.diasJugados - a.diasJugados; // Más días jugados primero
    });
  
    return rankingArray;
  };