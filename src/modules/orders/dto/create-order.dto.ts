import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export type DeliveryMode = 'PICKUP' | 'DELIVERY';
export type PaymentMethod = 'CARD' | 'CASH';

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
  @IsString({ each: true })
  tagsSnapshot: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  modifiersSnapshot?: {
    optionId: string;
    name: string;
    priceDelta: number;
  }[];
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

class CouponSnapshotDto {
  @IsString()
  code: string;

  @IsNumber()
  @Min(0)
  discountAmount: number;
}

export class CreateOrderDto {
  @IsString()
  clientOrderId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemSnapshotDto)
  items: OrderItemSnapshotDto[];

  @IsString()
  @IsIn(['PICKUP', 'DELIVERY'])
  deliveryMode: DeliveryMode;

  @IsString()
  storeId: string;

  @IsOptional()
  addressSnapshot?: any;

  @IsOptional()
  @ValidateNested()
  @Type(() => CouponSnapshotDto)
  couponSnapshot?: CouponSnapshotDto;

  @ValidateNested()
  @Type(() => TotalsDto)
  totals: TotalsDto;

  @IsString()
  @IsNotEmpty()
  paymentTransactionId: string;
}
