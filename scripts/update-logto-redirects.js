
const LOGTO_ENDPOINT = 'https://ethical-incident-barbara-proceedings.trycloudflare.com';
const M2M_APP_ID = 'm-migration';
const M2M_APP_SECRET = 'MigrationSecret123!';
const LOGTO_RESOURCE = 'https://default.logto.app/api';
const APP_ID = 'qcma8qo4f4req96mhc5kl';

async function main() {
  try {
    console.log('Fetching Management API token...');
    const auth = Buffer.from(`${M2M_APP_ID}:${M2M_APP_SECRET}`).toString('base64');
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
    console.log('Token received. Updating application redirects...');

    const updateRes = await fetch(`${LOGTO_ENDPOINT}/api/applications/${APP_ID}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        redirectUris: [
          'https://cloudgptapi.vercel.app/api/logto/sign-in-callback',
          'http://localhost:3000/api/logto/sign-in-callback'
        ],
        postLogoutRedirectUris: [
          'https://cloudgptapi.vercel.app',
          'http://localhost:3000'
        ]
      }),
    });

    if (!updateRes.ok) {
      console.error('Failed to update application:', await updateRes.text());
      return;
    }

    console.log('Successfully updated Logto application redirect URIs!');
    console.log('Redirect URIs:');
    console.log(' - https://cloudgptapi.vercel.app/api/logto/sign-in-callback');
    console.log(' - http://localhost:3000/api/logto/sign-in-callback');
  } catch (err) {
    console.error('Error:', err);
  }
}
main();
