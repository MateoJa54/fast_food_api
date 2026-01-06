import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { SimulatePaymentDto } from './dto/simulate-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('simulate')
  simulate(@Body() dto: SimulatePaymentDto) {
    return this.paymentsService.simulatePayment(
      dto.amount,
      dto.currency,
      dto.paymentMethod,
    );
  }
}
