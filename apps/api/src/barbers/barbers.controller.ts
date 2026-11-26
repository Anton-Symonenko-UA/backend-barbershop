import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import type { PublicBarber } from '@barbershop/shared';
import { idParam } from '../common/schemas.js';
import { BarbersService } from './barbers.service.js';

@Public()
@Controller('barbers')
export class BarbersController {
  constructor(private readonly barbers: BarbersService) {}

  @Get()
  list(): Promise<PublicBarber[]> {
    return this.barbers.listPublic();
  }

  @Get(':slug')
  findOne(
    @Param('slug', { schema: idParam }) slug: string,
  ): Promise<PublicBarber> {
    return this.barbers.findPublic(slug);
  }
}
