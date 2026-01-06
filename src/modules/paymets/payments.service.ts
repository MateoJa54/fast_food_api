import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  async simulatePayment(
    amount: number,
    currency: string,
    paymentMethod: string,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Invalid amount');
    }

    // Simulación realista
    const approved = Math.random() > 0.1; // 90% aprobado

    return {
      success: approved,
      provider: 'SIMULATED_GATEWAY',
      paymentMethod,
      currency,
      amount,
      transactionId: `TX-${Date.now()}`,
      message: approved ? 'Payment approved' : 'Payment rejected',
    };
  }
}
