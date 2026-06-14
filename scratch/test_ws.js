import WebSocket from 'ws';

function testConnection(url) {
  return new Promise((resolve) => {
    console.log(`Connecting to ${url}...`);
    const ws = new WebSocket(url);
    
    ws.on('open', () => {
      console.log(`  [SUCCESS] Connected to ${url}`);
      ws.close();
      resolve(true);
    });

    ws.on('error', (err) => {
      console.log(`  [FAILED] ${url} error: ${err.message}`);
      resolve(false);
    });
  });
}

async function run() {
  await testConnection('ws://localhost:8000/ws');
  await testConnection('ws://localhost:5173/ws');
}

run();
