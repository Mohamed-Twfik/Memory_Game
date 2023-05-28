const express = require('express')
const {Server} = require('socket.io')
const app = express()
const cors = require('cors')
const http = require('http').createServer(app)
const io = new Server(http, {cors: {origin: 'http://localhost:3000'}})
const port = process.env.PORT || 8000
const bodyParser = require('body-parser')
const e = require('express')
const { assert } = require('console')
let rooms = []
let runningRooms = []

http.listen(port, () => {console.log(`Listening at URL http://localhost:${port}`)})

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors())

const endGameEmit = async(roomId)=>{
    let players = await io.in(roomId).fetchSockets()
    let winners = [players[0]]
    for(let i = 1; i < players.length; i++){
        const player = players[i]
        if(player.turns < winners[0].turns && player.finished) winners = [player]
        else if(player.turns == winners[0].turns && player.finished) winners.push(player)
    }
    for(let i = 0; i < winners.length; i++){
        const winner = winners[i]
        io.in(winner.id).emit('winner', {roomId, winner: true})
    }
    io.in(roomId).emit('endGame', {roomId, winners})
}

io.on('connection', (socket)=>{
    // Every socket connection has a unique ID
    console.log('new connection: ' + socket.id)

    socket.on('login', (name) => {
        socket.userName = name
    })

    socket.on('createRoom', async()=>{
        let roomId = Math.floor(Math.random()*100000)+''
        socket.roomId = roomId
        socket.turns = 0
        socket.join(roomId)
        rooms.push(roomId)
        playersInfo = []
        playersInfo.push({userName: socket.userName, userId: socket.id})

        let sockets = await io.in(roomId).fetchSockets()
        socket.emit('joinWaitingRoom', {roomId, playersInfo, playersNumber: sockets.length, roomFull: false, userName: socket.userName, userId: socket.id, owner: true})
    })

    socket.on('joinRoom', async(roomId)=>{
        if(!rooms.includes(roomId)) socket.emit('idWrong', {roomId})

        else if(runningRooms.includes(roomId)) socket.emit('roomBusy', roomId)

        else{
            let players = await io.in(roomId).fetchSockets()
            playersInfo = []
            roomFull = players.length == 6

            if(players.length < 6){
                socket.roomId = roomId
                socket.turns = 0
                socket.join(roomId)
                players.forEach((player)=>{
                    playersInfo.push({userName: player.userName, userId: player.id})
                })
                playersInfo.push({userName: socket.userName, userId: socket.id})
                io.in(roomId).emit('joinWaitingRoom', {roomId, playersInfo, playersNumber: players.length+1, roomFull, userName: socket.userName, userId: socket.id, owner: false})
            }
            else socket.emit('roomBusy', roomId)
        }
    })

    socket.on('startGame', async()=>{
        let roomId = socket.roomId
        let players = await io.in(roomId).fetchSockets()
        playersInfo = []
        console.log(`${roomId} has ${players.length} players and they started playing`)
        players.forEach((player)=>{
            playersInfo.push({userName: player.userName, userId: player.id, turns: 0})
        })
        io.in(roomId).emit('turn', {roomId, playersInfo})
        runningRooms.push(roomId)
    })

    socket.on('turn', async(data)=>{
        let roomId = socket.roomId
        let players = await io.in(roomId).fetchSockets()
        playersInfo = []
        for (let i = 0; i < players.length; i++) {
            const player = players[i]
            if(player.id == socket.id) {
                playersInfo.push({userName: player.userName, userId: player.id, turns: player.turns+1})
                socket.turns++
            }
            else playersInfo.push({userName: player.userName, userId: player.id, turns: player.turns})
        }
        io.in(roomId).emit('turn', {roomId, playersInfo})
    })
    
    let checkFirstPlayerDone = false
    let time = 60000
    socket.on("playerDone", async()=>{
        let roomId = socket.roomId
        socket.finished = true
        socket.emit('finishGame', {turns: socket.turns})
        io.in(roomId).except(socket.id).emit('playerDone', {userName: socket.userName, userId: socket.id})

        let endgame = true
        let players = await io.in(roomId).fetchSockets()
        for (let i = 0; i < players.length; i++) {
            if(!players[i].finished){
                endgame = false
                break
            }
        }
        
        if(endgame) endGameEmit(roomId)

        if(!checkFirstPlayerDone){
            checkFirstPlayerDone = true
            setTimeout(endGameEmit, time, roomId)
        }
    })

    // Disconnected
    socket.on('disconnect', async() => {
        console.log(socket.userName + ' disconnected')
        let roomId = socket.roomId
        io.in(roomId).emit('playerLeft', {roomId: roomId, userName: socket.userName})
        socket.leave(roomId)
        let sockets = await io.in(roomId).fetchSockets()
        if(sockets.length == 0){
            rooms.splice(rooms.indexOf(roomId), 1)
        }
        socket.disconnect()
    })
})
