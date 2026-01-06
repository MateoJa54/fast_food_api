import {
  IsArray,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ModifierSnapshotDto {
  @IsString()
  optionId: string;

  @IsString()
  name: string;

  @IsNumber()
  priceDelta: number;
}

class OrderItemSnapshotDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  qty: number;

  @IsString()
  nameSnapshot: string;

  @IsNumber()
  @Min(0)
  priceSnapshot: number;

  @IsArray()
  tagsSnapshot: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModifierSnapshotDto)
  modifiersSnapshot?: ModifierSnapshotDto[];
}

class CouponSnapshotDto {
  @IsString()
  code: string;

  @IsNumber()
  @Min(0)
  discountAmount: number;
}

class TotalsDto {
  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Min(0)
  discountTotal: number;

  @IsNumber()
  @Min(0)
  total: number;
}

class PaymentSnapshotDto {
  @IsString()
  method: string; // CARD, CASH, WALLET

  @IsString()
  status: string; // SIMULATED_APPROVED / SIMULATED_DECLINED

  @IsString()
  transactionId: string;
}

class AddressSnapshotDto {
  @IsString()
  line1: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  long: number;
}

export class CreateOrderDto {
  @IsString()
  clientOrderId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemSnapshotDto)
  items: OrderItemSnapshotDto[];

  @IsIn(['PICKUP', 'DELIVERY'])
  deliveryMode: 'PICKUP' | 'DELIVERY';

  @IsString()
  storeId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressSnapshotDto)
  addressSnapshot?: AddressSnapshotDto | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => CouponSnapshotDto)
  couponSnapshot?: CouponSnapshotDto | null;

  @ValidateNested()
  @Type(() => TotalsDto)
  totals: TotalsDto;

  @ValidateNested()
  @Type(() => PaymentSnapshotDto)
  payment: PaymentSnapshotDto;
}
