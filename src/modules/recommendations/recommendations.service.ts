import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

function timeBucket(date = new Date()): 'BREAKFAST' | 'LUNCH' | 'DINNER' {
  const h = date.getHours();
  if (h >= 5 && h < 11) return 'BREAKFAST';
  if (h >= 11 && h < 17) return 'LUNCH';
  return 'DINNER';
}

@Injectable()
export class RecommendationsService {
  constructor(private readonly firebase: FirebaseService) {}

  async getRecommendations(userId: string, limit = 10) {
    const db = this.firebase.getFirestore();

    // 1) Cargar catálogo disponible
    const productsSnap = await db
      .collection('catalog_products')
      .where('isAvailable', '==', true)
      .get();

    const products = productsSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));

    // 2) Historial reciente del usuario (últimos N pedidos)
    const ordersSnap = await db
      .collection('orders')
      .where('userId', '==', userId)
      .limit(20)
      .get();

    // 3) Construir perfil del usuario por tags (content-based)
    const tagCounts: Record<string, number> = {};
    ordersSnap.docs.forEach((doc) => {
      const o = doc.data() as any;
      const items = o.items ?? [];
      for (const it of items) {
        const tags = it.tagsSnapshot ?? it.tags ?? [];
        const qty = Number(it.qty ?? 1);
        for (const t of tags) tagCounts[String(t)] = (tagCounts[String(t)] ?? 0) + qty;
      }
    });

    // 4) Popularidad global (simple): contar ventas por producto en últimos 50 pedidos
    const globalOrdersSnap = await db.collection('orders').limit(50).get();
    const popularity: Record<string, number> = {};
    globalOrdersSnap.docs.forEach((doc) => {
      const o = doc.data() as any;
      const items = o.items ?? [];
      for (const it of items) {
        const pid = String(it.productId ?? '');
        const qty = Number(it.qty ?? 1);
        if (pid) popularity[pid] = (popularity[pid] ?? 0) + qty;
      }
    });

    // 5) Contexto (hora del día)
    const bucket = timeBucket(new Date());

    // 6) Score híbrido
    const scored = products.map((p: any) => {
      const tags: string[] = Array.isArray(p.tags) ? p.tags : [];
      const contentScore = tags.reduce((acc, t) => acc + (tagCounts[t] ?? 0), 0);

      const popScore = popularity[p.id] ?? 0;

      // Context-aware: si es desayuno, favorecer tags "breakfast" o "coffee"
      let contextBoost = 0;
      if (bucket === 'BREAKFAST' && tags.some((t) => ['breakfast', 'coffee'].includes(t)))
        contextBoost = 5;
      if (bucket === 'LUNCH' && tags.some((t) => ['combo', 'burger'].includes(t)))
        contextBoost = 3;
      if (bucket === 'DINNER' && tags.some((t) => ['combo', 'spicy'].includes(t)))
        contextBoost = 3;

      // Pesos (ajustables)
      const score = contentScore * 2 + popScore * 1 + contextBoost;

      return {
        productId: p.id,
        name: p.name,
        basePrice: p.basePrice,
        imageUrl: p.imageUrl,
        tags: p.tags ?? [],
        score,
        reason: {
          contentScore,
          popScore,
          context: bucket,
          contextBoost,
        },
      };
    });

    scored.sort((a, b) => b.score - a.score);

    return {
      userId,
      context: bucket,
      recommendations: scored.slice(0, limit),
      model: {
        type: 'Hybrid Recommender (Content + Popularity + Context)',
        weights: { content: 2, popularity: 1, contextBoost: 'rule-based' },
      },
    };
  }
}
