import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TcpServerModule } from './tcp-server/tcp-server.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [TcpServerModule, MetricsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
