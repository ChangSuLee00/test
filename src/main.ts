import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express/interfaces';
import { AllExceptionFiller } from './common/exception/exception.fillter';
import { winstonLogger } from './common/utils/logger.winston';
import * as path from 'path';
import helmet from 'helmet';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: winstonLogger,
  });
  app.useStaticAssets(path.join(__dirname, '../', 'uploads'), {
    // const app = await NestFactory.create<NestExpressApplication>
    // express 앱이라고 명시 해줘야 사용 가능.
    prefix: '/img',
    // static file 제공 주소.
  });
  app.use(helmet());
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useGlobalFilters(new AllExceptionFiller(winstonLogger));
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(5000);
}
bootstrap();
