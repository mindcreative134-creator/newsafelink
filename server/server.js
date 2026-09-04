import dns from 'dns';
import express from 'express';
import cors from 'cors';
import { CONFIG } from './config/index.js';
import { initCronService } from './services/cronService.js';
import apiRoutes from './routes/apiRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { logEvent } from './utils/logger.js';

// Force IPv4 first to prevent ENETUNREACH on Render/Linux hosts
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

const app = express();
app.use(cors());
app.use(express.json());

// Modular Routes
app.use('/', apiRoutes);
app.use('/', dashboardRoutes);

// Initialize Automated Background Cron Schedule
initCronService();

// Start Server
app.listen(CONFIG.PORT, () => {
  logEvent(`Sarkari Blogger Auto-Publisher Server running on port ${CONFIG.PORT}`);
});
