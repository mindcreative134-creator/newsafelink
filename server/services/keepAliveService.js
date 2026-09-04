import https from 'https';
import http from 'http';
import { CONFIG } from '../config/index.js';
import { logEvent } from '../utils/logger.js';

let lastPingTime = null;
let totalPings = 0;
let lastStatus = 'Initialized';
let keepAliveTimer = null;

export function getKeepAliveStatus() {
  const externalUrl = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL || process.env.SELF_URL || '';
  return {
    isActive: true,
    externalUrl: externalUrl || `http://localhost:${CONFIG.PORT}`,
    isRenderDetected: Boolean(process.env.RENDER || process.env.RENDER_EXTERNAL_URL),
    intervalMinutes: 10,
    totalPings,
    lastPingTime,
    lastStatus,
  };
}

/**
 * Render 24/7 Anti-Sleep Keep-Alive Service
 * Sends an inbound HTTP request to the server's public endpoint every 10 minutes,
 * keeping the Render free-tier container from idling or sleeping.
 */
export function initKeepAliveService() {
  const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes (Render timeout is 15 mins)

  const sendPing = () => {
    const rawUrl = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL || process.env.SELF_URL;
    const targetUrl = rawUrl ? `${rawUrl.replace(/\/+$/, '')}/ping` : `http://localhost:${CONFIG.PORT}/ping`;

    const client = targetUrl.startsWith('https') ? https : http;

    const req = client.get(targetUrl, { timeout: 15000 }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        totalPings++;
        lastPingTime = new Date().toISOString();
        lastStatus = `OK (HTTP ${res.statusCode})`;
        logEvent(`[Render 24/7 Anti-Sleep] Pinged ${targetUrl} ➔ Status: ${res.statusCode} (Awake 24/7)`);
      });
    });

    req.on('error', (err) => {
      lastStatus = `Error: ${err.message}`;
      logEvent(`[Render 24/7 Anti-Sleep] Ping notice for ${targetUrl}: ${err.message}`, 'warning');
    });

    req.end();
  };

  // Run first ping after 20 seconds, then every 10 minutes
  setTimeout(sendPing, 20000);
  keepAliveTimer = setInterval(sendPing, PING_INTERVAL_MS);

  const detectedUrl = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL;
  if (detectedUrl) {
    logEvent(`[Render 24/7 Anti-Sleep] Keep-Alive active! Auto-pinging ${detectedUrl}/ping every 10 minutes.`);
  } else {
    logEvent(`[Render 24/7 Anti-Sleep] Keep-Alive active locally on port ${CONFIG.PORT}. (On Render, RENDER_EXTERNAL_URL is detected automatically).`);
  }
}
