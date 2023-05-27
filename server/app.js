const express = require('express')
const {Server} = require('socket.io')
const app = express()
const cors = require('cors')
const http = require('http').createServer(app)
const io = new Server(http, {cors: {origin: 'http://localhost:3000'}})
const port = process.env.PORT || 8000
let rooms = []

http.listen(port, () => {console.log(`Listening at URL http://localhost:${port}`)})

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors())

app.post('/', (req, res)=>{
    let username = req.body.name

    if(username) res.status(200).json({username})
    else res.status(400).json({error: 'No username'})

    io.on('connection', (socket)=>{
        socket.username = username
        console.log(socket.username + ' connected')
        socket.emit('login', {username: socket.username})

        socket.on('createGame', ()=>{
            let roomId = Math.floor(Math.random()*100000)+''
            socket.roomId = roomId
            socket.turns = 0
            socket.join(roomId)
            rooms.push(roomId)
            socket.emit('joinWaitingRoom', {roomId, roomFull: false, username: socket.username, userId: socket.id, owner: true})
        })

        socket.on('joinGame', async(roomId)=>{
            if(rooms.includes(roomId)){
                let sockets = await io.in(roomId).fetchSockets()
                roomFull = sockets.length >= 2
                if(sockets.length < 6){
                    socket.roomId = roomId
                    socket.turns = 0
                    socket.join(roomId)
                    socket.emit('joinWaitingRoom', {roomId, roomFull, username: socket.username, userId: socket.id, owner: false})
                }else{
                    socket.emit('roomFull', roomId)
                }
            }else{
                socket.emit('idWrong', {roomId})
            }
        })

        socket.on('startGame', async()=>{
            let roomId = socket.roomId
            let players = await io.in(roomId).fetchSockets()
            playersInfo = []
            console.log(`${roomId} has ${players.length} players and started the game`)
            players.forEach((player)=>{
                playersInfo.push({username: player.username, userId: player.id, turns: 0})
            })
            io.in(roomId).emit('startGame', {roomId, playersInfo})
        })

        socket.on('turn', async(data)=>{
            let roomId = socket.roomId
            let players = await io.in(roomId).fetchSockets()
            let player = players.find((player)=>{return player.id == data.userId})
            player.turns++
            socket.turns++
            io.in(roomId).emit('turn', {roomId, data})
        })

    })
})
