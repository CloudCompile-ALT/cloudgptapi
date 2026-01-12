
const keys = [
  'sk_v36iYt2n9Xm4PqW7zR5bL8kH1jD0vS9u', // Key 1
  'sk_dk0IDDUCHuz2RUyEZtAJ668NKMd6d5Vv', // Key 2
  'sk_nun1ulPVBLupdJrHBF7CGwIgBAoJsEV3', // Key 4
];

async function checkNectar(key) {
  console.log(`Checking key: ${key.substring(0, 10)}...`);
  try {
    const modelsToTest = ['gemini', 'claude-large', 'openai'];
    
    for (const model of modelsToTest) {
        console.log(`Testing model ${model}...`);
        const resp = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: 'hi' }],
                max_tokens: 1
            })
        });

        if (resp.ok) {
            console.log(`  ${model}: SUCCESS`);
        } else {
            console.log(`  ${model}: FAILED (${resp.status})`);
            const text = await resp.text();
            if (text.includes('tier') || text.includes('pollen')) {
                console.log(`    Error detail: ${text.substring(0, 100)}`);
            }
        }
    }

    console.log('---');
  } catch (error) {
    console.error(`Error checking key ${key.substring(0, 10)}:`, error.message);
  }
}

async function main() {
  for (const key of keys) {
    await checkNectar(key);
  }
}

main();
