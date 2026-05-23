const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let diosSocketId = null;

io.on('connection', (socket) => {
    // Asignar el rol de Dios
    socket.on('declarar-dios', () => {
        diosSocketId = socket.id;
        console.log(`Un usuario se ha declarado DIOS: ${socket.id}`);
        socket.emit('rol-confirmado', 'dios');
    });

    // Enviar mensaje del jugador a Dios
    socket.on('enviar-mensaje', (datos) => {
        if (diosSocketId) {
            io.to(diosSocketId).emit('mensaje-recibido', {
                remitente: datos.nombre,
                texto: datos.texto
            });
        } else {
            socket.emit('error-sistema', 'No hay ningún Dios conectado en este momento.');
        }
    });

    // Limpiar si Dios se desconecta
    socket.on('disconnect', () => {
        if (socket.id === diosSocketId) {
            diosSocketId = null;
            console.log('Dios se ha desconectado.');
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
