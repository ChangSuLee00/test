import { Module } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { BookmarkController } from './bookmark.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarkEntity } from './entities/bookmark.entity';
import { BookmarkRepository } from './repository/bookmark.repository';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookmarkEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1y' },
    }),
  ],
  controllers: [BookmarkController],
  providers: [BookmarkService, BookmarkRepository, JwtAuthGuard],
})
export class BookmarkModule {}
