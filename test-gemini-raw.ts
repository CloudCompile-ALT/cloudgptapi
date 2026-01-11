
async function testGeminiRaw() {
  const apiKey = 'cgpt_822b7637a03648abb9d59e460c1fe921';
  const model = 'gemini';
  
  console.log(`Testing raw response for model: ${model}`);
  
  const response = await fetch('http://localhost:3000/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'user', content: 'Say hi' }
      ],
      stream: false
    })
  });
  
  const data = await response.json();
  console.log('RAW RESPONSE:');
  console.log(JSON.stringify(data, null, 2));
}

testGeminiRaw();
