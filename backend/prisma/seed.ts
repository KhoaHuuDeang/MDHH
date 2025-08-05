import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaService();

async function main() {
    console.log('🌱 Starting seed...');
    const [adminRole, userRole] = await Promise.all([
        prisma.roles.upsert({
            where: { name: 'ADMIN' },
            update: {},
            create: {
                name: 'ADMIN',
                description: 'Administrator with full access',
            },
        }),
        prisma.roles.upsert({
            where: { name: 'USER' },
            update: {},
            create: {
                name: 'USER',
                description: 'Regular user with limited access',
            },
        }),
    ]);
    console.log('✅ rolesss created: admin, user');    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash('password123', 10); await prisma.users.createMany({
        data: [
            {
                email: 'admin@example.com',
                username: 'admin',
                displayname: 'Admin User',
                password: hashedPassword,
                role_name: adminRole.name!,
                birth: '1990-01-01',
            },
            {
                email: 'user1@example.com',
                username: 'user1',
                displayname: 'Regular User 1',
                password: hashedPassword,
                role_name: userRole.name!,
                birth: '1995-06-15',
            }
        ],
        skipDuplicates: true,
    });

    console.log('✅ Users created: admin@example.com, user1@example.com');
    console.log('📝 Test credentials: password123 for all users');
    const classificationLevels = [
        {
            name: 'Đại học',
            description: 'University level education - Advanced topics and research'
        },
        {
            name: 'THPT',
            description: 'Senior High School - Grades 10-12'
        },
        {
            name: 'THCS',
            description: 'Junior High School - Grades 6-9'
        },
        {
            name: 'Ngoại Ngữ',
            description: 'Foreign Language Learning - All levels'
        },
        {
            name: 'ĐGNL-Tư-Duy',
            description: 'General Aptitude and Critical Thinking'
        },
    ];

    for (const level of classificationLevels) {
        const createdLevel = await prisma.classification_levels.upsert({
            where: { name: level.name },
            update: level,
            create: level,
        });

        // Sample tags for each level
        const tagsByLevel = {
            'Đại học': ['Vật lý lượng tử', 'Cấu trúc dữ liệu', 'Toán cao cấp', 'Lập trình'],
            'THPT': ['Toán học', 'Vật lý', 'Hóa học', 'Sinh học', 'Lịch sử'],
            'THCS': ['Toán cơ bản', 'Khoa học tự nhiên', 'Ngữ văn', 'Tiếng Anh'],
            'Ngoại Ngữ': ['IELTS', 'TOEFL', 'Grammar', 'Vocabulary', 'Speaking'],
            'ĐGNL-Tư-Duy': ['Logic', 'Phân tích', 'Tư duy phản biện', 'Giải quyết vấn đề'],
        };

        const tags = tagsByLevel[level.name] || [];
        for (const tagName of tags) {
            await prisma.tags.upsert({
                where: {
                    name_level_id: {
                        name: tagName,
                        level_id: createdLevel.id
                    }
                },
                update: {},
                create: {
                    name: tagName,
                    level_id: createdLevel.id,
                    description: `${tagName} related content`
                },
            });
        }
    }
}
main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

