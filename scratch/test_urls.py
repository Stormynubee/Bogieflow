import urllib.request
import urllib.error

urls = [
    'https://bogie-flow.onrender.com/health',
    'https://bogieflow.onrender.com/health',
    'https://faraway-2026-japan.up.railway.app/health',
    'https://faraway-2026-japan.onrender.com/health',
    'https://bogie-flow.onrender.com/api/health',
    'https://bogieflow.onrender.com/api/health',
    'https://faraway-2026-japan.up.railway.app/api/health',
    'https://faraway-2026-japan.onrender.com/api/health'
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            print(f"{url} -> Success: {resp.read().decode()}")
    except urllib.error.HTTPError as e:
        print(f"{url} -> HTTPError: {e.code}")
    except Exception as e:
        print(f"{url} -> Error: {e}")
