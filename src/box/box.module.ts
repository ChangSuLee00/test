import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { BoxService } from './box.service';
import { BoxController } from './box.controller';
import { BoxEntity } from './entities/box.entity';
import { MulterModule } from '@nestjs/platform-express/multer';
import { BoxRepository } from './repository/box.repository';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MulterModule.register({ dest: './uploads' }),
    TypeOrmModule.forFeature([BoxEntity]),

    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1y' },
    }),
  ],
  controllers: [BoxController],
  providers: [BoxService, BoxRepository, JwtAuthGuard],
})
export class BoxModule {}
