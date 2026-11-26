import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  type ExecutionContext,
} from '@nestjs/common';
import { CurrentUser } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import {
  barberUpdateSchema,
  barberUpsertSchema,
  timeOffCreateSchema,
  workingHoursSchema,
  type AdminBarber,
  type BarberUpsertInput,
  type TimeOffCreateInput,
  type WorkingHoursInput,
} from '@barbershop/shared';
import { StaffPolicy } from '../auth/staff.policy.js';
import type { StaffUser } from '../auth/user.js';
import { idParam } from '../common/schemas.js';
import { BarbersService } from './barbers.service.js';

// Аргумент для політики: id майстра з URL (сирий рядок, guard працює до pipes)
const barberIdArg = (context: ExecutionContext): [string] => [
  context.switchToHttp().getRequest<{ params: { id: string } }>().params.id,
];

@Controller('admin/barbers')
export class AdminBarbersController {
  constructor(private readonly barbers: BarbersService) {}

  /** Адміністратор бачить усіх, майстер лише себе. */
  @Get()
  @Can(StaffPolicy, 'staff')
  list(@CurrentUser() user: StaffUser): Promise<AdminBarber[]> {
    if (user.role === 'ADMIN') return this.barbers.listAdmin();
    return user.barberId
      ? this.barbers.listAdmin(user.barberId)
      : Promise.resolve([]);
  }

  @Post()
  @Can(StaffPolicy, 'manage')
  create(
    @Body({ schema: barberUpsertSchema }) body: BarberUpsertInput,
  ): Promise<AdminBarber> {
    return this.barbers.create(body);
  }

  @Patch(':id')
  @Can(StaffPolicy, 'manage')
  update(
    @Param('id', { schema: idParam }) id: string,
    @Body({ schema: barberUpdateSchema }) body: Partial<BarberUpsertInput>,
  ): Promise<AdminBarber> {
    return this.barbers.update(id, body);
  }

  @Put(':id/hours')
  @Can(StaffPolicy, 'manageBarber', barberIdArg)
  setHours(
    @Param('id', { schema: idParam }) id: string,
    @Body({ schema: workingHoursSchema }) body: WorkingHoursInput,
  ): Promise<AdminBarber> {
    return this.barbers.setWorkingHours(id, body);
  }

  @Post(':id/time-off')
  @Can(StaffPolicy, 'manageBarber', barberIdArg)
  addTimeOff(
    @Param('id', { schema: idParam }) id: string,
    @Body({ schema: timeOffCreateSchema }) body: TimeOffCreateInput,
  ): Promise<AdminBarber> {
    return this.barbers.addTimeOff(id, body);
  }

  @Delete(':id/time-off/:timeOffId')
  @HttpCode(204)
  @Can(StaffPolicy, 'manageBarber', barberIdArg)
  async removeTimeOff(
    @Param('id', { schema: idParam }) id: string,
    @Param('timeOffId', { schema: idParam }) timeOffId: string,
  ): Promise<void> {
    await this.barbers.removeTimeOff(id, timeOffId);
  }
}
