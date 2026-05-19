import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Public } from '../../common/decorators/public.decorator';
import { EXPORT_QUEUE } from '../export/export.processor';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectQueue(EXPORT_QUEUE) private readonly exportQueue: Queue,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness + readiness check' })
  async check() {
    const checks = await Promise.allSettled([
      this.dataSource.query('SELECT 1'),
      this.exportQueue.getWorkers(),
    ]);

    const db = checks[0].status === 'fulfilled' ? 'ok' : 'error';
    const redis = checks[1].status === 'fulfilled' ? 'ok' : 'error';
    const healthy = db === 'ok' && redis === 'ok';

    return {
      status: healthy ? 'ok' : 'degraded',
      checks: { db, redis },
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
