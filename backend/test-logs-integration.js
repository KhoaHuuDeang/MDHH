const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testLogsIntegration() {
  try {
    console.log('🧪 Testing Logs Integration...\n');

    // 1. Check logs count
    const logsCount = await prisma.logs.count();
    console.log('📊 Total logs in database:', logsCount);

    // 2. Get recent logs
    const recentLogs = await prisma.logs.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        actor: {
          select: { displayname: true, username: true }
        }
      }
    });

    console.log('\n📝 Recent logs:');
    recentLogs.forEach((log, i) => {
      console.log(`${i + 1}. Type: ${log.type}, Actor: ${log.actor?.displayname || 'System'}, Read: ${log.is_read}, Created: ${log.created_at}`);
    });

    // 3. Check logs by type
    const logsByType = await prisma.logs.groupBy({
      by: ['type'],
      _count: { type: true }
    });

    console.log('\n📈 Logs by type:');
    logsByType.forEach(item => {
      console.log(`  ${item.type}: ${item._count.type}`);
    });

    // 4. Get test resource for manual testing
    const resource = await prisma.resources.findFirst({
      include: { uploads: { select: { user_id: true } } }
    });

    if (resource) {
      console.log('\n🎯 Test Resource Available:');
      console.log(`  ID: ${resource.id}`);
      console.log(`  Owner: ${resource.uploads[0]?.user_id}`);
      console.log(`  Use this to test comments/votes`);
    }

    console.log('\n✅ Test complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLogsIntegration();
