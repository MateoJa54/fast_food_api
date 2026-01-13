import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // POST /orders  (userId sale del token)
  @Post()
  @UseGuards(FirebaseAuthGuard)
  create(@Req() req: any, @Body() dto: CreateOrderDto) {
    const userId = req.user.uid;
    return this.ordersService.createOrder(userId, dto);
  }

@Get('my')
@UseGuards(FirebaseAuthGuard)
getMyOrders(@Req() req: any) {
  return this.ordersService.getOrdersByUser(req.user.uid);
}

@Get(':id')
@UseGuards(FirebaseAuthGuard)
getById(@Param('id') id: string) {
  return this.ordersService.getOrderById(id);
}


  // PATCH /orders/:id/status
  @Patch(':id/status')
  @UseGuards(FirebaseAuthGuard)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    // changedBy por ahora "system"; luego lo puedes pasar con roles
    return this.ordersService.updateStatus(id, dto.status, 'system');
  }
}
