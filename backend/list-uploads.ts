import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUploads() {
  const uploads = await prisma.uploads.findMany({
    take: 5,
    orderBy: { created_at: 'desc' },
  });
  
  console.log('Recent uploads:', uploads.map(u => ({
    id: u.id,
    file_name: u.file_name,
    moderation_status: u.moderation_status,
  })));
}

listUploads().catch(console.error).finally(() => process.exit(0));
