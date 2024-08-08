import {Config, defineConfig} from 'drizzle-kit';

import * as dotenv from 'dotenv';
dotenv.config();

export default {
    schema: './drizzle/schema.ts',
    out: './drizzle/migrations',
    // dbCredentials: {
    //     connectionString: process.env.DATABASE_URL || ''
    // },
    dbCredentials: {
        url: process.env.DATABASE_URL || ''
    },
    dialect: 'postgresql',
    verbose: true,
    strict: true
} satisfies Config