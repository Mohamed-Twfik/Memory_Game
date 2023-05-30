import React, { useEffect , useContext , useState } from 'react'
import { SocketContext } from '../context/SocketContext';
export default function PlayerDone({turns}) {
    // const [turns,setTurns] = useState(0);

    // const socket = useContext(SocketContext);
    // useEffect(() => {
    //     socket.on("finishGame", (data) => {
    //         setTurns(data.turns);
    //     })
    // }, [socket])
  return (
    <div>
      <h3 className="winner">Please wait for other players. You finish the game in {turns} turns</h3>
    </div>
  )
}
