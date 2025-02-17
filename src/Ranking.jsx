import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs,orderBy } from "firebase/firestore";
import { db } from "./services/firebase";

const obtenerRankingDiario = async () => {
  const hoy = new Date();
  const fecha = hoy.toISOString().split("T")[0]; // Formato YYYY-MM-DD

  const q = query(
    collection(db, "ranking"),
    where("fecha", "==", fecha) // Filtrar por la fecha actual
  );

  const querySnapshot = await getDocs(q);
  const ranking = querySnapshot.docs.map((doc) => doc.data());

  // Ordenar el ranking por tiempoTotal y fallosTotales
  ranking.sort((a, b) => {
    if (a.tiempoTotal === b.tiempoTotal) {
      return a.fallosTotales - b.fallosTotales;
    }
    return a.tiempoTotal - b.tiempoTotal;
  });

  return ranking;
};

const Ranking = ({ userId }) => {
  const [ranking, setRanking] = useState([]);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    // Consulta Firestore para obtener los mejores jugadores en tiempo real
    const rankingRef = collection(db, "ranking");
    const q = query(rankingRef, orderBy("score", "asc"), orderBy("time", "asc"), limit(10));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rankingList = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        position: index + 1,
      }));
      setRanking(rankingList);

      // Encuentra la posición del usuario actual en el ranking
      const userEntry = rankingList.find((entry) => entry.id === userId);
      setUserRank(userEntry ? userEntry.position : null);
    });

    return () => unsubscribe(); // Detener la escucha cuando el componente se desmonte
  }, [userId]);

  return (
    <div className="ranking">
      <h3>Ranking Diario</h3>
      <ul>
        {ranking.map((item, index) => (
          <li key={index}>
            {index + 1}. {item.nickname} - {item.fallosTotales} fallos - {item.tiempoTotal}s
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Ranking;