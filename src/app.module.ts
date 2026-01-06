import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateEnv } from './config/env.validation';
import { FirebaseModule } from './firebase/firebase.module';
import { HealthModule } from './modules/health/health.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { StoresModule } from './modules/stores/stores.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { PaymentsModule } from './modules/paymets/payments.module';
import { OrdersModule } from './modules/orders/orders.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    FirebaseModule,
    HealthModule, CatalogModule, StoresModule, CouponsModule, PaymentsModule, OrdersModule, NotificationsModule, RecommendationsModule
  ],
})
export class AppModule {}
