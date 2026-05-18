import { Injectable } from '@nestjs/common';

export const EXPORT_QUEUE = 'export-portfolio';

export interface ExportJobData {
  portfolioId: string;
  exportJobId: string;
}

// Not decorated with @Processor — the external export-worker service is the
// sole BullMQ consumer of this queue. This class exists only to export the
// queue name constant and job-data type used by ExportService and ExportModule.
@Injectable()
export class ExportProcessor {}
