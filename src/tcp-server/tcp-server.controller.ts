import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TcpServerService } from './tcp-server.service';
import { CreateTcpServerDto } from './dto/create-tcp-server.dto';
import { UpdateTcpServerDto } from './dto/update-tcp-server.dto';

@Controller('tcp-server')
export class TcpServerController {
  constructor(private readonly tcpServerService: TcpServerService) {}

  // @Post()
  // create(@Body() createTcpServerDto: CreateTcpServerDto) {
  //   return this.tcpServerService.create(createTcpServerDto);
  // }

  // @Get()
  // findAll() {
  //   return this.tcpServerService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.tcpServerService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTcpServerDto: UpdateTcpServerDto) {
  //   return this.tcpServerService.update(+id, updateTcpServerDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.tcpServerService.remove(+id);
  // }
}
