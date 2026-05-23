import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { ExportProcessor, EXPORT_QUEUE, RESUME_PDF_QUEUE } from './export.processor';
import { ExportJob } from '../../database/entities/export-job.entity';
import { Portfolio } from '../../database/entities/portfolio.entity';
import { Resume } from '../../database/entities/resume.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExportJob, Portfolio, Resume]),
    BullModule.registerQueue({ name: EXPORT_QUEUE }, { name: RESUME_PDF_QUEUE }),
  ],
  controllers: [ExportController],
  providers: [ExportService, ExportProcessor],
  exports: [ExportService],
})
export class ExportModule {}
