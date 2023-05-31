import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";

export default function PlayersData({ gameData, setGameData, roomId }) {
  const socket = useContext(SocketContext);
  const [playerLeft, setPlayerLeft] = useState(null);

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

    socket.on('playerLeft', (data) => {
      setPlayerLeft(data);
    })
  }, [socket, roomId, gameData])

  const playerStatus = (player)=>{
    if(player.userId == playerLeft?.userId){
      return(
        <td>Player Left</td>
      )
    }else if(player.done){
      return(
        <td>Done</td>
      )
    }else{
      return(
        <td>Still playing..</td>
      )
    }
  }

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
            {playerStatus(player)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
