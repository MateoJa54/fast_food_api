import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

@Injectable()
export class CatalogService {
  constructor(private readonly firebase: FirebaseService) {}

 async getCategories() {
  const db = this.firebase.getFirestore();

  // 1) Solo filtro (NO orderBy) => no requiere índice compuesto
  const snap = await db
    .collection('catalog_categories')
    .where('isActive', '==', true)
    .get();

  // 2) Ordenar en el backend por sortOrder
  const categories = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

  categories.sort((a, b) => {
    const sa = Number(a.sortOrder ?? 9999);
    const sb = Number(b.sortOrder ?? 9999);
    return sa - sb;
  });

  return categories;
}


  async getProducts(categoryId?: string) {
    const db = this.firebase.getFirestore();

    let query: FirebaseFirestore.Query = db
      .collection('catalog_products')
      .where('isAvailable', '==', true);

    if (categoryId) query = query.where('categoryId', '==', categoryId);

    const snap = await query.get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async getProductById(id: string) {
    const db = this.firebase.getFirestore();
    const doc = await db.collection('catalog_products').doc(id).get();

    if (!doc.exists) throw new NotFoundException('Product not found');
    return { id: doc.id, ...doc.data() };
  }
}
