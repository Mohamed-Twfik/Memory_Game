const express = require('express')
const {Server} = require('socket.io')
const app = express()
const http = require('http').createServer(app)
const io = new Server(http)
const port = process.env.PORT || 3000
let rooms = []

http.listen(port, () => {console.log(`Listening at URL http://localhost:${port}`)})

app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.post('/', (req, res)=>{
    let username = req.body.name
})
