import React, { useEffect , useContext , useState } from 'react'
import { SocketContext } from '../context/SocketContext';
export default function PlayerDone({winner, endGameData}) {
    // const [endGameData,setEndGameData] = useState({});
    // const [winner, setWinner] = useState(false)

    // const socket = useContext(SocketContext);
    // useEffect(() => {
    //     socket.on("endGame", (data) => {
    //       console.log(data)
    //       setEndGameData(data);
    //       if(socket.id == data.winner.id){
    //         setWinner(true)
    //       }
    //     })
    // }, [socket])
    // console.log(endGameData)
  return (
    <div>
      <h3 className="winner">{(winner)?`Congratulations ${endGameData.winner.userName} you win the game with ${endGameData.winner.turns} turns`:`We are sorry you lost. The wanner is ${endGameData.winner.userName} won with ${endGameData.winner.turns} turns`}</h3>
    </div>
  )
}
