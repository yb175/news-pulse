import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Load environmental variables from root monorepo directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

export default prisma;
