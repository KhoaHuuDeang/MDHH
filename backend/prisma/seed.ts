import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');
    const [adminRole, userRole] = await Promise.all([
        prisma.role.upsert({
            where: { name: 'admin' },
            update: {},
            create: {
                name: 'admin',
                description: 'Administrator with full access',
            },
        }),
        prisma.role.upsert({
            where: { name: 'user' },
            update: {},
            create: {
                name: 'user',
                description: 'Regular user with limited access',
            },
        }),
    ]);
    console.log('✅ Roles created: admin, user');
    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash('password123', 10);

    await prisma.user.createMany({
        data: [
            {
                email: 'admin@example.com',
                username: 'admin',
                displayname: 'Admin User',
                password: '1234',
                roleId: adminRole.id,
            },
            {
                email: 'user1@example.com',
                username: 'user',
                displayname: 'Regular User 1',
                password: hashedPassword,
                roleId: userRole.id,
            }
        ],
        skipDuplicates: true,
    });

    console.log('✅ Users created: admin@example.com, user1@example.com, user2@example.com');
    console.log('📝 Test credentials: password123 for all users');

}
main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

