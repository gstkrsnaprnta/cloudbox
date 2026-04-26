import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.package.upsert({
    where: { slug: "student-box" },
    update: {
      name: "Student Box",
      description: "Mini VPS learning sandbox: 128MB RAM, 0.2 CPU, active for 7 days.",
      price: 5000,
      cpuLimit: "0.2 CPU",
      ramLimit: "128MB",
      activeDays: 7,
      isActive: true
    },
    create: {
      name: "Student Box",
      slug: "student-box",
      description: "Mini VPS learning sandbox: 128MB RAM, 0.2 CPU, active for 7 days.",
      price: 5000,
      cpuLimit: "0.2 CPU",
      ramLimit: "128MB",
      activeDays: 7,
      isActive: true
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
