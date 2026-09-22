#!/usr/bin/env python3
"""Tiny dev server with SPA fallback (mirrors `serve -s`). Not used in production."""
import http.server, os, sys, socketserver
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def do_GET(self):
        path = self.path.split("?")[0].split("#")[0]
        fs = os.path.join(ROOT, path.lstrip("/"))
        if path != "/" and not os.path.isfile(fs) and not os.path.isdir(fs):
            self.path = "/index.html"
        return super().do_GET()
    def end_headers(self):
        self.send_header("Cache-Control", "no-store"); super().end_headers()
    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.log_date_time_string(), fmt % args))
H.extensions_map.update({".js": "text/javascript", ".mjs": "text/javascript", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml"})
socketserver.ThreadingTCPServer.allow_reuse_address = True
socketserver.ThreadingTCPServer.daemon_threads = True
with socketserver.ThreadingTCPServer(("", PORT), H) as httpd:
    print(f"dev server on http://localhost:{PORT}", flush=True); httpd.serve_forever()
