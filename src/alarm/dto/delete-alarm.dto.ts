import { IsNumber } from 'class-validator';

export class DeleteAlarmDto {
  @IsNumber()
  id: number;
  @IsNumber()
  user_id: number;
}
