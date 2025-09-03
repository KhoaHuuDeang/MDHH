import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) { }

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        uptime: { type: 'number', example: 12345.67 },
        version: { type: 'string', example: '1.0.0' },
        port: { type: 'string', example: '10000' },         
        nodeEnv: { type: 'string', example: 'production' }  
      }
    }
  })
  async check() {
    return this.healthService.check();
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check' })
  @ApiResponse({
    status: 200,
    description: 'Basic health status (same as /health for simplicity)',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        uptime: { type: 'number', example: 12345.67 },
        service: { type: 'string', example: 'mdhh-backend' }
      }
    }
  })
  async detailedCheck() {
    return this.healthService.detailedCheck();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  @ApiResponse({
    status: 200,
    description: 'Application is ready to serve traffic'
  })
  @ApiResponse({
    status: 503,
    description: 'Application is not ready'
  })
  async readiness() {
    try {
      return await this.healthService.readiness();
    } catch (error) {
      throw new HttpException('Service not ready', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  @ApiResponse({
    status: 200,
    description: 'Application is alive'
  })
  @ApiResponse({
    status: 503,
    description: 'Application is not responding'
  })
  async liveness() {
    try {
      return await this.healthService.liveness();
    } catch (error) {
      throw new HttpException('Service not responding', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}