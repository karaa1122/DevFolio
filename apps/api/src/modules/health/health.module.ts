import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HealthController } from './health.controller';
import { EXPORT_QUEUE } from '../export/export.processor';

@Module({
  imports: [BullModule.registerQueue({ name: EXPORT_QUEUE })],
  controllers: [HealthController],
})
export class HealthModule {}
