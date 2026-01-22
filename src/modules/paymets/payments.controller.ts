import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { SimulatePaymentDto } from './dto/simulate-payment.dto';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('simulate')
  @UseGuards(FirebaseAuthGuard)
  simulate(@Req() req: any, @Body() dto: SimulatePaymentDto) {
    const userId = req.user.uid;
    return this.payments.simulate(userId, dto);
  }
}
