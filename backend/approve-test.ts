import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function approveUpload() {
  const adminId = 'c3859044-a74d-4c7c-9ede-d0a511fb68e4';
  const uploadId = '80328f2a-5735-4fc0-a142-ecd6b8dac15e';
  
  const updated = await prisma.uploads.update({
    where: { id: uploadId },
    data: {
      moderation_status: 'APPROVED',
      moderated_by: adminId,
      moderated_at: new Date(),
    },
  });
  
  console.log('Approved:', updated.file_name);
  console.log('Status:', updated.moderation_status);
}

approveUpload().catch(console.error).finally(() => process.exit(0));
