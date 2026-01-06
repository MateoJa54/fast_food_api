import { IsString } from 'class-validator';

export class RegisterTokenDto {
  @IsString()
  userId: string;

  @IsString()
  token: string;

  @IsString()
  platform: string; // android/ios/web
}
