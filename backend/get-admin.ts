import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getAdmin() {
  const admin = await prisma.users.findFirst({
    where: { role_id: { not: undefined } }
  });
  
  console.log('Admin ID:', admin?.id);
}

getAdmin().catch(console.error).finally(() => process.exit(0));
