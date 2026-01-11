// Simple debug script to test Gemini streaming and non-streaming
const API_KEY = 'cgpt_a17273722c99488181a4a342795e8d00'; // Replace with your key
const BASE_URL = 'http://localhost:3001';

async function testNonStreaming() {
  console.log('\n=== Testing NON-STREAMING ===');
  const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'gemini',
      messages: [{ role: 'user', content: 'Say "Hello World" and nothing else.' }],
      stream: false
    })
  });
  
  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));
  
  const content = data.choices?.[0]?.message?.content;
  console.log('\nExtracted content:', content);
  console.log('Content length:', content?.length || 0);
  
  if (!content) {
    console.error('\n❌ EMPTY CONTENT! Full response structure:');
    console.error(JSON.stringify(data, null, 2));
  } else {
    console.log('\n✅ Content received successfully');
  }
}

async function testStreaming() {
  console.log('\n=== Testing STREAMING ===');
  const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'gemini',
      messages: [{ role: 'user', content: 'Count from 1 to 5.' }],
      stream: true
    })
  });
  
  console.log('Status:', response.status);
  
  if (!response.ok) {
    console.error('Error:', await response.text());
    return;
  }
  
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let chunkCount = 0;
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(data);
          
          // Log first few chunks to see structure
          if (chunkCount < 3) {
            console.log(`\nChunk ${chunkCount}:`, JSON.stringify(parsed, null, 2));
            chunkCount++;
          }
          
          const content = parsed.choices?.[0]?.delta?.content || '';
          fullText += content;
          process.stdout.write(content);
        } catch (e) {
          // ignore parse errors
        }
      }
    }
  }
  
  console.log('\n\nFull text length:', fullText.length);
  console.log('Full text:', fullText);
  
  if (!fullText) {
    console.error('\n❌ EMPTY STREAMING CONTENT!');
  } else {
    console.log('\n✅ Streaming content received successfully');
  }
}

async function main() {
  try {
    await testNonStreaming();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testStreaming();
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
