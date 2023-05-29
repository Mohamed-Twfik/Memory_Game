import { useState, useEffect, useContext } from "react";
import SingleCard from "./components/SingleCard";
import WelcomePage from "./components/WelcomePage";
import CreateGame from "./components/CreateGame";
import WaitingRoom from "./components/WaitingRoom";

import "./App.css";

import { SocketContext } from "./context/SocketContext";
import PlayersData from "./components/PlayersData";
import PlayerDone from "./components/PlayerDone";

const cardImages = [
  { src: "/images/helmet-1.png", matched: false },
  { src: "/images/potion-1.png", matched: false },
  { src: "/images/ring-1.png", matched: false },
  { src: "/images/scroll-1.png", matched: false },
  { src: "/images/shield-1.png", matched: false },
  { src: "/images/sword-1.png", matched: false },
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

 
  const playerDone = () => {
    let result = cards.filter((card) => card.matched);
    if (result.length === cards.length) {
      socket.emit("playerDone");
      return true;
    } else {
      return false;
    }
  };
 
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
        <div className="app">
          <h1 className="gameName">Magic Game</h1>
          <p>finish with least number of turns and as fast as possible</p>
          {/* <button className='startBtn' onClick={()=>{shuffleCards();setShowCards(true);setTimeout(()=>setShowCards(false),2000)}}>start new game</button> */}
          <div className="cards">
            {playerDone() && <PlayerDone />}
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
          <PlayersData gameData={gameData} />
        </div>
      )}
    </div>
  );
}

export default App;
