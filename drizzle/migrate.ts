import { drizzle } from "drizzle-orm/postgres-js";
import {migrate} from 'drizzle-orm/postgres-js/migrator';
import postgres from "postgres";

// const dbUrl = process.env.DATABASE_URL as string;
const dbUrl = Bun.env.DATABASE_URL as string;

console.log({dbUrl})

// const migrationClient = postgres('postgres://postgres:electromagnet@localhost:5433/chatapp', {max: 1})
const migrationClient = postgres(dbUrl, {max: 1})
// const migrationClient = postgres(dbUrl, {max: 5})
// const migrationClient = postgres(dbUrl)

await migrate(drizzle(migrationClient), {migrationsFolder: './migrations'}) 