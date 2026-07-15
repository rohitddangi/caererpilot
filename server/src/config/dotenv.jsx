import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always load .env from the root of the server directory relative to this file
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

console.log(`[Dotenv] Loaded environment from absolute path: ${envPath}`);
