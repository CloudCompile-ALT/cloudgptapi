
const LOGTO_ENDPOINT = 'http://157.151.169.121:3001';
const LOGTO_MANAGEMENT_API_ID = 'm-admin';
const LOGTO_MANAGEMENT_API_SECRET = 'A3JW4aZgqcSc8vUA7uP9IdATpAuN6q4I';
const LOGTO_RESOURCE = 'https://default.logto.app/api';

async function main() {
  try {
    const auth = Buffer.from(`${LOGTO_MANAGEMENT_API_ID}:${LOGTO_MANAGEMENT_API_SECRET}`).toString('base64');
    const response = await fetch(`${LOGTO_ENDPOINT}/oidc/token`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        resource: LOGTO_RESOURCE,
        scope: 'all',
      }),
    });

    if (!response.ok) {
      console.error('Failed to get token:', await response.text());
      return;
    }

    const data = await response.json();
    const token = data.access_token;

    const appsRes = await fetch(`${LOGTO_ENDPOINT}/api/applications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const apps = await appsRes.json();
    console.log(JSON.stringify(apps, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}
main();
