import { Injectable } from '@nestjs/common';

export const EXPORT_QUEUE = 'export-portfolio';
export const RESUME_PDF_QUEUE = 'export-resume-pdf';

export interface ExportJobData {
  portfolioId: string;
  exportJobId: string;
}

export interface ResumePdfJobData {
  resumeId: string;
  exportJobId: string;
}

// Not decorated with @Processor — the external export-worker service is the
// sole BullMQ consumer of these queues. This class exists only to export the
// queue name constants used by ExportService and ExportModule.
@Injectable()
export class ExportProcessor {}
