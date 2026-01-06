import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}
@Post('register-token')
@UseGuards(FirebaseAuthGuard)
register(@Req() req, @Body() dto) {
  return this.notifications.registerToken(
    req.user.uid,
    dto.token,
    dto.platform,
  );
}

}
