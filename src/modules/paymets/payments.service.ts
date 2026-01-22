import { BadRequestException, Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { SimulatePaymentDto, SimStatus } from './dto/simulate-payment.dto';

function onlyDigits(s: string) {
  return (s ?? '').replace(/\D/g, '');
}

function luhnCheck(pan: string): boolean {
  const digits = onlyDigits(pan);
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return digits.length >= 13 && sum % 10 === 0;
}

function detectBrand(pan: string): 'VISA' | 'MASTERCARD' | 'AMEX' | 'UNKNOWN' {
  const d = onlyDigits(pan);
  if (d.startsWith('4')) return 'VISA';
  if (/^5[1-5]/.test(d) || /^2(2[2-9]|[3-6]|7[01]|720)/.test(d)) return 'MASTERCARD';
  if (/^(34|37)/.test(d)) return 'AMEX';
  return 'UNKNOWN';
}

function isFutureExpiry(expMonth: number, expYear: number): boolean {
  if (expMonth < 1 || expMonth > 12) return false;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  return expYear > y || (expYear === y && expMonth >= m);
}

function makeTxId() {
  return `TX-${Date.now()}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}

function makeAuthCode() {
  return `A${Math.floor(10000 + Math.random() * 90000)}`;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly firebase: FirebaseService) {}

  async simulate(userId: string, dto: SimulatePaymentDto) {
    const db = this.firebase.getFirestore();
    const nowIso = new Date().toISOString();

    // Validaciones fuertes del backend
    if (dto.amount <= 0) throw new BadRequestException('amount must be > 0');

    if (dto.method === 'CARD') {
      if (!dto.card) throw new BadRequestException('card is required');

      const pan = onlyDigits(dto.card.pan);

      if (!luhnCheck(pan)) throw new BadRequestException('Invalid card number (Luhn)');

      if (!isFutureExpiry(dto.card.expMonth, dto.card.expYear)) {
        throw new BadRequestException('Card expiry must be in the future');
      }

      const cvv = onlyDigits(dto.card.cvv);
      const brand = detectBrand(pan);

      // Reglas de CVV: AMEX 4, otros 3 (acepta 3-4 como pediste, pero ajusta si quieres)
      if (brand === 'AMEX' && cvv.length !== 4) throw new BadRequestException('AMEX CVV must be 4 digits');
      if (brand !== 'AMEX' && cvv.length !== 3) throw new BadRequestException('CVV must be 3 digits');

      const last4 = pan.slice(-4);

      // Simulación de rechazo: 8% o “tarjetas de prueba”
      const isTestApprove = pan.startsWith('4242424242424242') || pan.startsWith('4111111111111111');
      const rejected = !isTestApprove && Math.random() < 0.08;

      const status: SimStatus = rejected ? 'SIMULATED_DECLINED' : 'SIMULATED_APPROVED';
      const tx = makeTxId();

      const result = {
        success: !rejected,
        status,
        method: 'CARD',
        transactionId: tx,
        paidAt: nowIso,
        brand,
        last4,
        authCode: makeAuthCode(),
        message: rejected ? 'Declined' : 'Approved',
      };

      // Persistimos SOLO el resultado (nunca pan/cvv)
      await db.collection('payments').doc(tx).set({
        userId,
        amount: dto.amount,
        currency: dto.currency,
        method: 'CARD',
        status,
        brand,
        last4,
        authCode: result.authCode,
        message: result.message,
        paidAt: nowIso,
        createdAt: nowIso,
      });

      return result;
    }

    // CASH
    if (!dto.cash) throw new BadRequestException('cash is required');

    if (dto.cash.given < dto.amount) {
      throw new BadRequestException('cash.given must be >= amount');
    }

    const change = Number((dto.cash.given - dto.amount).toFixed(2));
    const tx = makeTxId();

    const result = {
      success: true,
      status: 'SIMULATED_APPROVED' as SimStatus,
      method: 'CASH',
      transactionId: tx,
      paidAt: nowIso,
      change,
      message: 'Approved',
    };

    await db.collection('payments').doc(tx).set({
      userId,
      amount: dto.amount,
      currency: dto.currency,
      method: 'CASH',
      status: result.status,
      cashGiven: dto.cash.given,
      change,
      message: result.message,
      paidAt: nowIso,
      createdAt: nowIso,
    });

    return result;
  }

  async getPaymentForUser(userId: string, transactionId: string) {
    const db = this.firebase.getFirestore();
    const doc = await db.collection('payments').doc(transactionId).get();
    if (!doc.exists) throw new BadRequestException('Payment not found');
    const data = doc.data() as any;
    if (data.userId !== userId) throw new BadRequestException('Payment does not belong to user');
    return { id: doc.id, ...data };
  }
}
