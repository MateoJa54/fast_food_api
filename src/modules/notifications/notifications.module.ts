import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../firebase/firebase.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [FirebaseModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService], // lo exportamos para usarlo desde Orders
})
export class NotificationsModule {}
