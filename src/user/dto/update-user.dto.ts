import { IsNumber, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  password: string;
  @IsString()
  nick: string;
}
