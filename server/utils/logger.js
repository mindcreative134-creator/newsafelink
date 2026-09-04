import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const LOGS_FILE = path.join(DATA_DIR, 'logs.json');
export const POSTED_CACHE_FILE = path.join(DATA_DIR, 'posted_cache.json');
export const SCRAPED_POSTS_FILE = path.join(DATA_DIR, 'latest_scraped_posts.json');

export function loadJson(filePath, defaultValue) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

export function saveJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`[Storage Error] Failed saving ${filePath}:`, err.message);
  }
}

export function logEvent(message, type = 'info') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  const logs = loadJson(LOGS_FILE, []);
  logs.unshift({ timestamp, message, type });
  saveJson(LOGS_FILE, logs.slice(0, 100)); // keep last 100 logs
}
