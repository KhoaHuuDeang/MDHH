import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testApproval() {
  const uploadId = 'b4748f49-b96a-4ae2-98e3-d0974913cf64';
  
  // Check current status
  const upload = await prisma.uploads.findUnique({
    where: { id: uploadId },
  });
  
  console.log('Current upload:', upload);
  
  // Approve it
  const updated = await prisma.uploads.update({
    where: { id: uploadId },
    data: {
      moderation_status: 'APPROVED',
      moderated_by: 'admin-test',
      moderated_at: new Date(),
    },
  });
  
  console.log('Updated upload:', updated);
  
  // Check again
  const check = await prisma.uploads.findUnique({
    where: { id: uploadId },
  });
  
  console.log('After approval:', check);
}

testApproval().catch(console.error).finally(() => process.exit(0));
