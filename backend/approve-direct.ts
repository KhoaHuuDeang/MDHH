import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function approveUpload() {
  // Approve PENDING upload
  const updated = await prisma.uploads.update({
    where: { id: '80328f2a-5735-4fc0-a142-ecd6b8dac15e' },
    data: {
      moderation_status: 'APPROVED',
      moderated_by: 'admin-test',
      moderated_at: new Date(),
    },
  });
  
  console.log('Approved:', updated.file_name, 'Status:', updated.moderation_status);
}

approveUpload().catch(console.error).finally(() => process.exit(0));
