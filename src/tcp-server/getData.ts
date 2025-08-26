import { Buffer } from 'node:buffer';
import { crc16IBM } from 'src/utils/crc';

// Constantes de protocolo

export const START = Buffer.from([0xCC, 0xAA, 0xAA, 0xAA] as const);
export const END = Buffer.from([0xCC, 0xBB, 0xBB, 0xBB] as const);

const HEADER_OFFSET = START.length; // empieza justo después de START
const HEADER_SIZE   = 10;           // 1+1+2+2+1+1+2

export interface HeaderFields {
  versionProtocolo: number;
  reserva: number;
  nodoOrigen: number;
  nodoDestino: number;
  tipoTrama: number;
  tipoMensaje: number;
  longitud: number;
}

//jos Validación de inicio y fin
export function inicioCorrecto(buf: Buffer): boolean {
    // return buf.length >= inicioEsperado.length && buf.subarray(0, inicioEsperado.length).equals(inicioEsperado);p
    return getStart(buf).equals(START);
}

export function finalCorrecto(buf: Buffer): boolean {
    //   return buf.length >= finEsperado.length && buf.subarray(buf.length - finEsperado.length).equals(finEsperado);
    return getEnd(buf).equals(END);
}

/**
 * Verifica que el frame comienza con el delimitador START.
 */
export function getStart(frame: Buffer): Buffer {
    return frame.subarray(0, START.length);
}

/**
 * Verifica que el frame termina con el delimitador END.
 */
export function getEnd(frame: Buffer): Buffer {
    return frame.subarray(frame.length - END.length);
}

/**
 * Devuelve el header sin delimitadores ni CRC ni END.
 * Header = versión + reserva + nodoOrigen + nodoDestino + tipoTrama + tipoMensaje + longitud
 */
export function getHeader(frame: Buffer): Buffer {
    const startOffset = START.length;
    // header es fijo de 1+1+2+2+1+1+2 = 10 bytes
    return frame.subarray(startOffset, startOffset + 10);
}

/**
 * Extrae la sección de datos (payload).
 */
export function getDataSection(frame: Buffer): Buffer {
    // const startOffset = START.length + 10; // skip start + header
    // const totalLen = frame.length - START.length - END.length - 2; // -CRC(2) -END
    // return frame.subarray(startOffset, startOffset + totalLen);

    // const dataLen = frame.readUInt16LE(START.length + 8); // longitud (LE) en los 2 últimos bytes del header
    // const dataStart = START.length + 10;                  // justo después del header (10B)
    // return frame.subarray(dataStart, dataStart + dataLen);

    const dataLen = getLongitud(frame);
    const dataStart = HEADER_OFFSET + HEADER_SIZE;
    return frame.subarray(dataStart, dataStart + dataLen);
}

/**
 * Extrae el CRC recibido (últimos 2 bytes antes de END).
 */
export function getCRCFromFrame(frame: Buffer): number {
    // const crcOffset = frame.length - END.length - 2;

    const dataLen = frame.readUInt16LE(START.length + 8);
    const crcOffset = START.length + 10 + dataLen;

    return frame.readUInt16LE(crcOffset);
}

/**
 * Recalcula el CRC sobre header+datos y lo compara con el recibido.
 * Implementación CRC16 IBM/ARC (polinomio 0xA001).
 */
export function getCRC(frame: Buffer): { ok: boolean; expected: number; received: number } {
    const header = getHeader(frame);
    const data = getDataSection(frame);

    const buf = Buffer.concat([header, data]);
    const expected = crc16IBM(buf);
    const received = getCRCFromFrame(frame);

    return {
        ok: expected === received,
        expected,
        received,
    };
}

// jos Funciones para el Header
/** Lee todos los campos del header */
export function parseHeader(frame: Buffer): HeaderFields {
  const o = HEADER_OFFSET;

  const versionProtocolo = frame.readUInt8(o + 0);
  const reserva          = frame.readUInt8(o + 1);
  const nodoOrigen       = frame.readUInt16LE(o + 2);
  const nodoDestino      = frame.readUInt16LE(o + 4);
  const tipoTrama        = frame.readUInt8(o + 6);
  const tipoMensaje      = frame.readUInt8(o + 7);
  const longitud         = frame.readUInt16LE(o + 8);

  return { versionProtocolo, reserva, nodoOrigen, nodoDestino, tipoTrama, tipoMensaje, longitud };
}

/** Lectores puntuales por si quieres acceso directo */
export function getTipoTrama(frame: Buffer): number {
  return frame.readUInt8(HEADER_OFFSET + 6);
}
export function getTipoMensaje(frame: Buffer): number {
  return frame.readUInt8(HEADER_OFFSET + 7);
}
export function getLongitud(frame: Buffer): number {
  return frame.readUInt16LE(HEADER_OFFSET + 8);
}
