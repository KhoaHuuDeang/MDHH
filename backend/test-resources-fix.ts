import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const user = await prisma.users.findFirst();
  const userId = user?.id;
  if (!userId) return;

  const conditions = ['u.user_id = $1::uuid', 'u.resource_id IS NOT NULL'];
  const params: any[] = [userId];
  const whereClause = conditions.join(' AND ');
  
  const dataQueryString = `
    SELECT
      u.id as upload_id,
      u.resource_id,
      u.file_name,
      u.moderation_status,
      r.title,
      COALESCE(fo.name, 'No Folder') as folder_name,
      COALESCE(cl.name, '') as folder_classification,
      COALESCE(
        (SELECT STRING_AGG(t.name, ', ')
         FROM folder_tags ft
         JOIN tags t ON ft.tag_id = t.id
         WHERE ft.folder_id = fo.id
        ), ''
      ) as folder_tags
    FROM uploads u
    INNER JOIN resources r ON u.resource_id = r.id
    LEFT JOIN folder_files ff ON u.resource_id = ff.resource_id
    LEFT JOIN folders fo ON ff.folder_id = fo.id
    LEFT JOIN classification_levels cl ON fo.classification_level_id = cl.id
    WHERE ${whereClause}
    ORDER BY u.created_at DESC
    LIMIT 5`;

  const results = await prisma.$queryRawUnsafe(dataQueryString, ...params);
  console.log('Results:', JSON.stringify(results, null, 2));
}

test().catch(console.error).finally(() => process.exit(0));
