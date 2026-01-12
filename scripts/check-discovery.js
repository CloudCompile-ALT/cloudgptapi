async function check() {
  try {
    const url = 'https://ethical-incident-barbara-proceedings.trycloudflare.com/oidc/.well-known/openid-configuration';
    console.log('Checking:', url);
    const res = await fetch(url);
    console.log('Status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('Discovery endpoint is OK');
    } else {
      console.log('Error text:', await res.text());
    }
  } catch (e) {
    console.error('Fetch error:', e);
  }
}
check();
