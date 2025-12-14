import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function resetAndSeed() {
  console.log('🔄 Starting complete database reset and seed...\n');

  try {
    // Step 1: Reset all data
    console.log('═══════════════════════════════════════');
    console.log('   STEP 1: RESETTING ALL DATA');
    console.log('═══════════════════════════════════════\n');

    // Delete all ratings (they reference comments, folders, resources)
    console.log('📊 Deleting ratings...');
    await prisma.ratings_comments.deleteMany({});
    await prisma.ratings_folders.deleteMany({});
    await prisma.ratings_resources.deleteMany({});
    await prisma.ratings.deleteMany({});
    console.log('✅ Ratings deleted\n');

    // Delete all notification targets
    console.log('🔔 Deleting notification targets...');
    await prisma.notification_targets.deleteMany({});
    console.log('✅ Notification targets deleted\n');

    // Delete all downloads
    console.log('⬇️  Deleting downloads...');
    await prisma.downloads.deleteMany({});
    console.log('✅ Downloads deleted\n');

    // Delete all follows
    console.log('👥 Deleting follows...');
    await prisma.follows.deleteMany({});
    console.log('✅ Follows deleted\n');

    // Delete all comments
    console.log('💬 Deleting comments...');
    await prisma.comments.deleteMany({});
    console.log('✅ Comments deleted\n');

    // Delete folder-related junction tables
    console.log('📁 Deleting folder associations...');
    await prisma.folder_files.deleteMany({});
    await prisma.folder_tags.deleteMany({});
    console.log('✅ Folder associations deleted\n');

    // Delete all folders
    console.log('📁 Deleting folders...');
    await prisma.folders.deleteMany({});
    console.log('✅ Folders deleted\n');

    // Delete resource-tag associations
    console.log('🏷️  Deleting resource-tag associations...');
    await prisma.resource_tags.deleteMany({});
    console.log('✅ Resource-tag associations deleted\n');

    // Delete all uploads
    console.log('📤 Deleting uploads...');
    await prisma.uploads.deleteMany({});
    console.log('✅ Uploads deleted\n');

    // Delete all resources
    console.log('📄 Deleting resources...');
    await prisma.resources.deleteMany({});
    console.log('✅ Resources deleted\n');

    // Delete all tags
    console.log('🏷️  Deleting tags...');
    await prisma.tags.deleteMany({});
    console.log('✅ Tags deleted\n');

    // Delete all classification levels
    console.log('📊 Deleting classification levels...');
    await prisma.classification_levels.deleteMany({});
    console.log('✅ Classification levels deleted\n');

    console.log('═══════════════════════════════════════');
    console.log('   ✅ RESET COMPLETED SUCCESSFULLY');
    console.log('═══════════════════════════════════════\n');

    // Step 2: Re-seed the database
    console.log('═══════════════════════════════════════');
    console.log('   STEP 2: SEEDING FRESH DATA');
    console.log('═══════════════════════════════════════\n');

    await prisma.$disconnect();

    console.log('🌱 Running seed script...\n');
    execSync('npx ts-node prisma/seed.ts', { stdio: 'inherit' });

    console.log('\n═══════════════════════════════════════');
    console.log('   🎉 RESET AND SEED COMPLETED!');
    console.log('═══════════════════════════════════════\n');

    console.log('📝 Summary:');
    console.log('   ✅ All old data deleted');
    console.log('   ✅ Fresh data seeded');
    console.log('   ✅ Database ready for use\n');

    console.log('🔑 Test Credentials:');
    console.log('   USER:  user@test.com  / Test1234!');
    console.log('   ADMIN: admin@test.com / Test1234!\n');

  } catch (error) {
    console.error('❌ Error during reset and seed:', error);
    throw error;
  }
}

// Run the reset and seed
resetAndSeed()
  .then(() => {
    console.log('✨ All done! Your database is fresh and ready.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Operation failed:', error);
    process.exit(1);
  });
