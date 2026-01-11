
async function testDirectPollinations() {
  const keys = [
    'sk_v36iYt2n9Xm4PqW7zR5bL8kH1jD0vS9u', // POLLINATIONS_API_KEY
    'sk_dk0IDDUCHuz2RUyEZtAJ668NKMd6d5Vv'  // POLLINATIONS_API_KEY_2
  ];

  for (const key of keys) {
    console.log(`\nTesting Pollinations key: ${key.substring(0, 8)}...`);
    
    try {
      const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'gemini',
          messages: [{ role: 'user', content: 'hi' }],
          stream: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('SUCCESS:', JSON.stringify(data).substring(0, 100));
      } else {
        console.error('FAILED:', response.status, await response.text());
      }
    } catch (e) {
      console.error('ERROR:', e);
    }
  }
}

testDirectPollinations();
