import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  // Get a real user
  const user = await prisma.users.findFirst();
  console.log('Testing with user:', user?.id);
  
  // Test the query directly
  const userId = user?.id;
  if (!userId) {
    console.log('No user found');
    return;
  }

  const conditions: string[] = [
    'u.user_id = $1::uuid',
    'u.resource_id IS NOT NULL',
  ];
  const params: any[] = [userId];
  
  const whereClause = conditions.join(' AND ');
  const dataQueryString = `
    SELECT
      u.id as upload_id,
      u.resource_id,
      u.user_id,
      u.file_size,
      u.mime_type,
      u.file_name,
      u.created_at,
      u.moderation_status,
      u.moderation_reason,
      r.title,
      r.description,
      r.visibility,
      r.category,
      COALESCE(fo.name, 'No Folder') as folder_name,
      COALESCE(cl.name, '') as folder_classification,
      COALESCE(
        (SELECT STRING_AGG(t.name, ', ')
         FROM folder_tags ft
         JOIN tags t ON ft.tag_id = t.id
         WHERE ft.folder_id = fo.id
        ), ''
      ) as folder_tags,
      0 as views_count,
      0 as downloads_count,
      0 as upvotes_count,
      0 as rating_count
    FROM uploads u
    INNER JOIN resources r ON u.resource_id = r.id
    LEFT JOIN folder_files ff ON u.resource_id = ff.resource_id
    LEFT JOIN folders fo ON ff.folder_id = fo.id
    LEFT JOIN classification_levels cl ON fo.level_id = cl.id
    WHERE ${whereClause}
    ORDER BY u.created_at DESC
    LIMIT 5`;

  const results = await prisma.$queryRawUnsafe(dataQueryString, ...params);
  console.log('Query results:', JSON.stringify(results, null, 2));
}

test().catch(console.error).finally(() => process.exit(0));
