import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const dbUrl = process.env.DATABASE_URL as string;

const queryClient = postgres(dbUrl)

export const db = drizzle(queryClient);