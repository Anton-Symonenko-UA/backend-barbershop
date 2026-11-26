import { Controller, Get, Header, Query } from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import {
  availabilityQuerySchema,
  type Availability,
  type AvailabilityQuery,
} from '@barbershop/shared';
import { AvailabilityService } from './availability.service.js';

@Public()
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availability: AvailabilityService) {}

  /** Вільні слоти на дату. Без barberId: усі майстри, що роблять послугу. */
  @Get()
  @Header('Cache-Control', 'no-store')
  get(
    @Query({ schema: availabilityQuerySchema }) query: AvailabilityQuery,
  ): Promise<Availability> {
    return this.availability.getAvailability(query);
  }
}
