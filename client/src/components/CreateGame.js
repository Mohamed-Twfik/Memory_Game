import React, { useState, useContext, useEffect } from "react";
import { SocketContext } from "../context/SocketContext";

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
      alert("Sorry " + data.roomId + " is not a valid room id..!");
    });

    socket.on("roomBusy", (data) => {
      alert("Sorry Room: " + data.roomId + " is full or already starting play..!");
    });
    
  }, [socket, setGameState]);

  return (
    <div className="container">
      <h1>Welcome to Similar Cards Game</h1>
      <button
        className={toggleRoomId ? "startBtn cancel" : "startBtn createGameBtn"}
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
      <button className="startBtn logout">
        <a href="/">Logout</a>
      </button>
    </div>
  );
}
