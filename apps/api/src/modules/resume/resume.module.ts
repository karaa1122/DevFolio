import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ResumeService, RESUME_EXPORT_QUEUE } from './resume.service';
import { ResumeController } from './resume.controller';
import { Resume } from '../../database/entities/resume.entity';
import { Portfolio } from '../../database/entities/portfolio.entity';
import { ExportJob } from '../../database/entities/export-job.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resume, Portfolio, ExportJob]),
    BullModule.registerQueue({ name: RESUME_EXPORT_QUEUE }),
  ],
  controllers: [ResumeController],
  providers: [ResumeService],
  exports: [ResumeService],
})
export class ResumeModule {}
