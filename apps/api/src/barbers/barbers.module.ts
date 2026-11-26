import { Module } from '@nestjs/common';
import { AdminBarbersController } from './admin-barbers.controller.js';
import { BarbersController } from './barbers.controller.js';
import { BarbersService } from './barbers.service.js';

@Module({
  controllers: [BarbersController, AdminBarbersController],
  providers: [BarbersService],
})
export class BarbersModule {}
