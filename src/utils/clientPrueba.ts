// client.ts
import { Socket } from 'node:net';
import { josLogger } from './logger';

//jos Mini cliente para probar conexión al servidor TCP

// const client = new Socket();
// client.connect(8010, '127.0.0.1', () => {
//   josLogger.info('Conectado');
//   client.write('Hola servidor\n');
// });

// client.on('data', (data) => {
//   josLogger.info('Respuesta: ' + data.toString());
//   client.end();
// });

// client.on('close', () => josLogger.info('Conexión cerrada'));
// client.on('error', (e) => josLogger.error('Error: ' + e.message));
