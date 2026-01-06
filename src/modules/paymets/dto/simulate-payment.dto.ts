import { IsNumber, IsString, Min } from 'class-validator';

export class SimulatePaymentDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  paymentMethod: string; // CARD, CASH, WALLET
}
