import React, { useEffect } from "react";
import "./PlayersData.css";
import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";
// import  from "react";
export default function PlayersData({ gameData, setGameData, roomId }) {
  const socket = useContext(SocketContext);

  useEffect(() => {
    socket.on("playerDone", (data) => {
      for (let i = 0; i < gameData.playersInfo.length; i++) {
        if (gameData.playersInfo[i].userId === data.userId) {
          gameData.playersInfo[i] = data;
          break;
        }
      }
      setGameData({ roomId: roomId, playersInfo: gameData.playersInfo });
    })
  }, [socket, roomId, gameData])

  return (
    <table className="playerTable">
      <thead>
        <tr>
          <th>Player</th>
          <th>Number of Turns</th>
          <th>Done</th>
        </tr>
      </thead>
      <tbody>
        {gameData.playersInfo.map((player) => (
          <tr className={player.done?"finishGame":""} key={player.userId}>
            <td>{player.userName}</td>
            <td>{player.turns}</td>
            <td>{player.done?"Done":"Still playing.."}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
