import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import * as Joi from 'joi';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AuthModule } from './auth/auth.module';
import { BoxModule } from './box/box.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { AlarmModule } from './alarm/alarm.module';
import { FeedModule } from './feed/feed.module';
import { GptModule } from './gpt/gpt.module';
import { UserEntity } from './user/entities/user.entity';
import { BoxEntity } from './box/entities/box.entity';
import { AlarmEntity } from './alarm/entities/alarm.entity';
import { BookmarkEntity } from './bookmark/entities/bookmark.entity';
import { FeedEntity } from './feed/entities/feed.entity';
import { GptEntity } from './gpt/entities/gpt.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: process.env.NODE_ENV === 'dev' ? 'dev' : 'test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      // pord 환경일 때는 configModuel이 환경변수 파일을 무시
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().required(),
        MYSQL_HOST: Joi.string().required(),
        MYSQL_PORT: Joi.string().required(),
        MYSQL_USERNAME: Joi.string().required(),
        MYSQL_PASSWORD: Joi.string().required(),
        MYSQL_DATABASE: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: +process.env.MYSQL_PORT,
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      autoLoadEntities: true,
      // entities: ['src/**/*.entity{.ts,.js}'] load
      synchronize: true,
      // 변경사항 업데이트
      dropSchema: true,
      // row 삭제
      // --> typeORM 오류로 인해 synchronize와 dropSchema는 동일하게 설정 해야 한다.
      // logging: true,
      entities: [
        UserEntity,
        BoxEntity,
        BookmarkEntity,
        AlarmEntity,
        FeedEntity,
        GptEntity,
      ],
    }),
    UserModule,
    AuthModule,
    BoxModule,
    BookmarkModule,
    AlarmModule,
    FeedModule,
    GptModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
