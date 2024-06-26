# Real-Time Memory Game Backend API

This is the backend API for a real-time memory game that allows multiple players to play in the same room. It's built using Node.js, Express.js, and Socket.io to create a WebSocket server that handles game logic and communication between clients.

## Features

- Allows multiple players to play the memory game simultaneously in the same room.
- Implements game rules such as matching similar cards, scoring points, and ending the game.
- Tested and debugged with the frontend developer during the development process.
- Deployed on the Render platform for production use.

## Setup

1. Clone the repository:

```bash
git clone https://github.com/Mohamed-Twfik/Memory_Game.git
```

2. Install dependencies:

```bash
cd Memory_Game/server
npm install
```

3. Configure environment variables:
   
   - Create a `.env` file in the root directory.
   - Define the following variables:
     ```
     PORT=3000
     ```

4. Start the server:

```bash
npm start
```

## Usage

### Socket.io Events

#### `createRoom`

- **Description**: Create a game room.
- **Parameters**: None
- **Usage**: 
  ```javascript
  socket.emit('createRoom');
  ```

#### `joinRoom`

- **Description**: Join a game room.
- **Parameters**: 
  - `roomId` (string): ID of the game room to join.
- **Usage**: 
  ```javascript
  socket.emit('joinRoom', { roomId: 'room1' });
  ```

#### `leaveGame`

- **Description**: Leave the current game room.
- **Parameters**: None
- **Usage**: 
  ```javascript
  socket.emit('leaveGame');
  ```

#### `turn`

- **Description**: Flip a card in the game.
- **Parameters**: 
  - `roomId` (string): ID of the game room.
  - `cardId` (string): ID of the card to flip.
- **Usage**: 
  ```javascript
  socket.emit('turn', { roomId: 'room1', cardId: 'card1' });
  ```

#### `startGame`

- **Description**: Start the game in the current room.
- **Parameters**: None
- **Usage**: 
  ```javascript
  socket.emit('startGame');
  ```

#### `playerDone`

- **Description**: Player done his turn.
- **Parameters**: None
- **Usage**: 
  ```javascript
  socket.emit('playerDone');
  ```

### Example Usage

```javascript
// Example client-side code using Socket.io

const socket = io('http://localhost:3000');

// Join a game room
socket.emit('join', { roomId: 'room1' });

// Handle incoming events
socket.on('roomBusy', (roomId) => {
  console.log(`Room ${roomId} is busy..!`);
});

// Flip a card
socket.emit('turn', { roomId: 'room1', cardId: 'card1' });
```

## Deployment

This API is deployed on the Render platform. Ensure that environment variables are configured appropriately for the production environment.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/new-feature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Create a new Pull Request.
<!-- 
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. -->