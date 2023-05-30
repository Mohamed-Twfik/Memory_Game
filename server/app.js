const express = require('express')
const {Server} = require('socket.io')
const app = express()
const cors = require('cors')
const http = require('http').createServer(app)
const io = new Server(http, {cors: {origin: '*'}})
const port = process.env.PORT || 8000
const bodyParser = require('body-parser')
let rooms = []
let runningRooms = []
let playersEndedGame = {}
let endgame = {}

http.listen(port, () => {console.log(`Listening at URL http://localhost:${port}`)})

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors())

const endGameEmit = async(roomId, playersEndedGame)=>{
    let winner = playersEndedGame[0]
    for(let i = 1; i < playersEndedGame.length; i++){
        const player = playersEndedGame[i]
        if(player.turns < winner.turns) winner = player
    }
    winnerUser = {userName: winner.userName, id: winner.id, turns: winner.turns}
    io.in(roomId).emit('endGame', {roomId, winner:winnerUser})
}

io.on('connection', (socket)=>{

    console.log('new connection: ' + socket.id)

    socket.on('login', (name) => {
        socket.userName = name
    })

    socket.on('createRoom', async()=>{
        let roomId = '' + Math.floor(Math.random()*100000)
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

        else if(runningRooms.includes(roomId)) socket.emit('roomBusy', {roomId})

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
                playersInfo.push({userName: player.userName, userId: player.id, turns: player.turns+1, done: false})
                socket.turns++
            }
            else playersInfo.push({userName: player.userName, userId: player.id, turns: player.turns, done: false})
        }
        io.in(roomId).emit('turn', {roomId, playersInfo})
    })
    
    let time = 60000
    socket.on("playerDone", async()=>{
        let roomId = socket.roomId
        let checkFirstPlayerDone = false
        socket.finished = true
        playersEndedGame[roomId] = playersEndedGame[roomId] || []
        playersEndedGame[roomId].push({userId: socket.id, userName: socket.userName, turns: socket.turns})
        socket.emit('finishGame', {userName: socket.userName, userId: socket.id, turns: socket.turns, done: true})
        io.in(roomId).emit('playerDone', {userName: socket.userName, userId: socket.id, turns: socket.turns, done: true})

        endgame[roomId] = endgame[roomId] || true
        let players = await io.in(roomId).fetchSockets()
        for (let i = 0; i < players.length; i++) {
            if(!players[i].finished){
                endgame[roomId] = false
                break
            }
        }

        if(endgame[roomId]) {
            endGameEmit(roomId, playersEndedGame[roomId])
        }

        if(!checkFirstPlayerDone){
            checkFirstPlayerDone = true
            io.in(roomId).emit('startTimerToEnd')
            setTimeout(endGameEmit, time, roomId, playersEndedGame[roomId])
        }
    })

    socket.on('leaveGame', async()=>{
        let roomId = socket.roomId
        socket.leave(roomId)
        let players = await io.in(roomId).fetchSockets()
        if(players.length == 0) rooms.splice(rooms.indexOf(roomId), 1)
        else io.in(roomId).emit('playerLeft', {userName: socket.userName, userId: socket.id})
        socket.roomId = null
        socket.turns = 0
        socket.finished = false
    })

    // Disconnected
    socket.on('disconnect', async() => {
        console.log(socket.id + ' disconnected')
        socket.disconnect()
    })
})
