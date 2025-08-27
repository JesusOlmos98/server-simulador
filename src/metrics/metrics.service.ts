import { Injectable, OnModuleDestroy } from '@nestjs/common';

type Ns = bigint;

export interface MetricsSnapshot {
  second: { fps: number; kbps: number };
  avg60s: { fps: number; kbps: number };
  totals: { frames: number; bytes: number; errors: number };
  latency: { count: number; avgMs: number; minMs: number; maxMs: number };
}

@Injectable()
export class MetricsService implements OnModuleDestroy {
  // Totales acumulados
  private _totalFrames = 0;
  private _totalBytes = 0;
  private _totalErrors = 0;

  // Ventana deslizante por segundo (60 buckets)
  private readonly windowSec = 60;
  private framesBuckets = new Array<number>(this.windowSec).fill(0);
  private bytesBuckets = new Array<number>(this.windowSec).fill(0);
  private idx = 0;
  private rotator?: NodeJS.Timeout;

  // Latencia (en milisegundos)
  private latCount = 0;
  private latSumMs = 0;
  private latMinMs = Infinity;
  private latMaxMs = 0;

  constructor() {
    // Rota los buckets cada segundo
    this.rotator = setInterval(() => {
      this.idx = (this.idx + 1) % this.windowSec;
      this.framesBuckets[this.idx] = 0;
      this.bytesBuckets[this.idx] = 0;
    }, 1000);
  }

  onModuleDestroy() {
    if (this.rotator) clearInterval(this.rotator);
  }

  /** Llamar cuando cierres un frame válido (CRC OK) */
  onFrame(sizeBytes: number) {
    this.framesBuckets[this.idx]++;
    this.bytesBuckets[this.idx] += sizeBytes;
    this._totalFrames++;
    this._totalBytes += sizeBytes;
  }

  /** Llamar cuando detectes un error (CRC, parseo, etc.) */
  onError() {
    this._totalErrors++;
  }

  /** Añade una observación de latencia en nanosegundos (p. ej. nowNs - sentNs) */
  addLatencyNs(deltaNs: Ns) {
    const ms = Number(deltaNs) / 1e6; // ns → ms
    this.latCount++;
    this.latSumMs += ms;
    if (ms < this.latMinMs) this.latMinMs = ms;
    if (ms > this.latMaxMs) this.latMaxMs = ms;
  }

  /** Fotografía de métricas en este instante */
  snapshot(): MetricsSnapshot {
    const fps1s = this.framesBuckets[this.idx];
    const kbps1s = this.bytesBuckets[this.idx] / 1024;

    const sumFrames = this.framesBuckets.reduce((a, b) => a + b, 0);
    const sumBytes = this.bytesBuckets.reduce((a, b) => a + b, 0);

    const avgFps = sumFrames / this.windowSec;
    const avgKbps = (sumBytes / this.windowSec) / 1024;

    const avgMs = this.latCount ? (this.latSumMs / this.latCount) : 0;
    const minMs = this.latCount ? this.latMinMs : 0;
    const maxMs = this.latCount ? this.latMaxMs : 0;

    return {
      second: { fps: fps1s, kbps: kbps1s },
      avg60s: { fps: avgFps, kbps: avgKbps },
      totals: { frames: this._totalFrames, bytes: this._totalBytes, errors: this._totalErrors },
      latency: { count: this.latCount, avgMs, minMs, maxMs },
    };
  }

  // Getters por si quieres leerlos sueltos
  get totalFrames() { return this._totalFrames; }
  get totalBytes() { return this._totalBytes; }
  get totalErrors() { return this._totalErrors; }
}



// create(createMetricDto: CreateMetricDto) {
//   return 'This action adds a new metric';
// }

// findAll() {
//   return `This action returns all metrics`;
// }

// findOne(id: number) {
//   return `This action returns a #${id} metric`;
// }

// update(id: number, updateMetricDto: UpdateMetricDto) {
//   return `This action updates a #${id} metric`;
// }

// remove(id: number) {
//   return `This action removes a #${id} metric`;
// }
// }
