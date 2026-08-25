import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('🔌 Socket connected:', socket.id);

    socket.on('join:attendance', (sessionId: string) => {
      socket.join(`attendance_${sessionId}`);
      console.log(`Socket ${socket.id} joined attendance session ${sessionId}`);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
    });
  });
};

export const emitAttendanceUpdate = (sessionId: string, payload: any) => {
  if (io) {
    io.to(`attendance_${sessionId}`).emit('attendance:update', payload);
  }
};

export const emitSubstitutionAssigned = (subId: string, payload: any) => {
  if (io) {
    io.emit('substitution:assigned', payload);
  }
};
