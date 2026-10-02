/**
 * Multi-Step Safelink Backend Controller
 * Handles 1-step, 2-step, or 3-step configurable redirection flows
 * exactly like TechMint + Arolinks.
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Configuration
const CONFIG = {
  TOTAL_STEPS: 2, // Configure 2 or 3 steps redirect flow
  MIN_TIME_PER_STEP_SEC: 10, // Anti-bot minimum dwell time per step
  SECRET_KEY: process.env.SAFELINK_SECRET || 'safelink-techmint-secret-key-99',
  COOKIE_NAME: 'safelink_session'
};

// In-memory or Redis active session store (for demonstration)
const activeSessions = new Map();

/**
 * Generate HMAC token for step progression
 */
function createStepToken(sessionId, step, destinationUrl) {
  const data = `${sessionId}:${step}:${destinationUrl}`;
  const hmac = crypto.createHmac('sha256', CONFIG.SECRET_KEY).update(data).digest('hex');
  return Buffer.from(JSON.stringify({ sessionId, step, destinationUrl, hmac })).toString('base64url');
}

/**
 * Verify HMAC token
 */
function verifyStepToken(tokenStr) {
  try {
    const raw = Buffer.from(tokenStr, 'base64url').toString('utf8');
    const { sessionId, step, destinationUrl, hmac } = JSON.parse(raw);
    const expected = crypto.createHmac('sha256', CONFIG.SECRET_KEY).update(`${sessionId}:${step}:${destinationUrl}`).digest('hex');
    if (hmac !== expected) return null;
    return { sessionId, step, destinationUrl };
  } catch {
    return null;
  }
}

/**
 * STEP 1 ENTRY: Receives shortlink or referral
 * Example: GET /api/safelink/start?code=BMKrQ&dest=https%3A%2F%2Ftargetlink.com
 */
router.get('/start', (req, res) => {
  const code = req.query.code || req.query.universtityeducations || 'default_link';
  const dest = req.query.dest || 'https://google.com';
  const sessionId = crypto.randomUUID();

  // Initialize session
  activeSessions.set(sessionId, {
    code,
    destination: dest,
    currentStep: 1,
    stepStartTime: Date.now(),
    totalSteps: req.query.steps ? parseInt(req.query.steps) : CONFIG.TOTAL_STEPS
  });

  // Set high-CPC ad keyword cookie (exact mimic of TechMint 'uopusi')
  res.cookie('uopusi', 'education,loan,insurance,jobvacancy', {
    maxAge: 1000 * 1000,
    httpOnly: false,
    sameSite: 'lax'
  });

  const token = createStepToken(sessionId, 1, dest);

  // Return JSON for frontend SPA or redirect to article
  if (req.accepts('html')) {
    // Splash screen -> redirect to first article post
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Please Wait...</title></head>
        <body style="font-family: sans-serif; text-align: center; padding-top: 15vh;">
          <h2>Generating Link...</h2>
          <p>Please wait while we redirect you to your content.</p>
          <script>
            setTimeout(() => {
              window.location.href = '/post/sample-high-cpc-article?safelink_token=${token}&st=1';
            }, 800);
          </script>
        </body>
      </html>
    `);
  }

  res.json({
    status: 'ok',
    step: 1,
    totalSteps: CONFIG.TOTAL_STEPS,
    token,
    redirectUrl: `/post/sample-high-cpc-article?safelink_token=${token}&st=1`
  });
});

/**
 * INTERMEDIARY REDIRECTION: /readmore/
 * Handles transitions between Step 1 -> Step 2 -> Final Destination
 */
router.all('/readmore', (req, res) => {
  const tokenStr = req.query.safelink_token || req.body?.safelink_token;
  if (!tokenStr) {
    return res.status(400).send('Invalid or missing safelink verification token.');
  }

  const payload = verifyStepToken(tokenStr);
  if (!payload) {
    return res.status(403).send('Expired or tampered token.');
  }

  const session = activeSessions.get(payload.sessionId);
  if (!session) {
    return res.status(410).send('Session expired. Please re-open your shortlink.');
  }

  // Dwell time validation (Anti-bot)
  const elapsedSec = (Date.now() - session.stepStartTime) / 1000;
  if (elapsedSec < 3) {
    return res.status(429).send('Please wait for the verification timer to complete.');
  }

  // Check if we reached the final step
  if (session.currentStep >= session.totalSteps) {
    // Flow complete! Deliver destination link
    const finalDest = session.destination;
    activeSessions.delete(payload.sessionId); // Clean up session

    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Unlocking Destination...</title></head>
        <body style="font-family: sans-serif; text-align: center; padding-top: 15vh;">
          <h2 style="color: #16a34a;">Link Verified Successfully!</h2>
          <p>Redirecting to your destination...</p>
          <script>
            setTimeout(() => {
              window.location.href = "${finalDest}";
            }, 1000);
          </script>
        </body>
      </html>
    `);
  }

  // Increment step
  session.currentStep += 1;
  session.stepStartTime = Date.now();
  const nextToken = createStepToken(payload.sessionId, session.currentStep, session.destination);

  // Redirect to Step 2 article
  return res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>Redirecting to Step ${session.currentStep}...</title></head>
      <body style="font-family: sans-serif; text-align: center; padding-top: 15vh;">
        <h2>Proceeding to Step ${session.currentStep} of ${session.totalSteps}...</h2>
        <p>Please wait a moment...</p>
        <script>
          setTimeout(() => {
            window.location.href = '/post/second-high-cpc-article?safelink_token=${nextToken}&st=${session.currentStep}';
          }, 800);
        </script>
      </body>
    </html>
  `);
});

module.exports = router;
