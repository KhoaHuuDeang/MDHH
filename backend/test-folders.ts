import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function test() {
  const userId = 'c3859044-a74d-4c7c-9ede-d0a511fb68e4';
  const folders = await prisma.folders.findMany({
    where: { user_id: userId },
    include: {
      classification_levels: { select: { id: true, name: true } },
      folder_tags: { include: { tags: { select: { id: true, name: true } } } }
    },
    orderBy: { created_at: 'desc' }
  });
  console.log('Folders:', JSON.stringify(folders, null, 2));
}
test().finally(() => process.exit(0));
