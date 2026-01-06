import { IsString } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  status: string; // CREATED, PREPARING, READY, DELIVERED, CANCELLED
}
