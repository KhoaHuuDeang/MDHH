import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetData() {
  console.log('🗑️  Starting data reset...\n');

  try {
    // Step 1: Delete all ratings (they reference comments, folders, resources)
    console.log('📊 Deleting ratings...');
    await prisma.ratings_comments.deleteMany({});
    await prisma.ratings_folders.deleteMany({});
    await prisma.ratings_resources.deleteMany({});
    await prisma.ratings.deleteMany({});
    console.log('✅ Ratings deleted\n');

    // Step 2: Delete all notification targets
    console.log('🔔 Deleting notification targets...');
    await prisma.notification_targets.deleteMany({});
    console.log('✅ Notification targets deleted\n');

    // Step 3: Delete all downloads
    console.log('⬇️  Deleting downloads...');
    await prisma.downloads.deleteMany({});
    console.log('✅ Downloads deleted\n');

    // Step 4: Delete all follows
    console.log('👥 Deleting follows...');
    await prisma.follows.deleteMany({});
    console.log('✅ Follows deleted\n');

    // Step 5: Delete all comments
    console.log('💬 Deleting comments...');
    await prisma.comments.deleteMany({});
    console.log('✅ Comments deleted\n');

    // Step 6: Delete folder-related junction tables
    console.log('📁 Deleting folder associations...');
    await prisma.folder_files.deleteMany({});
    await prisma.folder_tags.deleteMany({});
    console.log('✅ Folder associations deleted\n');

    // Step 7: Delete all folders
    console.log('📁 Deleting folders...');
    await prisma.folders.deleteMany({});
    console.log('✅ Folders deleted\n');

    // Step 8: Delete resource-tag associations
    console.log('🏷️  Deleting resource-tag associations...');
    await prisma.resource_tags.deleteMany({});
    console.log('✅ Resource-tag associations deleted\n');

    // Step 9: Delete all uploads
    console.log('📤 Deleting uploads...');
    await prisma.uploads.deleteMany({});
    console.log('✅ Uploads deleted\n');

    // Step 10: Delete all resources
    console.log('📄 Deleting resources...');
    await prisma.resources.deleteMany({});
    console.log('✅ Resources deleted\n');

    // Step 11: Delete all tags
    console.log('🏷️  Deleting tags...');
    await prisma.tags.deleteMany({});
    console.log('✅ Tags deleted\n');

    // Step 12: Delete all classification levels
    console.log('📊 Deleting classification levels...');
    await prisma.classification_levels.deleteMany({});
    console.log('✅ Classification levels deleted\n');

    console.log('✅ Data reset completed successfully!\n');
    console.log('📝 Summary:');
    console.log('   - All uploads deleted');
    console.log('   - All comments deleted');
    console.log('   - All folders deleted');
    console.log('   - All tags deleted');
    console.log('   - All classification levels deleted');
    console.log('   - All related data (ratings, downloads, follows, etc.) deleted\n');
  } catch (error) {
    console.error('❌ Error resetting data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset
resetData()
  .then(() => {
    console.log('🎉 Reset complete! You can now seed fresh data if needed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Reset failed:', error);
    process.exit(1);
  });
