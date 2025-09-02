import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  private startTime = Date.now();

  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.round((Date.now() - this.startTime) / 1000),
      service: 'mdhh-backend'
    };
  }

  async detailedCheck() {
    return this.check(); // Same as basic for simplicity
  }

  async readiness() {
    return { status: 'ready' };
  }

  async liveness() {
    return { status: 'alive' };
  }
}