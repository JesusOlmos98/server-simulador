// tcp-server.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { createServer, Socket } from 'node:net';
import { josLogger } from 'src/utils/logger';

@Injectable()
export class TcpServerService implements OnModuleInit {

  onModuleInit() {
    const server = createServer((socket: Socket) => {
      josLogger.debug('------------------------------------------------- onModuleInit');
      josLogger.debug('📥 Cliente conectado');

      const remote = `${socket.remoteAddress}:${socket.remotePort}`;
      josLogger.debug(`📥 Cliente conectado desde ${remote}`);

      socket.on('data', (data) => {
        josLogger.debug('📨 Mensaje recibido:' + data.toString());
        josLogger.debug('-------------------------------------------------');

        // Responder al cliente
        socket.write('✅ Recibido, '+data.toString()); //jos Aquí devolvería el ACK o algo similar
      });

      socket.on('end', () => { josLogger.debug('❌ Cliente desconectado'); });

      socket.on('close', () => {
        josLogger.debug('🧯 Conexión cerrada')
        josLogger.debug('-------------------------------------------------');
      });

      socket.on('error', (err) => { josLogger.error('❗ Error en el socket: ' + err.message); });

    });
    josLogger.debug('-------------------------------------------------');

    server.listen(process.env.TCP_PORT || 8010, () => { josLogger.debug('🚀 Servidor TCP escuchando en el puerto '+(process.env.TCP_PORT || 8010)+' \n\n\n'); });
  }
  
}



// import { Injectable } from '@nestjs/common';
// import { CreateTcpServerDto } from './dto/create-tcp-server.dto';
// import { UpdateTcpServerDto } from './dto/update-tcp-server.dto';

// @Injectable()
// export class TcpServerService {
//   create(createTcpServerDto: CreateTcpServerDto) {
//     return 'This action adds a new tcpServer';
//   }

//   findAll() {
//     return `This action returns all tcpServer`;
//   }

//   findOne(id: number) {
//     return `This action returns a #${id} tcpServer`;
//   }

//   update(id: number, updateTcpServerDto: UpdateTcpServerDto) {
//     return `This action updates a #${id} tcpServer`;
//   }

//   remove(id: number) {
//     return `This action removes a #${id} tcpServer`;
//   }
// }
