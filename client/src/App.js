import { useState, useEffect, useContext } from "react";
import SingleCard from "./components/SingleCard";
import WelcomePage from "./components/WelcomePage";
import CreateGame from "./components/CreateGame";
import WaitingRoom from "./components/WaitingRoom";

import { SocketContext } from "./context/SocketContext";
import PlayersData from "./components/PlayersData";

const cardImages = [
  { src: "/images/moon.jpg", matched: false },
  { src: "/images/sun.jpg", matched: false },
  { src: "/images/cofee.jpg", matched: false },
  { src: "/images/flower.jpg", matched: false },
  { src: "/images/plate.jpg", matched: false },
  { src: "/images/lion.jpg", matched: false },
  { src: "/images/road.jpg", matched: false },
  { src: "/images/car.jpg", matched: false },
];

function App() {
  const socket = useContext(SocketContext);
  
  const [cards, setCards] = useState([]);

  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);

  const [disabled, setDisabled] = useState(false);
  const [showCards, setShowCards] = useState(true);
  const [gameState, setGameState] = useState("");
  const [userName, setUserName] = useState("");
  const [owner, setOwner] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [gameData, setGameData] = useState({});
  const [roomUsers, setRoomUsers] = useState([]);
  const [endGameData,setEndGameData] = useState(null);
  const [turns,setTurns] = useState(0);

  useEffect(() => {
    
    if (choiceOne && choiceTwo) {
      setDisabled(true);
      if (choiceOne.src === choiceTwo.src) {
        setCards((prevCards) => {
          return prevCards.map((card) => {
            if (card.src === choiceOne.src) {
              return { ...card, matched: true };
            } else {
              return card;
            }
          });
        });
        resetTurn();
      } else {
        setTimeout(() => resetTurn(), 1000);
      }
    }
  }, [choiceOne, choiceTwo, gameState]);

  const shuffleCards = () => {
    const shuffledCards = [...cardImages, ...cardImages]
      .sort(() => Math.random() - 0.5)
      .map((card) => ({ ...card, id: Math.random() }));

    setChoiceOne(null);
    setChoiceTwo(null);
    setCards(shuffledCards);

  };

  const handleChoice = (card) => {
    choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
  };

  const resetTurn = () => {
    setChoiceOne(null);
    setChoiceTwo(null);
    
    socket.emit("turn",gameData);

    setDisabled(false);
  };

  useEffect(() => {
    setTimeout(() => setShowCards(false), 2000);
    shuffleCards();
  }, []);

  useEffect(() => {
    socket?.on("finishGame", (data) => {
      setTurns(data.turns);
    })

    socket?.on("endGame", (data) => {
      setEndGameData(data);
    })

  }, [socket, userName])

  const playerDone = () => {
    let result = cards.filter((card) => card.matched);
    if (result.length === cards.length) {
      socket.emit("playerDone");
      return true;
    } else {
      return false;
    }
  };

  const leaveGame = () => {
    socket.emit("leaveGame");
    setGameState("createRoom");
  }

  const winnerMessage = () => {
    if(userName === endGameData?.winner?.userName) {
      return  <h1 className="winner">you won the game in {endGameData?.winner?.turns} turns</h1>
    }
    else {
      return <h1 className="winner">{endGameData?.winner?.userName} won the game in {endGameData?.winner?.turns} turns</h1>
    }
  }

  return (
    <div className="app">
      {gameState === "" ? (
        <WelcomePage setGameState={setGameState} />
      ) : gameState === "createRoom" ? (
        <CreateGame
          setGameState={setGameState}
          setOwner={setOwner}
          setRoomId={setRoomId}
          setUserName={setUserName}
          roomId={roomId}
          setRoomUsers={setRoomUsers}
        />
      ) : gameState === "waitingRoom" ? (
        <WaitingRoom
          setGameState={setGameState}
          owner={owner}
          roomId={roomId}
          userName={userName}
          roomUsers={roomUsers}
          setGameData={setGameData}
        />
      ) : (
        <div className="app container">
          <h1 className="">Play Started...</h1>
          <p>Finish with least number of turns and as fast as possible</p>
          <div className="cards">

            {(playerDone() && !endGameData && turns) && <h3 className="winner">Please wait for other players. You finish the game in {turns} turns</h3>}

            {endGameData && winnerMessage()}

            {cards.map((card) => (
              <SingleCard
                key={card.id}
                card={card}
                handleChoice={handleChoice}
                flipped={
                  card === choiceOne ||
                  card === choiceTwo ||
                  card.matched ||
                  showCards
                }
                disabled={disabled}
              />
            ))}
          </div>
          <PlayersData 
            gameData={gameData}
            setGameData={setGameData}
            roomId={roomId}
          />
          <button className="startBtn leave" onClick={()=>leaveGame()}>
            Leave Game
          </button>
          <button className="startBtn logout">
            <a href="/">Logout</a>
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
