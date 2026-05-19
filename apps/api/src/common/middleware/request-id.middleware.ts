import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const id = (req.headers['x-request-id'] as string) || randomUUID();
    req.headers['x-request-id'] = id;
    res.setHeader('X-Request-ID', id);
    next();
  }
}
