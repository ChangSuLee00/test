import { MaxLength } from 'class-validator';

export class CreateBoxDto {
  @MaxLength(15, { message: '북마크 상자는 최대 15글자입니다.' })
  boxName: string;

  img: string;

  user_id: number;
}
