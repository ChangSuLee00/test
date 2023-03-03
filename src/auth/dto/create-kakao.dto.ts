import { PickType } from '@nestjs/swagger';
import { UserEntity } from '../../user/entities/user.entity';

export class CreateKakaoUserDto extends PickType(UserEntity, [
  'email',
  'nick',
  'provider',
  'snsId',
] as const) {}
