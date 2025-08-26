/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-argument */
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';

describe('UsersService.update', () => {
  let service: UsersService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      users: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      roles: {
        findUnique: jest.fn(),
      },
    } as any;
    service = new UsersService(prisma);
  });

  it('throws ConflictException when email already exists', async () => {
    prisma.users.findUnique.mockResolvedValueOnce({
      id: '1',
      email: 'old@example.com',
      username: 'user1',
      password: 'hash',
    });
    prisma.users.findFirst.mockResolvedValueOnce({ id: '2' });

    await expect(
      service.update('1', { email: 'taken@example.com' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it('updates user when email is available', async () => {
    prisma.users.findUnique.mockResolvedValueOnce({
      id: '1',
      email: 'old@example.com',
      username: 'user1',
      password: 'hash',
    });
    prisma.users.findFirst.mockResolvedValueOnce(null);
    prisma.users.update.mockResolvedValueOnce({
      id: '1',
      email: 'new@example.com',
      username: 'user1',
      password: 'hashed',
      roles: [],
    });

    const result = await service.update('1', { email: 'new@example.com' });
    expect(prisma.users.update).toHaveBeenCalled();
    expect(result).toEqual({
      id: '1',
      email: 'new@example.com',
      username: 'user1',
      roles: [],
    });
  });
});
