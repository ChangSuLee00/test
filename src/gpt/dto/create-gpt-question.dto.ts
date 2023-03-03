import { PickType } from '@nestjs/mapped-types';
import { GptEntity } from '../entities/gpt.entity';

export class CreateGpt_Q_Dto extends PickType(GptEntity, [
  'techStack',
] as const) {
  user?: object;
}
