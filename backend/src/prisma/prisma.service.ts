// src/prisma.service.ts - SIMPLE & CLEAN
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: ['error'],
      // Increase transaction timeout to 30 seconds to handle email sending
      transactionOptions: {
        maxWait: 30000, // Max time to wait for transaction to start (30s)
        timeout: 30000, // Max time transaction can run (30s)
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Database disconnected');
  }
}