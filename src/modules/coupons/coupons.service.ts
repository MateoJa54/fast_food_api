import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

type DiscountType = 'PERCENT' | 'AMOUNT';

@Injectable()
export class CouponsService {
  constructor(private readonly firebase: FirebaseService) {}

  async validateCoupon(code: string, subtotal: number) {
    const db = this.firebase.getFirestore();
    const normalized = code.trim().toUpperCase();

    const snap = await db
      .collection('coupons')
      .where('code', '==', normalized)
      .limit(1)
      .get();

    if (snap.empty) throw new NotFoundException('Coupon not found');

    const doc = snap.docs[0];
    const data = doc.data() as any;

    if (!data.isActive) throw new BadRequestException('Coupon is not active');

    const now = new Date();
    const validFrom = data.validFrom?.toDate?.() ? data.validFrom.toDate() : null;
    const validTo = data.validTo?.toDate?.() ? data.validTo.toDate() : null;

    if (validFrom && now < validFrom) throw new BadRequestException('Coupon not valid yet');
    if (validTo && now > validTo) throw new BadRequestException('Coupon expired');

    const minOrderAmount = Number(data.minOrderAmount ?? 0);
    if (subtotal < minOrderAmount) {
      throw new BadRequestException(`Minimum order amount is ${minOrderAmount}`);
    }

    const discountType = data.discountType as DiscountType;
    const discountValue = Number(data.discountValue ?? 0);

    if (!['PERCENT', 'AMOUNT'].includes(discountType)) {
      throw new BadRequestException('Invalid discountType in coupon');
    }

    let discountAmount = 0;
    if (discountType === 'PERCENT') discountAmount = (subtotal * discountValue) / 100;
    else discountAmount = discountValue;

    discountAmount = Math.max(0, Math.min(discountAmount, subtotal));

    return {
      valid: true,
      coupon: {
        id: doc.id,
        code: data.code,
        discountType,
        discountValue,
        minOrderAmount,
      },
      subtotal,
      discountAmount,
      totalAfterDiscount: subtotal - discountAmount,
    };
  }
}
