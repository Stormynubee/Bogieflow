import asyncio
import websockets

async def test_conn(url):
    print(f"Connecting to {url}...")
    try:
        async with websockets.connect(url, open_timeout=5) as ws:
            print(f"  [SUCCESS] Connected to {url}!")
            # Receive one message (snapshot)
            msg = await asyncio.wait_for(ws.recv(), timeout=2)
            print(f"  [SUCCESS] Received snapshot of length: {len(msg)}")
    except Exception as e:
        print(f"  [FAILED] Connection to {url} failed: {e}")

async def main():
    await test_conn('ws://localhost:8000/ws')
    await test_conn('ws://localhost:5173/ws')

if __name__ == '__main__':
    asyncio.run(main())
