import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
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

const Ranking = () => {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const fetchRanking = async () => {
      const rankingData = await obtenerRankingDiario();
      setRanking(rankingData);
    };

    fetchRanking();
  }, []);

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