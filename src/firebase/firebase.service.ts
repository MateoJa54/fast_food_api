import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private firestore: FirebaseFirestore.Firestore;

  constructor(private readonly config: ConfigService) {
    if (!admin.apps.length) {
      const serviceAccountPath = this.config.get<string>(
        'FIREBASE_SERVICE_ACCOUNT_PATH',
      );

      if (!serviceAccountPath) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH not defined');
      }

      admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath)),
      });

      this.logger.log('Firebase Admin initialized');
    }

    this.firestore = admin.firestore();
    this.firestore.settings({ ignoreUndefinedProperties: true });
  }

  getFirestore() {
    return this.firestore;
  }

  getFieldValue() {
    return admin.firestore.FieldValue;
  }

getMessaging() {
  return admin.messaging();
}

}