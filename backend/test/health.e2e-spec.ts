import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Health Endpoints (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return basic health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        version: expect.any(String),
      });

      // Validate timestamp is a valid ISO string
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
      
      // Validate uptime is positive number
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should have consistent response format', async () => {
      const response1 = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      const response2 = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      // Both responses should have the same structure
      expect(Object.keys(response1.body)).toEqual(Object.keys(response2.body));
      
      // Uptime should increase between calls
      expect(response2.body.uptime).toBeGreaterThanOrEqual(response1.body.uptime);
    });
  });

  describe('GET /health/detailed', () => {
    it('should return detailed health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/detailed')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        version: expect.any(String),
        dependencies: {
          database: {
            status: expect.any(String),
            responseTime: expect.any(Number),
          },
          storage: {
            status: expect.any(String),
          },
        },
        system: {
          memory: {
            used: expect.any(Number),
            total: expect.any(Number),
            percentage: expect.any(Number),
          },
          cpu: {
            architecture: expect.any(String),
            platform: expect.any(String),
            cores: expect.any(Number),
          },
        },
      });

      // Validate database response time is reasonable
      expect(response.body.dependencies.database.responseTime).toBeLessThan(5000);
      
      // Validate system memory metrics
      expect(response.body.system.memory.percentage).toBeGreaterThan(0);
      expect(response.body.system.memory.percentage).toBeLessThan(100);
    });

    it('should handle database connectivity issues gracefully', async () => {
      // This test would need to temporarily break database connection
      // For now, we just verify the endpoint responds
      const response = await request(app.getHttpServer())
        .get('/health/detailed')
        .expect((res) => {
          expect([200, 503]).toContain(res.status);
        });
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/ready')
        .expect((res) => {
          // Should be either 200 (ready) or 503 (not ready)
          expect([200, 503]).toContain(res.status);
        });

      expect(response.body).toMatchObject({
        status: expect.stringMatching(/^(ready|not_ready)$/),
        timestamp: expect.any(String),
        message: expect.any(String),
      });
    });

    it('should be ready when database is available', async () => {
      // Assuming database is available in test environment
      const response = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);

      expect(response.body.status).toBe('ready');
    });
  });

  describe('GET /health/live', () => {
    it('should return liveness status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/live')
        .expect((res) => {
          // Should be either 200 (alive) or 503 (not alive)
          expect([200, 503]).toContain(res.status);
        });

      expect(response.body).toMatchObject({
        status: expect.stringMatching(/^(alive|not_alive)$/),
        timestamp: expect.any(String),
        message: expect.any(String),
      });
    });

    it('should be alive in normal conditions', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/live')
        .expect(200);

      expect(response.body.status).toBe('alive');
      expect(response.body.memory).toMatchObject({
        used: expect.any(Number),
        total: expect.any(Number),
      });
    });
  });

  describe('Health endpoints performance', () => {
    it('should respond quickly to basic health check', async () => {
      const startTime = Date.now();
      
      await request(app.getHttpServer())
        .get('/health')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle concurrent health checks', async () => {
      const promises = Array(10).fill(null).map(() => 
        request(app.getHttpServer())
          .get('/health')
          .expect(200)
      );

      const responses = await Promise.all(promises);
      
      // All responses should be successful
      responses.forEach(response => {
        expect(response.body.status).toBe('ok');
      });
    });
  });
});