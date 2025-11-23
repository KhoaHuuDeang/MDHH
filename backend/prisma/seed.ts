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
    update: {},
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
