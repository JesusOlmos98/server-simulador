import { Module } from '@nestjs/common';
import { TcpServerService } from './tcp-server.service';
import { TcpServerController } from './tcp-server.controller';
import { MetricsService } from 'src/metrics/metrics.service';
// import { MetricsModule } from 'src/metrics/metrics.module';

@Module({
  // imports: [MetricsModule],
  controllers: [TcpServerController],
  providers: [TcpServerService, MetricsService],
  exports: [TcpServerService, MetricsService],
})
export class TcpServerModule { }
