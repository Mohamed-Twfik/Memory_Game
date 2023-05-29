import React, { useState, useContext, useEffect } from "react";
import { SocketContext } from "../context/SocketContext";
import "./CreateGame.css";

export default function CreateGame({
  setGameState,
  setOwner,
  setUserName,
  setRoomId,
  roomId,
  setRoomUsers,
}) {
  const [toggleRoomId, setToggleRoomId] = useState(false);

  const socket = useContext(SocketContext);

  const [error, setError] = useState("");

  function createRoom() {
    socket.emit("createRoom");
  }

  function joinRoom() {
    if (roomId === "") {
      setError("Please enter room id");
      return;
    }
    socket.emit("joinRoom", roomId);
  }

  useEffect(() => {
    socket.on("joinWaitingRoom", (data) => {
      if (socket.id === data.userId) {
        setOwner(data.owner);
        setRoomId(data.roomId);
        setUserName(data.userName);
      }

      setRoomUsers(data.playersInfo);
      setGameState("waitingRoom");
    });

    socket.on("idWrong", (data) => {
      console.log(data);
    });

    socket.on("login", (data) => {
      console.log(data);
    });
  }, [socket, setGameState]);

  return (
    <div>
      <h1>Welcome to Memory Game</h1>
      <button
        className="startBtn createGameBtn"
        onClick={() => {
          setToggleRoomId((prev) => !prev);
        }}
      >
        {toggleRoomId ? "Cancel" : "Join game"}
      </button>
      {toggleRoomId && (
        <>
          <input
            type="text"
            className="roomId"
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room id"
          />
          <button className="startBtn" onClick={() => joinRoom()}>
            {" "}
            join{" "}
          </button>
        </>
      )}

      {!toggleRoomId && (
        <button className="startBtn createGameBtn" onClick={() => createRoom()}>
          Create game
        </button>
      )}
    </div>
  );
}
