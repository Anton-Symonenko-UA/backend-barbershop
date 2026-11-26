import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import {
  serviceUpdateSchema,
  serviceUpsertSchema,
  type AdminCategory,
  type AdminService,
  type PublicService,
  type ServiceUpsertInput,
} from '@barbershop/shared';
import { StaffPolicy } from '../auth/staff.policy.js';
import { idParam } from '../common/schemas.js';
import { ServicesService } from './services.service.js';

@Public()
@Controller('services')
export class ServicesController {
  constructor(private readonly services: ServicesService) {}

  @Get()
  list(): Promise<PublicService[]> {
    return this.services.listPublic();
  }
}

@Controller('admin')
export class AdminServicesController {
  constructor(private readonly services: ServicesService) {}

  @Get('services')
  @Can(StaffPolicy, 'staff')
  list(): Promise<AdminService[]> {
    return this.services.listAdmin();
  }

  @Get('categories')
  @Can(StaffPolicy, 'staff')
  categories(): Promise<AdminCategory[]> {
    return this.services.listCategories();
  }

  @Post('services')
  @Can(StaffPolicy, 'manage')
  create(
    @Body({ schema: serviceUpsertSchema }) body: ServiceUpsertInput,
  ): Promise<AdminService> {
    return this.services.create(body);
  }

  @Patch('services/:id')
  @Can(StaffPolicy, 'manage')
  update(
    @Param('id', { schema: idParam }) id: string,
    @Body({ schema: serviceUpdateSchema }) body: Partial<ServiceUpsertInput>,
  ): Promise<AdminService> {
    return this.services.update(id, body);
  }
}
