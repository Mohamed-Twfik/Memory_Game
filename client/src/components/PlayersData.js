import React from "react";
import "./PlayersData.css";
export default function PlayersData({ gameData }) {
  return (
    <table className="playerTable">
      <thead>
        <tr>
          <th>Player</th>
          <th>Number of Turns</th>
        </tr>
      </thead>
      <tbody>
        {gameData.playersInfo.map((player) => (
          <tr key={player.userId}>
            <td>{player.userName}</td>
            <td>{player.turns}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
