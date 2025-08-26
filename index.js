const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path'); // Agregar esta línea

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = http.createServer(app);
const io = socketIO(server);

// Ruta para API de datos
app.post('/api/datos', (req, res) => {
    const dato = req.body;
    io.emit('nuevo_dato', dato);
    res.sendStatus(200);
});

server.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));