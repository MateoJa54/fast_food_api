import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
  IsInt,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export type PaymentMethod = 'CARD' | 'CASH';
export type SimStatus = 'SIMULATED_APPROVED' | 'SIMULATED_DECLINED';

class CardDto {
  @IsString()
  @MinLength(13)
  @MaxLength(19)
  pan: string; // sin espacios, solo dígitos

  @IsString()
  @MinLength(2)
  holderName: string;

  @IsInt()
  expMonth: number; // 1-12

  @IsInt()
  expYear: number; // 2026+

  @IsString()
  @MinLength(3)
  @MaxLength(4)
  cvv: string; // 3 o 4
}

class CashDto {
  @IsNumber()
  @Min(0)
  given: number;
}

export class SimulatePaymentDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsIn(['USD'])
  currency: 'USD';

  @IsString()
  @IsIn(['CARD', 'CASH'])
  method: PaymentMethod;

  @ValidateIf((o) => o.method === 'CARD')
  @ValidateNested()
  @Type(() => CardDto)
  card?: CardDto;

  @ValidateIf((o) => o.method === 'CASH')
  @ValidateNested()
  @Type(() => CashDto)
  cash?: CashDto;
}
