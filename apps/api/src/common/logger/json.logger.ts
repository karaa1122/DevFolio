import { LoggerService } from '@nestjs/common';

export class JsonLogger implements LoggerService {
  private write(level: string, message: unknown, context?: string, trace?: string) {
    const entry: Record<string, unknown> = {
      level,
      timestamp: new Date().toISOString(),
      pid: process.pid,
      context: context ?? 'App',
      message: typeof message === 'string' ? message : JSON.stringify(message),
    };
    if (trace) entry['trace'] = trace;
    process.stdout.write(JSON.stringify(entry) + '\n');
  }

  log(message: unknown, context?: string) {
    this.write('info', message, context);
  }

  error(message: unknown, trace?: string, context?: string) {
    this.write('error', message, context ?? 'App', trace);
  }

  warn(message: unknown, context?: string) {
    this.write('warn', message, context);
  }

  debug(message: unknown, context?: string) {
    this.write('debug', message, context);
  }

  verbose(message: unknown, context?: string) {
    this.write('verbose', message, context);
  }
}
