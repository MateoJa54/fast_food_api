import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly firebase: FirebaseService) {}

  async registerToken(userId: string, token: string, platform: string) {
    const db = this.firebase.getFirestore();

    // Recomendación: guardar tokens por usuario (soporta múltiples dispositivos)
    const ref = db.collection('user_devices').doc(`${userId}_${token.slice(0, 12)}`);

    await ref.set(
      {
        userId,
        token,
        platform,
        updatedAt: new Date(),
      },
      { merge: true },
    );

    return { ok: true };
  }

  async sendToUser(userId: string, title: string, body: string, data?: Record<string, string>) {
    const db = this.firebase.getFirestore();
    const msg = this.firebase.getMessaging();

    const snap = await db.collection('user_devices').where('userId', '==', userId).get();
    const tokens = snap.docs.map((d) => (d.data() as any).token).filter(Boolean);

    if (tokens.length === 0) {
      return { ok: false, reason: 'No device tokens registered', sent: 0 };
    }

    const response = await msg.sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: data ?? {},
    });

    return {
      ok: true,
      sent: response.successCount,
      failed: response.failureCount,
    };
  }
}
