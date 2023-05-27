const express = require('express')
const {Server} = require('socket.io')
const app = express()
const cors = require('cors')
const http = require('http').createServer(app)
const io = new Server(http, {cors: {origin: 'http://localhost:3000'}})
const port = process.env.PORT || 8000
const bodyParser = require('body-parser')
let rooms = []
let runningRooms = []

http.listen(port, () => {console.log(`Listening at URL http://localhost:${port}`)})

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors())

app.post('/', (req, res)=>{
    let username = req.body.name

    if(!username) return res.status(400).json({error: 'No username'})
    
    res.status(200).json({username})

    io.on('connection', (socket)=>{
        socket.username = username
        console.log(socket.username + ' connected')
        socket.emit('login', {username: socket.username})

        socket.on('createRoom', ()=>{
            let roomId = Math.floor(Math.random()*100000)+''
            socket.roomId = roomId
            socket.turns = 0
            socket.join(roomId)
            rooms.push(roomId)
            socket.emit('joinWaitingRoom', {roomId, roomFull: false, username: socket.username, userId: socket.id, owner: true})
        })

        socket.on('joinRoom', async(roomId)=>{
            if(!rooms.includes(roomId)) socket.emit('idWrong', {roomId})

            else if(runningRooms.includes(roomId)) socket.emit('roomStartRunning', roomId)

            else{
                let sockets = await io.in(roomId).fetchSockets()
                roomFull = sockets.length >= 2

                if(sockets.length < 6){
                    socket.roomId = roomId
                    socket.turns = 0
                    socket.join(roomId)
                    socket.emit('joinWaitingRoom', {roomId, playersNumber: sockets.length, roomFull, username: socket.username, userId: socket.id, owner: false})
                }
                else socket.emit('roomFull', roomId)
            }
        })

        socket.on('startGame', async()=>{
            let roomId = socket.roomId
            let players = await io.in(roomId).fetchSockets()
            playersInfo = []
            console.log(`${roomId} has ${players.length} players and they started playing`)
            players.forEach((player)=>{
                playersInfo.push({username: player.username, userId: player.id, turns: 0})
            })
            io.in(roomId).emit('turn', {roomId, playersInfo})
            runningRooms.push(roomId)
        })

        socket.on('turn', async(data)=>{
            let roomId = socket.roomId
            let players = await io.in(roomId).fetchSockets()
            playersInfo = []
            // let player = players.find((player)=>{return player.id == data.userId})
            // player.turns++
            players.forEach((player)=>{
                if(player.id == data.userId) {
                    playersInfo.push({username: player.username, userId: player.id, turns: player.turns+1})
                    socket.turns++
                }
                else playersInfo.push({username: player.username, userId: player.id, turns: player.turns})
            })
            io.in(roomId).emit('turn', {roomId, playersInfo})
        })

        // socket.on('endGame', async()=>{
        //     let roomId = socket.roomId
        //     let players = await io.in(roomId).fetchSockets()
        //     playersInfo = []
        //     players.forEach((player)=>{
        //         playersInfo.push({username: player.username, userId: player.id, turns: player.turns})
        //     })
        //     io.in(roomId).emit('endGame', {roomId, playersInfo})
        //     socket.leave(roomId)
        //     delete socket.roomId
        //     delete socket.turns
        //     let sockets = await io.in(roomId).fetchSockets()
        //     if(sockets.length == 0){
        //         rooms.splice(rooms.indexOf(roomId), 1)
        //         runningRooms.splice(runningRooms.indexOf(roomId), 1)
        //     }
        // })

        socket.on('leaveGame', async()=>{
            let roomId = socket.roomId
            io.in(roomId).emit('playerLeft', {roomId, username: socket.username})
            socket.leave(roomId)
            delete socket.roomId
            delete socket.turns
            let sockets = await io.in(roomId).fetchSockets()
            if(sockets.length == 0){
                rooms.splice(rooms.indexOf(roomId), 1)
            }
        })

        // Disconnected
        socket.on('logout', async() => {
            console.log(socket.username + ' disconnected')
            let roomId = socket.roomId
            io.in(roomId).emit('playerLeft', {roomId: roomId, username: socket.username})
            socket.leave(roomId)
            let sockets = await io.in(roomId).fetchSockets()
            if(sockets.length == 0){
                rooms.splice(rooms.indexOf(roomId), 1)
            }
            socket.disconnect()
        })

    })
})
