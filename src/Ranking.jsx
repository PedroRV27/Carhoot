import React, { useEffect, useState } from "react";
import { obtenerRankingMensual, obtenerRankingSemanal } from "./services/firebase";

const Ranking = ({ tipoRanking, semana, mes, año }) => {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const fetchRanking = async () => {
      let rankingData;
      if (tipoRanking === "mensual") {
        rankingData = await obtenerRankingMensual(mes, año);
      } else if (tipoRanking === "semanal") {
        rankingData = await obtenerRankingSemanal(semana, mes, año);
      }
      setRanking(rankingData);
    };

    fetchRanking();
  }, [tipoRanking, semana, mes, año]);

  return (
    <div className="ranking">
      <h3>
        {tipoRanking === "mensual" ? "Top Mensual" : `Top Semana ${semana}`}
      </h3>
      <ul>
        {ranking.map((item, index) => (
          <li key={index}>
            {index + 1}. {item.nickname} - {item.tiempoTotal}s - {item.fallosTotales} fallos - {item.diasJugados} días
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Ranking;