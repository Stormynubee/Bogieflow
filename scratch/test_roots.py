import urllib.request
import urllib.error

urls = [
    'https://bogie-flow.onrender.com/',
    'https://bogieflow.onrender.com/',
    'https://faraway-2026-japan.up.railway.app/',
    'https://faraway-2026-japan.onrender.com/'
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            print(f"{url} -> Success: {resp.status} - {resp.read()[:100].decode(errors='ignore')}")
    except urllib.error.HTTPError as e:
        print(f"{url} -> HTTPError: {e.code}")
    except Exception as e:
        print(f"{url} -> Error: {e}")
