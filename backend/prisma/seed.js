import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const packages = [
  {
    slug: "demo-box",
    name: "Demo Box",
    description: "Coba gratis tanpa bayar: 100MB RAM, 0.1 CPU, aktif 1 hari.",
    price: 0,
    cpuLimit: "0.1 CPU",
    ramLimit: "100MB",
    activeDays: 1,
    isActive: true
  },
  {
    slug: "student-box",
    name: "Student Box",
    description: "Mini VPS belajar: 128MB RAM, 0.2 CPU, aktif 7 hari.",
    price: 5000,
    cpuLimit: "0.2 CPU",
    ramLimit: "128MB",
    activeDays: 7,
    isActive: true
  },
  {
    slug: "pro-box",
    name: "Pro Box",
    description: "VPS pro: 256MB RAM, 0.25 CPU, aktif 30 hari.",
    price: 10000,
    cpuLimit: "0.25 CPU",
    ramLimit: "256MB",
    activeDays: 30,
    isActive: true
  }
];

const users = [
  {
    name: "KloudBox Admin",
    email: "admin@kloudbox.my.id",
    password: "Admin123!",
    role: "admin"
  },
  {
    name: "Demo User",
    email: "user@kloudbox.my.id",
    password: "User123!",
    role: "user"
  },
  {
    name: "Riansyah",
    email: "riansyah@kloudbox.my.id",
    password: "Riansyah123!",
    role: "user"
  }
];

async function main() {
  for (const pkg of packages) {
    const result = await prisma.package.upsert({
      where: { slug: pkg.slug },
      update: pkg,
      create: pkg
    });
    console.log(`✓ Paket ter-seed: ${result.slug} (${result.name}) — Rp${result.price.toLocaleString("id-ID")}`);
  }

  for (const u of users) {
    const passwordHash = bcrypt.hashSync(u.password, 12);
    const result = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, passwordHash },
      create: { name: u.name, email: u.email, passwordHash, role: u.role }
    });
    console.log(`✓ Akun ter-seed: ${result.email} (${result.role}) — password: ${u.password}`);
  }

  console.log("\nSeed selesai: 3 paket + 3 akun demo.");
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
