import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('\n=============================================');
  console.log('  Google Blogger OAuth 2.0 Token Generator   ');
  console.log('=============================================\n');

  let clientId = process.env.BLOGGER_CLIENT_ID;
  let clientSecret = process.env.BLOGGER_CLIENT_SECRET;

  if (!clientId) {
    clientId = await question('Enter your Google OAuth Client ID: ');
  }
  if (!clientSecret) {
    clientSecret = await question('Enter your Google OAuth Client Secret: ');
  }

  clientId = (clientId || '').trim();
  clientSecret = (clientSecret || '').trim();

  if (!clientId || !clientSecret) {
    console.log('❌ Client ID and Client Secret are required.');
    rl.close();
    return;
  }

  const redirectUri = 'https://developers.google.com/oauthplayground';
  const scope = 'https://www.googleapis.com/auth/blogger';

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;

  console.log('\n👉 Step 1: Open this URL in your browser:');
  console.log('\n' + authUrl + '\n');
  console.log('👉 Step 2: Sign in with the Google Account that owns your Blogger blog & click Allow.');
  console.log('👉 Step 3: Google will redirect to OAuth Playground. Copy the "code=" parameter from the URL address bar or page.\n');

  const authCode = await question('Paste the authorization code here: ');

  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: authCode.trim(),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const data = await res.json();

    if (data.error) {
      console.error('\n❌ Token Error:', data.error, data.error_description || '');
    } else {
      console.log('\n=============================================');
      console.log('🎉 SUCCESS! Here are your credentials:');
      console.log('=============================================');
      console.log(`BLOGGER_CLIENT_ID=${clientId}`);
      console.log(`BLOGGER_CLIENT_SECRET=${clientSecret}`);
      console.log(`BLOGGER_REFRESH_TOKEN=${data.refresh_token}`);
      console.log('=============================================\n');
      console.log('Copy these 3 values and paste them into your Render.com Environment Variables!');
    }
  } catch (err) {
    console.error('\n❌ Request failed:', err.message);
  } finally {
    rl.close();
  }
}

main();
