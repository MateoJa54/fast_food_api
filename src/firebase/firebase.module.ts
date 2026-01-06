import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Module({
  providers: [FirebaseService],
  exports: [FirebaseService], // 👈 ESTO ES CLAVE
})
export class FirebaseModule {}
