import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Body, UploadedFile } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { ReqWithUserId } from 'src/common/decorators/req_user_id.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { multerOptions } from 'src/common/utils/multer.options';
import { UserEntity } from 'src/user/entities/user.entity';
import { BoxService } from './box.service';
import { CreateBoxDto } from './dto/create-box.dto';
import { UpdateBoxDto } from './dto/update-box.dto';
import { BoxEntity } from './entities/box.entity';

@Controller('api/box')
export class BoxController {
  constructor(private readonly boxService: BoxService) {}

  @UseGuards(JwtAuthGuard)
  @Post('img')
  @UseInterceptors(FileInterceptor('img', multerOptions('')))
  uploadImg(@UploadedFile() img: Express.Multer.File) {
    return { url: `${process.env.SERVER_URL}/img/${img.filename}` };
  }

  @UseGuards(JwtAuthGuard)
  @Post('')
  async create_box(
    @ReqWithUserId() body: CreateBoxDto,
  ): Promise<{ status: number; success: boolean }> {
    return this.boxService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  findAll_box(@CurrentUser() user: UserEntity): Promise<BoxEntity> {
    const user_id = user.id;
    return this.boxService.findAll(user_id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('')
  update_box(
    @ReqWithUserId() body: UpdateBoxDto,
  ): Promise<{ status: number; success: boolean }> {
    return this.boxService.update(body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('')
  remove_box(
    @Body() body: { boxId: number; deleteImg: string },
  ): Promise<{ status: number; success: boolean }> {
    return this.boxService.remove(body);
  }
}
