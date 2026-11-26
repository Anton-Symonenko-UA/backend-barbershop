import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import type { Env } from '../config/env.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService<Env, true>) {
    super({
      adapter: new PrismaPg({
        connectionString: config.get('DATABASE_URL', { infer: true }),
        // Локальний `prisma dev` (PGlite) обслуговує лише одне з'єднання за раз:
        // з більшим пулом паралельні запити плутають відповіді. Там DATABASE_POOL_MAX=1.
        max: config.get('DATABASE_POOL_MAX', { infer: true }),
      }),
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
