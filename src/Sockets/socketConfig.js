import { io } from 'socket.io-client';

class SocketService {
  socket = null;

  initializeSocket(token, uuid) {
    this.socket = io("https://sisyabackend.in", {
        path: '/student/socket.io',
        transports: ['websocket'],
        auth: {
          token:token,
          id: uuid,
        },
      });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    this.socket.on('connect_error', (error) => {
      console.log('Socket connection error:', error);
    });
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

const socketService = new SocketService();
export default socketService;
