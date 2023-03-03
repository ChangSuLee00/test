import { IsString } from 'class-validator';

export class CreateGpt_A_Dto {
  @IsString()
  question: string;
  @IsString()
  answer: string;
  user?: object;
}
