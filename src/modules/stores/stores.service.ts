import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

@Injectable()
export class StoresService {
  constructor(private readonly firebase: FirebaseService) {}

  async getStores() {
    const db = this.firebase.getFirestore();
    const snap = await db.collection('stores').where('isActive', '==', true).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async getStoreById(id: string) {
    const db = this.firebase.getFirestore();
    const doc = await db.collection('stores').doc(id).get();
    if (!doc.exists) throw new NotFoundException('Store not found');
    return { id: doc.id, ...doc.data() };
  }
}
