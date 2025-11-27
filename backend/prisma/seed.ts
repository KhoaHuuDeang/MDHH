import { PrismaClient, RoleType } from '@prisma/client';

const prisma = new PrismaClient();

import { Visibility } from '@prisma/client';

async function main() {
  console.log('Starting database seed...');

  // Seed default roles
  console.log('Seeding roles...');

  const userRole = await prisma.roles.upsert({
    where: { name: RoleType.USER },
    update: {},
    create: {
      name: RoleType.USER,
      description: 'Standard user with basic permissions',
    },
  });

  const adminRole = await prisma.roles.upsert({
    where: { name: RoleType.ADMIN },
    update: {},
    create: {
      name: RoleType.ADMIN,
      description: 'Administrator with full system access',
    },
  });

  console.log('Roles seeded successfully:');
  console.log('  - USER role:', userRole.id);
  console.log('  - ADMIN role:', adminRole.id);

  // Seed test users
  console.log('\nSeeding test users...');
  
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('Test1234!', 12);

  const testUser = await prisma.users.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      username: 'testuser',
      displayname: 'Test User',
      password: hashedPassword,
      birth: '1990-01-01',
      email_verified: true,
      role_id: userRole.id,
      is_disabled: false,
    },
  });

  const testAdmin = await prisma.users.upsert({
    where: { email: 'admin@test.com' },
    update: {
      role_id: adminRole.id,
    },
    create: {
      email: 'admin@test.com',
      username: 'testadmin',
      displayname: 'Test Admin',
      password: hashedPassword,
      birth: '1985-01-01',
      email_verified: true,
      role_id: adminRole.id,
      is_disabled: false,
    },
  });

  console.log('Test users seeded successfully:');
  console.log('  - USER:', testUser.email, '(password: Test1234!)');
  console.log('  - ADMIN:', testAdmin.email, '(password: Test1234!)');

  // Seed classification levels
  console.log('\nSeeding classification levels...');

  const publicLevel = await prisma.classification_levels.upsert({
    where: { name: 'Public' },
    update: {},
    create: {
      name: 'Public',
      description: 'Publicly accessible resources',
    },
  });

  const internalLevel = await prisma.classification_levels.upsert({
    where: { name: 'Internal' },
    update: {},
    create: {
      name: 'Internal',
      description: 'Internal use only',
    },
  });

  const confidentialLevel = await prisma.classification_levels.upsert({
    where: { name: 'Confidential' },
    update: {},
    create: {
      name: 'Confidential',
      description: 'Confidential information',
    },
  });

  const restrictedLevel = await prisma.classification_levels.upsert({
    where: { name: 'Restricted' },
    update: {},
    create: {
      name: 'Restricted',
      description: 'Restricted access only',
    },
  });

  console.log('Classification levels seeded successfully:');
  console.log('  - Public:', publicLevel.id);
  console.log('  - Internal:', internalLevel.id);
  console.log('  - Confidential:', confidentialLevel.id);
  console.log('  - Restricted:', restrictedLevel.id);

  // Seed tags
  console.log('\nSeeding tags...');

  const tagData = [
    // Public tags
    { name: 'General', description: 'General resources', level_id: publicLevel.id },
    { name: 'Tutorial', description: 'Tutorial materials', level_id: publicLevel.id },
    { name: 'Documentation', description: 'Documentation files', level_id: publicLevel.id },

    // Internal tags
    { name: 'Team', description: 'Team resources', level_id: internalLevel.id },
    { name: 'Project', description: 'Project files', level_id: internalLevel.id },
    { name: 'Meeting', description: 'Meeting notes', level_id: internalLevel.id },

    // Confidential tags
    { name: 'HR', description: 'Human Resources', level_id: confidentialLevel.id },
    { name: 'Financial', description: 'Financial data', level_id: confidentialLevel.id },
    { name: 'Legal', description: 'Legal documents', level_id: confidentialLevel.id },

    // Restricted tags
    { name: 'Executive', description: 'Executive only', level_id: restrictedLevel.id },
    { name: 'Security', description: 'Security information', level_id: restrictedLevel.id },
    { name: 'Strategic', description: 'Strategic planning', level_id: restrictedLevel.id },
  ];

  const createdTags: any[] = [];
  for (const tag of tagData) {
    const created = await prisma.tags.upsert({
      where: {
        name_level_id: {
          name: tag.name,
          level_id: tag.level_id
        }
      },
      update: {},
      create: tag,
    });
    createdTags.push(created);
  }

  console.log(`Tags seeded successfully: ${tagData.length} tags created`);

  // Seed folders
  console.log('\nSeeding folders...');

  const userFolder1 = await prisma.folders.create({
    data: {
      name: 'My Documents',
      description: 'Personal documents and files',
      visibility: Visibility.PUBLIC,
      user_id: testUser.id,
      classification_level_id: publicLevel.id,
    },
  });

  const userFolder2 = await prisma.folders.create({
    data: {
      name: 'Team Projects',
      description: 'Collaborative team projects',
      visibility: Visibility.PUBLIC,
      user_id: testUser.id,
      classification_level_id: internalLevel.id,
    },
  });

  const adminFolder = await prisma.folders.create({
    data: {
      name: 'Confidential Files',
      description: 'Sensitive company information',
      visibility: Visibility.PRIVATE,
      user_id: testAdmin.id,
      classification_level_id: confidentialLevel.id,
    },
  });

  console.log('Folders seeded successfully:');
  console.log('  - User folder 1:', userFolder1.name);
  console.log('  - User folder 2:', userFolder2.name);
  console.log('  - Admin folder:', adminFolder.name);

  // Seed resources and uploads
  console.log('\nSeeding resources and uploads...');

  const resource1 = await prisma.resources.create({
    data: {
      title: 'Getting Started Guide',
      description: 'A comprehensive guide for new users',
      category: 'Documentation',
      visibility: Visibility.PUBLIC,
    },
  });

  const resource2 = await prisma.resources.create({
    data: {
      title: 'Q1 Financial Report',
      description: 'Quarterly financial summary',
      category: 'Reports',
      visibility: Visibility.PRIVATE,
    },
  });

  const resource3 = await prisma.resources.create({
    data: {
      title: 'Team Meeting Notes - Nov 2025',
      description: 'Notes from the monthly team meeting',
      category: 'Meeting',
      visibility: Visibility.PUBLIC,
    },
  });

  // Create uploads for resources
  await prisma.uploads.create({
    data: {
      user_id: testUser.id,
      resource_id: resource1.id,
      file_name: 'getting-started.pdf',
      mime_type: 'application/pdf',
      file_size: 1024 * 500, // 500KB
      s3_key: 'uploads/getting-started.pdf',
      status: 'COMPLETED',
      moderation_status: 'APPROVED',
      moderated_by: testAdmin.id,
      moderated_at: new Date(),
      uploaded_at: new Date(),
    },
  });

  await prisma.uploads.create({
    data: {
      user_id: testAdmin.id,
      resource_id: resource2.id,
      file_name: 'q1-report.xlsx',
      mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      file_size: 1024 * 1024 * 2, // 2MB
      s3_key: 'uploads/q1-report.xlsx',
      status: 'COMPLETED',
      moderation_status: 'PENDING_APPROVAL',
      uploaded_at: new Date(),
    },
  });

  await prisma.uploads.create({
    data: {
      user_id: testUser.id,
      resource_id: resource3.id,
      file_name: 'meeting-notes-nov.docx',
      mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      file_size: 1024 * 250, // 250KB
      s3_key: 'uploads/meeting-notes-nov.docx',
      status: 'COMPLETED',
      moderation_status: 'REJECTED',
      moderation_reason: 'Inappropriate content',
      moderated_by: testAdmin.id,
      moderated_at: new Date(),
      uploaded_at: new Date(),
    },
  });

  console.log('Resources and uploads seeded successfully:');
  console.log('  - Resource 1:', resource1.title);
  console.log('  - Resource 2:', resource2.title);
  console.log('  - Resource 3:', resource3.title);

  // Link resources to folders
  await prisma.folder_files.create({
    data: {
      folder_id: userFolder1.id,
      resource_id: resource1.id,
    },
  });

  await prisma.folder_files.create({
    data: {
      folder_id: userFolder2.id,
      resource_id: resource3.id,
    },
  });

  await prisma.folder_files.create({
    data: {
      folder_id: adminFolder.id,
      resource_id: resource2.id,
    },
  });

  // Seed votes/ratings
  console.log('\nSeeding votes...');

  const rating1 = await prisma.ratings.create({
    data: {
      user_id: testUser.id,
      value: 1, // upvote
      rated_at: new Date(),
    },
  });

  const rating2 = await prisma.ratings.create({
    data: {
      user_id: testAdmin.id,
      value: 1, // upvote
      rated_at: new Date(),
    },
  });

  await prisma.ratings_resources.create({
    data: {
      rating_id: rating1.id,
      resource_id: resource1.id,
    },
  });

  await prisma.ratings_resources.create({
    data: {
      rating_id: rating2.id,
      resource_id: resource1.id,
    },
  });

  await prisma.ratings_folders.create({
    data: {
      rating_id: rating1.id,
      folder_id: userFolder1.id,
    },
  });

  console.log('Votes seeded successfully');

  // Seed souvenirs
  console.log('\nSeeding souvenirs...');

  const souvenirs = [
    {
      name: 'MDHH T-Shirt',
      description: 'Official MDHH branded t-shirt',
      price: 150000,
      stock: 50,
      image_url: 'https://via.placeholder.com/300x300?text=MDHH+T-Shirt',
      is_active: true,
    },
    {
      name: 'MDHH Mug',
      description: 'Ceramic mug with MDHH logo',
      price: 80000,
      stock: 100,
      image_url: 'https://via.placeholder.com/300x300?text=MDHH+Mug',
      is_active: true,
    },
    {
      name: 'MDHH Notebook',
      description: 'Premium notebook for note-taking',
      price: 120000,
      stock: 75,
      image_url: 'https://via.placeholder.com/300x300?text=MDHH+Notebook',
      is_active: true,
    },
    {
      name: 'MDHH Keychain',
      description: 'Metal keychain with logo',
      price: 30000,
      stock: 200,
      image_url: 'https://via.placeholder.com/300x300?text=MDHH+Keychain',
      is_active: true,
    },
    {
      name: 'MDHH Sticker Pack',
      description: 'Set of 5 vinyl stickers',
      price: 25000,
      stock: 150,
      image_url: 'https://via.placeholder.com/300x300?text=MDHH+Stickers',
      is_active: true,
    },
  ];

  for (const souvenir of souvenirs) {
    await prisma.souvenirs.create({ data: souvenir });
  }

  console.log(`Souvenirs seeded successfully: ${souvenirs.length} items`);

  // Seed test activities/logs
  console.log('\nSeeding test activities...');

  await prisma.logs.createMany({
    data: [
      {
        user_id: testUser.id,
        actor_id: testUser.id,
        type: 'UPLOAD_SUCCESS',
        entity_type: 'resource',
        entity_id: resource1.id,
        message: 'You uploaded Đề thi Giải tích 1',
        is_read: true,
      },
      {
        user_id: testUser.id,
        actor_id: testAdmin.id,
        type: 'UPVOTE',
        entity_type: 'resource',
        entity_id: resource1.id,
        message: 'Test Admin upvoted your resource',
        is_read: true,
      },
      {
        user_id: testUser.id,
        actor_id: testAdmin.id,
        type: 'COMMENT',
        entity_type: 'resource',
        entity_id: resource1.id,
        message: 'Test Admin commented on your resource',
        is_read: false,
      },
      {
        user_id: testUser.id,
        actor_id: testUser.id,
        type: 'UPLOAD_SUCCESS',
        entity_type: 'resource',
        entity_id: resource2.id,
        message: 'You uploaded Slide Java cơ bản',
        is_read: true,
      },
    ],
  });

  console.log('Test activities seeded successfully');

  // Seed sample orders
  console.log('\nSeeding sample orders...');

  const allSouvenirs = await prisma.souvenirs.findMany();

  // Order 1: PAID order for testUser
  const order1 = await prisma.orders.create({
    data: {
      user_id: testUser.id,
      total_amount: 350000,
      status: 'PAID',
      payment_method: 'VNPAY',
      payment_ref: 'VNP001234',
      created_at: new Date('2025-11-20T10:30:00Z'),
      updated_at: new Date('2025-11-20T10:35:00Z'),
    },
  });

  await prisma.order_items.createMany({
    data: [
      {
        order_id: order1.id,
        souvenir_id: allSouvenirs[0].id, // T-Shirt
        quantity: 2,
        price: 150000,
      },
      {
        order_id: order1.id,
        souvenir_id: allSouvenirs[3].id, // Keychain
        quantity: 1,
        price: 30000,
      },
    ],
  });

  // Order 2: PROCESSING order for testUser
  const order2 = await prisma.orders.create({
    data: {
      user_id: testUser.id,
      total_amount: 200000,
      status: 'PROCESSING',
      payment_method: 'VNPAY',
      payment_ref: 'VNP001235',
      created_at: new Date('2025-11-22T14:20:00Z'),
      updated_at: new Date('2025-11-22T14:25:00Z'),
    },
  });

  await prisma.order_items.createMany({
    data: [
      {
        order_id: order2.id,
        souvenir_id: allSouvenirs[1].id, // Mug
        quantity: 2,
        price: 80000,
      },
    ],
  });

  // Order 3: PENDING order for testAdmin
  const order3 = await prisma.orders.create({
    data: {
      user_id: testAdmin.id,
      total_amount: 370000,
      status: 'PENDING',
      payment_method: 'VNPAY',
      created_at: new Date('2025-11-24T09:15:00Z'),
      updated_at: new Date('2025-11-24T09:15:00Z'),
    },
  });

  await prisma.order_items.createMany({
    data: [
      {
        order_id: order3.id,
        souvenir_id: allSouvenirs[2].id, // Notebook
        quantity: 3,
        price: 120000,
      },
    ],
  });

  // Order 4: COMPLETED order for testUser
  const order4 = await prisma.orders.create({
    data: {
      user_id: testUser.id,
      total_amount: 75000,
      status: 'COMPLETED',
      payment_method: 'VNPAY',
      payment_ref: 'VNP001236',
      created_at: new Date('2025-11-18T16:00:00Z'),
      updated_at: new Date('2025-11-19T10:00:00Z'),
    },
  });

  await prisma.order_items.createMany({
    data: [
      {
        order_id: order4.id,
        souvenir_id: allSouvenirs[4].id, // Sticker Pack
        quantity: 3,
        price: 25000,
      },
    ],
  });

  // Order 5: CANCELLED order for testAdmin
  const order5 = await prisma.orders.create({
    data: {
      user_id: testAdmin.id,
      total_amount: 150000,
      status: 'CANCELLED',
      payment_method: 'VNPAY',
      created_at: new Date('2025-11-25T11:30:00Z'),
      updated_at: new Date('2025-11-25T12:00:00Z'),
    },
  });

  await prisma.order_items.createMany({
    data: [
      {
        order_id: order5.id,
        souvenir_id: allSouvenirs[0].id, // T-Shirt
        quantity: 1,
        price: 150000,
      },
    ],
  });

  // Order 6: REFUNDED order for testUser
  const order6 = await prisma.orders.create({
    data: {
      user_id: testUser.id,
      total_amount: 240000,
      status: 'REFUNDED',
      payment_method: 'VNPAY',
      payment_ref: 'VNP001237',
      created_at: new Date('2025-11-15T13:45:00Z'),
      updated_at: new Date('2025-11-16T09:30:00Z'),
    },
  });

  await prisma.order_items.createMany({
    data: [
      {
        order_id: order6.id,
        souvenir_id: allSouvenirs[2].id, // Notebook
        quantity: 2,
        price: 120000,
      },
    ],
  });

  console.log(`Sample orders seeded successfully: 6 orders created`);

  console.log('\n========================================');
  console.log('Database seed completed successfully!');
  console.log('========================================');
  console.log('\n=== TEST CREDENTIALS ===');
  console.log('USER: user@test.com / Test1234!');
  console.log('ADMIN: admin@test.com / Test1234!');
  console.log('========================');
  console.log('\n=== TEST DATA ===');
  console.log('Folders: 3 (2 user, 1 admin)');
  console.log('Resources: 3 with uploads');
  console.log('Votes: 3 ratings');
  console.log('Souvenirs: 5 items');
  console.log('Orders: 6 orders with various statuses');
  console.log('Activities: 4 logs for user');
  console.log('================');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
