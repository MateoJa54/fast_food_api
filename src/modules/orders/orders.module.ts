import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../firebase/firebase.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../paymets/payments.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [FirebaseModule, NotificationsModule, PaymentsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
