import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories')
  getCategories() {
    return this.catalogService.getCategories();
  }

  @Get('products')
  getProducts(@Query('categoryId') categoryId?: string) {
    return this.catalogService.getProducts(categoryId);
  }

  @Get('products/:id')
  getProductById(@Param('id') id: string) {
    return this.catalogService.getProductById(id);
  }
}
