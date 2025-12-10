import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  describe('check', () => {
    it('should return basic health status', async () => {
      const result = await service.check();

      expect(result).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        service: 'mdhh-backend'
      });

      expect(result.status).toBe('ok');
      expect(result.service).toBe('mdhh-backend');
    });
  });

  describe('detailedCheck', () => {
    it('should return same as basic check', async () => {
      const result = await service.detailedCheck();

      expect(result).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        service: 'mdhh-backend'
      });
      expect(result.status).toBe('ok');
      expect(result.service).toBe('mdhh-backend');
    });
  });

  describe('readiness', () => {
    it('should return ready status', async () => {
      const result = await service.readiness();

      expect(result).toMatchObject({
        status: 'ready',
        timestamp: expect.any(String)
      });
    });
  });

  describe('liveness', () => {
    it('should return alive status', async () => {
      const result = await service.liveness();

      expect(result).toMatchObject({
        status: 'alive',
        timestamp: expect.any(String)
      });
    });
  });
});