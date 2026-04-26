#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || !databaseUrl.startsWith("file:")) {
  process.exit(0);
}

const rawPath = databaseUrl.replace("file:", "");
const dbPath = path.isAbsolute(rawPath)
  ? rawPath
  : path.resolve(process.cwd(), "prisma", rawPath);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

if (!fs.existsSync(dbPath)) {
  fs.closeSync(fs.openSync(dbPath, "w"));
  console.log(`Created SQLite database file at ${dbPath}`);
}
