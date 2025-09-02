import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

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
        version: { type: 'string', example: '1.0.0' }
      }
    }
  })
  async check() {
    return this.healthService.check();
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check with dependencies' })
  @ApiResponse({ 
    status: 200, 
    description: 'Detailed health status including dependencies',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string' },
        uptime: { type: 'number' },
        version: { type: 'string' },
        dependencies: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'ok' },
                responseTime: { type: 'number', example: 15.5 }
              }
            },
            storage: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'ok' },
                region: { type: 'string', example: 'ap-southeast-1' }
              }
            }
          }
        },
        system: {
          type: 'object',
          properties: {
            memory: {
              type: 'object',
              properties: {
                used: { type: 'number' },
                total: { type: 'number' },
                percentage: { type: 'number' }
              }
            },
            cpu: {
              type: 'object',
              properties: {
                usage: { type: 'number' }
              }
            }
          }
        }
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
    return this.healthService.readiness();
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
    return this.healthService.liveness();
  }
}