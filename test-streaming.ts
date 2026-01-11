
async function testStreaming() {
  const apiKey = 'cgpt_a17273722c99488181a4a342795e8d00';
  const model = 'gemini';
  
  console.log(`Testing streaming for model: ${model}`);
  
  const response = await fetch('http://localhost:3000/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'user', content: 'Write a short poem about coding.' }
      ],
      stream: true
    })
  });

  if (!response.ok) {
    console.error('Error:', response.status, await response.text());
    return;
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  if (!reader) {
    console.error('No reader');
    return;
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    console.log('CHUNK:', chunk);
    
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || '';
          fullText += content;
          process.stdout.write(content);
        } catch (e) {
          // ignore
        }
      }
    }
  }
  
  console.log('\n\nFULL TEXT:', fullText);
}

testStreaming();
