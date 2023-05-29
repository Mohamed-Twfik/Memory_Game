import React,{ useState,useContext} from 'react'
import { SocketContext } from '../context/SocketContext'

import './WelcomePage.css'

export default function WelcomePage({setGameState}) {
  const [name,setName] = useState('')
  const [error,setError] = useState("")
  
  const socket = useContext(SocketContext)

  
  async function enterUserName(){
    if(name===''){
      setError('Please enter your name')
      return
    }
    socket.emit('login',name)
    setError('')
    setGameState("createRoom")

  }


  return (
    <div>
      <h1>Welcome to Memory Game</h1>
      {error && <h3 className='error'>{error}</h3>}
      <input className='inputName' type='text' placeholder='Enter your name' onChange={(e)=>setName(e.target.value)} />
      <button className='startBtn' onClick={()=>enterUserName()} >Start Game</button>
    </div>
  )
}
