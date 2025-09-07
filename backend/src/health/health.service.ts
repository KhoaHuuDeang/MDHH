import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  private startTime = Date.now();

  async check() {
    console.log('🩺 Health check called');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.round((Date.now() - this.startTime) / 1000),
      service: 'mdhh-backend',
      port: process.env.PORT,
      nodeEnv: process.env.NODE_ENV
    };
  }

  async detailedCheck() {
    return this.check(); // Same as basic for simplicity
  }

  async readiness() {
    try {
      // Check if application is ready to serve traffic
      // Could check database connection, external services, etc.
      return { status: 'ready', timestamp: new Date().toISOString() };
    } catch (error) {
      throw new Error('Service not ready');
    }
  }

  async liveness() {
    try {
      // Check if application is alive
      // Basic health indicators
      return { status: 'alive', timestamp: new Date().toISOString() };
    } catch (error) {
      throw new Error('Service not responding');
    }
  }
}