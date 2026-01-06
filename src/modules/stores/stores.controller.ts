import { Controller, Get, Param } from '@nestjs/common';
import { StoresService } from './stores.service';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  getStores() {
    return this.storesService.getStores();
  }

  @Get(':id')
  getStoreById(@Param('id') id: string) {
    return this.storesService.getStoreById(id);
  }
}
