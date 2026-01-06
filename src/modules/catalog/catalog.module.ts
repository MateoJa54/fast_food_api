import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { FirebaseModule } from '../../firebase/firebase.module';

@Module({
  imports: [FirebaseModule], // 👈 IMPORTA EL MÓDULO
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
