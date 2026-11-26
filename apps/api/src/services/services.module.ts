import { Module } from '@nestjs/common';
import {
  AdminServicesController,
  ServicesController,
} from './services.controller.js';
import { ServicesService } from './services.service.js';

@Module({
  controllers: [ServicesController, AdminServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
