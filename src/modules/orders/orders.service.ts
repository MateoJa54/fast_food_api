import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { FirebaseService } from '../../firebase/firebase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentsService } from '../paymets/payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ORDER_STATUS_TRANSITIONS } from './dto/order-status-rules';
import { OrderStatus } from './dto/order-status-enum';

function removeUndefinedDeep(obj: any): any {
  if (Array.isArray(obj)) return obj.map(removeUndefinedDeep);
  if (obj && typeof obj === 'object') {
    const clean: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined) continue;
      clean[k] = removeUndefinedDeep(v);
    }
    return clean;
  }
  return obj;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly notifications: NotificationsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  // POST /orders
  async createOrder(userId: string, dto: CreateOrderDto) {
    const db = this.firebase.getFirestore();

    // DTO -> plain object -> limpiar undefined (Firestore no acepta undefined)
    let payload = instanceToPlain(dto) as any;
    payload = removeUndefinedDeep(payload);

    // Validaciones mínimas (contrato final)
    if (!payload.clientOrderId || typeof payload.clientOrderId !== 'string') {
      throw new BadRequestException('clientOrderId is required');
    }
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new BadRequestException('items is required');
    }
    if (!payload.totals || typeof payload.totals.total !== 'number') {
      throw new BadRequestException('totals.total is required');
    }
    if (!payload.paymentTransactionId || typeof payload.paymentTransactionId !== 'string') {
      throw new BadRequestException('paymentTransactionId is required');
    }

    // ✅ Idempotencia: mismo userId + clientOrderId => devolver pedido existente
    const existing = await db
      .collection('orders')
      .where('userId', '==', userId)
      .where('clientOrderId', '==', payload.clientOrderId)
      .limit(1)
      .get();

    if (!existing.empty) {
      const doc = existing.docs[0];
      const data = doc.data() as any;
      return {
        orderId: doc.id,
        status: data.status,
        createdAt: data.createdAt,
        total: data?.totals?.total ?? null,
        idempotent: true,
      };
    }

    // Obtener pago (seguro): el backend valida que sea del usuario
    const payment = await this.paymentsService.getPaymentForUser(
      userId,
      payload.paymentTransactionId,
    );

    // Si el pago fue rechazado, no crear orden
    if (payment.status && payment.status !== 'SIMULATED_APPROVED') {
      throw new BadRequestException('Payment not approved');
    }

    const nowIso = new Date().toISOString();

    // Documento final (snapshot inmutable)
    const orderDoc = removeUndefinedDeep({
      userId,
      clientOrderId: payload.clientOrderId,

      items: payload.items,

      deliveryMode: payload.deliveryMode,
      storeId: payload.storeId,
      addressSnapshot: payload.addressSnapshot ?? null,

      couponSnapshot: payload.couponSnapshot ?? null,

      totals: payload.totals,

      // ✅ snapshot del pago generado por backend
      paymentSnapshot: {
        transactionId: payment.id ?? payload.paymentTransactionId,
        method: payment.method ?? null,
        status: payment.status ?? null,
        paidAt: payment.paidAt ?? nowIso,
        brand: payment.brand ?? null,
        last4: payment.last4 ?? null,
        change: payment.change ?? null,
        message: payment.message ?? null,
        authCode: payment.authCode ?? null,
      },

      status: OrderStatus.CREATED,
      createdAt: nowIso,

      tracking: [{ status: OrderStatus.CREATED, timestamp: nowIso }],
      statusHistory: [],
    });

    const ref = await db.collection('orders').add(orderDoc);

    return {
      orderId: ref.id,
      status: orderDoc.status,
      createdAt: orderDoc.createdAt,
      total: orderDoc.totals.total,
    };
  }

  // GET /orders/:id
  async getOrderById(orderId: string) {
    const db = this.firebase.getFirestore();
    const doc = await db.collection('orders').doc(orderId).get();
    if (!doc.exists) throw new NotFoundException('Order not found');
    return { id: doc.id, ...(doc.data() as any) };
  }

  // GET /orders/my
  async getOrdersByUser(userId: string) {
    const db = this.firebase.getFirestore();
    const snap = await db.collection('orders').where('userId', '==', userId).get();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  }

  // PATCH /orders/:id/status
  async updateStatus(orderId: string, status: string, changedBy = 'system') {
    const db = this.firebase.getFirestore();
    const ref = db.collection('orders').doc(orderId);

    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Order not found');

    const order = doc.data() as any;
    const currentStatus: OrderStatus =
      (order.status as OrderStatus) ?? OrderStatus.CREATED;

    const newStatus: OrderStatus = status as OrderStatus;

    // Validar status
    const allowedStatuses = Object.values(OrderStatus);
    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    // No-op si es igual
    if (currentStatus === newStatus) {
      return { orderId, status: newStatus, unchanged: true };
    }

    // Validar transición
    const allowedNext = ORDER_STATUS_TRANSITIONS[currentStatus] ?? [];
    if (!allowedNext.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid transition from ${currentStatus} to ${newStatus}`,
      );
    }

    const nowIso = new Date().toISOString();

    const historyEntry = {
      fromStatus: currentStatus,
      toStatus: newStatus,
      changedAt: nowIso,
      changedBy,
    };

    const trackingEntry = {
      status: newStatus,
      timestamp: nowIso,
    };

    await ref.update({
      status: newStatus,
      statusHistory: this.firebase.getFieldValue().arrayUnion(historyEntry),
      tracking: this.firebase.getFieldValue().arrayUnion(trackingEntry),
    });

    // Notificar al usuario
    const userId = order.userId;
    await this.notifications.sendToUser(
      userId,
      'Actualización de pedido',
      `Tu pedido ahora está en estado: ${newStatus}`,
      { orderId, status: newStatus },
    );

    return { orderId, status: newStatus };
  }
}
