import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvConfiguration } from 'config/app.config';

const env = EnvConfiguration();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(env.httpPort || 3000);
}
bootstrap();
