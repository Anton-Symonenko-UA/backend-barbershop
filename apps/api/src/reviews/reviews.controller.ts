import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import { Throttle } from '@nestjs/throttler';
import { z } from 'zod';
import {
  reviewCreateSchema,
  reviewModerationSchema,
  type AdminReview,
  type ReviewCreateInput,
  type ReviewsSummary,
} from '@barbershop/shared';
import { StaffPolicy } from '../auth/staff.policy.js';
import { idParam } from '../common/schemas.js';
import { ReviewsService } from './reviews.service.js';

@Public()
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get()
  summary(): Promise<ReviewsSummary> {
    return this.reviews.summary();
  }

  @Post()
  @Throttle({ default: { limit: 3, ttl: 60 * 60_000 } })
  submit(@Body({ schema: reviewCreateSchema }) body: ReviewCreateInput) {
    return this.reviews.submit(body);
  }
}

@Controller('admin/reviews')
export class AdminReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get()
  @Can(StaffPolicy, 'manage')
  list(): Promise<AdminReview[]> {
    return this.reviews.listAdmin();
  }

  @Patch(':id')
  @Can(StaffPolicy, 'manage')
  moderate(
    @Param('id', { schema: idParam }) id: string,
    @Body({ schema: reviewModerationSchema })
    body: z.infer<typeof reviewModerationSchema>,
  ): Promise<AdminReview> {
    return this.reviews.setPublished(id, body.isPublished);
  }

  @Delete(':id')
  @HttpCode(204)
  @Can(StaffPolicy, 'manage')
  async remove(@Param('id', { schema: idParam }) id: string): Promise<void> {
    await this.reviews.remove(id);
  }
}
