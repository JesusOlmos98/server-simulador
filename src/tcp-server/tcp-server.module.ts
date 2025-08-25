import { Module } from '@nestjs/common';
import { TcpServerService } from './tcp-server.service';
import { TcpServerController } from './tcp-server.controller';

@Module({
  controllers: [TcpServerController],
  providers: [TcpServerService],
  exports: [TcpServerService],
})
export class TcpServerModule {}
