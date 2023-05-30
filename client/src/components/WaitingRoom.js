import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";
import "./WaitingRoom.css";
export default function WaitingRoom({
  userName,
  owner,
  roomId,
  setGameState,
  roomUsers,
  setGameData,
}) {
  const socket = useContext(SocketContext);
  const [playerLeft, setPlayerLeft] = useState(null);


  useEffect(() => {
    socket.on("turn", (data) => {
      setGameData(data);
      setGameState("game");
    });
    
    socket.on('playerLeft', (data) => {
      setPlayerLeft(data);
      roomUsers.splice(roomUsers.indexOf(playerLeft),1);
    })
  }, [socket, setGameData, setGameState, roomUsers]);

  function startGame() {
    socket.emit("startGame");
  }

  const leaveGame = () => {
    socket.emit("leaveGame");
    setGameState("createRoom");
  }

  return (
    <div>
      <h1>Waiting Room</h1>
      <h1>welcome {userName} </h1>
      <h3>invitation id: <strong>{roomId}</strong></h3>

      <ul className="waitingListContainer">
        {roomUsers.map((user) => (
          <li key={user.userId} className="playerCard">
            {user.userName} joined
          </li>
        ))}
      </ul>
      {owner && roomUsers.length > 1 && (
        <button className="startBtn waiting" onClick={() => startGame()}>
          Start game
        </button>
      )}
      <button className="startBtn waiting" onClick={()=>leaveGame()}>
        Leave Game
      </button>
      <button className="startBtn waiting">
        <a href="/">Logout</a>
      </button>
    </div>
  );
}
