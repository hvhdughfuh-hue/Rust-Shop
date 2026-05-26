const { PrismaClient } = require('@prisma/client');
const path = require('path');
const kits = require(path.join(__dirname, '..', 'data', 'kits.json'));

async function main() {
  const prisma = new PrismaClient();

  for (const kit of kits) {
    const existing = await prisma.kit.findUnique({ where: { name: kit.name } });
    if (existing) {
      // replace items
      await prisma.kitItem.deleteMany({ where: { kitId: existing.id } });
      await prisma.kit.update({
        where: { name: kit.name },
        data: {
          label: kit.label,
          description: kit.description ?? null,
          visible: kit.visible ?? true,
          items: { create: kit.items.map((name) => ({ name })) },
        },
      });
      console.log('Updated kit', kit.name);
    } else {
      await prisma.kit.create({
        data: {
          name: kit.name,
          label: kit.label,
          description: kit.description ?? null,
          visible: kit.visible ?? true,
          items: { create: kit.items.map((name) => ({ name })) },
        },
      });
      console.log('Created kit', kit.name);
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
