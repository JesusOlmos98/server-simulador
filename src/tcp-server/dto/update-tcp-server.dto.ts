import { PartialType } from '@nestjs/mapped-types';
import { CreateTcpServerDto } from './create-tcp-server.dto';

export class UpdateTcpServerDto extends PartialType(CreateTcpServerDto) {}
