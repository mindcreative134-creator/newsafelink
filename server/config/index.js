import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONFIG = {
  PORT: process.env.PORT || 5000,
  BLOG_ID: process.env.BLOGGER_BLOG_ID || process.env.BLOG_ID || '6924208631263306852',
  CLIENT_ID: process.env.BLOGGER_CLIENT_ID || '',
  CLIENT_SECRET: process.env.BLOGGER_CLIENT_SECRET || '',
  REFRESH_TOKEN: process.env.BLOGGER_REFRESH_TOKEN || '',
  CRON_SCHEDULE: process.env.CRON_SCHEDULE || '0 */2 * * *',
  FEEDS_FILE: path.join(__dirname, 'feeds.json'),
};
