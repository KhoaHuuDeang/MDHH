import { PrismaClient } from '@prisma/client';

// Global test setup
let prisma: PrismaClient;

beforeAll(async () => {
  // Initialize Prisma client for testing
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mdhh_test',
      },
    },
  });

  // Run migrations
  try {
    await prisma.$executeRaw`SELECT 1`;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
});

afterAll(async () => {
  // Cleanup database connections
  if (prisma) {
    await prisma.$disconnect();
  }
});

// Global test utilities
declare global {
  var __PRISMA__: PrismaClient;
}

global.__PRISMA__ = prisma;

// Extend Jest matchers
expect.extend({
  toBeValidUUID(received) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },
});

// Test helper functions
export const clearDatabase = async () => {
  // Clear all tables in correct order (respecting foreign key constraints)
  const tableNames = [
    'votes',
    'comments', 
    'user_resources',
    'resources',
    'folders',
    'user_tags',
    'tags',
    'sessions',
    'accounts', 
    'users',
    'classification_levels'
  ];

  for (const tableName of tableNames) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM ${tableName};`);
    } catch (error) {
      // Some tables might not exist or might be empty
      console.warn(`Could not clear table ${tableName}:`, error.message);
    }
  }
};

export const createTestUser = async (overrides = {}) => {
  return await prisma.users.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'testuser',
      email: 'test@example.com',
      discord_id: '123456789',
      avatar_url: 'https://example.com/avatar.jpg',
      is_banned: false,
      ban_reason: null,
      banned_until: null,
      role: 'USER',
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    },
  });
};

export const createTestClassificationLevel = async (overrides = {}) => {
  return await prisma.classification_levels.create({
    data: {
      id: '660e8400-e29b-41d4-a716-446655440001',
      name: 'Test Level',
      description: 'Test classification level',
      created_at: new Date(),
      ...overrides,
    },
  });
};

// Mock external services for testing
export const mockAWSService = {
  generatePresignedUrl: jest.fn().mockResolvedValue('https://example.com/presigned-url'),
  deleteObject: jest.fn().mockResolvedValue(undefined),
};

export const mockVirusScanner = {
  scanFile: jest.fn().mockResolvedValue({ isClean: true }),
};