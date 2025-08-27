// tcp-server.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { createServer, Socket } from 'node:net';
import { josLogger } from 'src/utils/logger';
import { inicioCorrecto, START, finalCorrecto, END, getCRC, getDataSection, getHeader, parseHeader } from './getData';
import { EnTipoMensaje, EnTipoTrama } from 'src/utils/enums';

@Injectable()
export class TcpServerService implements OnModuleInit {

  constructor() { }

  onModuleInit() {
    const server = createServer((socket: Socket) => {
      let contadorTramas = 0;
      let contadorPresencias = 0;

      josLogger.debug('------------------------------------------------- onModuleInit');
      josLogger.debug('📥 Cliente conectado');
      const remote = `${socket.remoteAddress}:${socket.remotePort}`;
      josLogger.debug(`📥 Cliente conectado desde ${remote}`);

      socket.on('data', (data) => {

        const okStart = inicioCorrecto(data);
        const okEnd = finalCorrecto(data);

        //done Info de la trama recibida
        const header = getHeader(data);
        const payload = getDataSection(data);
        josLogger.debug('HEADER HEX:\n' + hexDump(header));
        josLogger.debug('DATA HEX:\n' + hexDump(payload));

        if (!okStart || !okEnd) {
          josLogger.error(`🚫 Trama inválida: delimitadores inicio o fin incorrectos (START=${okStart}, END=${okEnd}).`);
          // Opcional: responde un NACK o simplemente descarta
          socket.write('NACK: delimitadores inválidos');
          return;
        }

        const crcValidation = getCRC(data);
        if (!crcValidation.ok) {
          josLogger.error(`🚫 Trama inválida: CRC incorrecta (expected=${crcValidation.expected}, received=${crcValidation.received}).`);
          socket.write('NACK: CRC inválida');
          return;
        }

        josLogger.debug

        josLogger.debug('📨📨📨 Mensaje recibido: ' + data.toString());

        josLogger.debug(`✅ INICIO = ${hexDump(START)}`);
        josLogger.debug(`✅ FIN    = ${hexDump(END)}`);
        josLogger.debug(`✅ CRC    = ${crcValidation.ok} (expected=${crcValidation.expected}, received=${crcValidation.received})`);

        josLogger.debug(`HEADER: \n Versión protocolo: ${parseHeader(data).versionProtocolo}\n Reserva: ${parseHeader(data).reserva}\n Nodo origen: ${parseHeader(data).nodoOrigen}\n Nodo destino: ${parseHeader(data).nodoDestino}\n Tipo trama: ${parseHeader(data).tipoTrama} (${EnTipoTrama[parseHeader(data).tipoTrama]})\n Tipo mensaje: ${parseHeader(data).tipoMensaje} (${EnTipoMensaje[parseHeader(data).tipoMensaje]})\n Longitud: ${parseHeader(data).longitud}\n Data en Int: ${parseHeader(data).longitud != 0 ? payload.readUInt32LE(0) / 100 : "No hay bytes, probablemente haya llegado la PRESENCIA"}`);

        josLogger.warn(`📨📨📨 RX len= ${data.length}`);
        josLogger.warn('📨📨📨 RX HEX: \n' + hexDump(data));
        josLogger.warn('📨📨📨 RX b64: ' + data.toString('base64') + '\n');
        josLogger.info('Tramas recibidas: ' + ++contadorTramas);

        if (parseHeader(data).tipoMensaje === EnTipoMensaje.txPresencia) ++contadorPresencias;
          
        josLogger.info('Presencias recibidas: ' + contadorPresencias);
        josLogger.debug('-------------------------------------------------');

        // Responder al cliente
        socket.write('✅ Recibido -> ' + data.toString()); //jos Aquí devolvería el ACK o algo similar
      });

      socket.on('end', () => { josLogger.debug('❌ Cliente desconectado'); });

      socket.on('close', () => {
        josLogger.debug('🧯 Conexión cerrada')
        josLogger.debug('-------------------------------------------------');
      });

      socket.on('error', (err) => { josLogger.error('❗ Error en el socket: ' + err.message); });

    });
    josLogger.debug('-------------------------------------------------');

    server.listen(process.env.TCP_PORT || 8010, () => { josLogger.debug('🚀 Servidor TCP escuchando en el puerto ' + (process.env.TCP_PORT || 8010) + ' \n\n\n'); });
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

export function hexDump(buf: Buffer, width = 16): string {
  const hex: string[] = buf.toString('hex').match(/.{1,2}/g) ?? []; // Divide en grupos de 2 bytes
  const lines: string[] = [];                                       // Aquí irá el resultado

  for (let i = 0; i < hex.length; i += width) {
    const slice = hex.slice(i, i + width);                          // Toma un "ancho" de bytes
    lines.push(slice.join(' '));                                    // ok
  }
  return lines.join('\n');
}
