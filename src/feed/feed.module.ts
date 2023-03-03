import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { FeedRepository } from './repository/feed.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedEntity } from './entities/feed.entity';
import { openGraphScraper } from '../common/middleware/open-graph-scraper.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeedEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1y' },
    }),
  ],
  controllers: [FeedController],
  providers: [FeedService, FeedRepository, JwtAuthGuard],
})
export class FeedModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(openGraphScraper)
      .forRoutes({ path: 'api/feed', method: RequestMethod.POST });
  }
}
