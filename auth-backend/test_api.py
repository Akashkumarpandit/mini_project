import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    req = urllib.request.Request("http://localhost:8080/api/listings")
    with urllib.request.urlopen(req, context=ctx) as response:
        print("Status:", response.status)
        print("Data:", response.read().decode())
except Exception as e:
    print("Error:", e)
