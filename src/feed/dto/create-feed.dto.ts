import { IsString } from 'class-validator';

export class CreateFeedDto {
  @IsString()
  FeedName: string;
  @IsString()
  FeedContent: string;
  @IsString()
  URL: string;
  img: any;
  // null | string | object
  user_id: string;
}
