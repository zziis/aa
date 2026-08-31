import http.server
import socketserver
import webbrowser
import os
import sys

# Ensure UTF-8 output encoding for Windows consoles
if sys.platform == 'win32' and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PORT = 8088
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CyberHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def main():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), CyberHandler) as httpd:
        url = f"http://localhost:{PORT}/index.html"
        print("=" * 60)
        print("  ⚡ منصة زلزال نيون التكنولوجية (Zelzal Cyber Platform) ⚡")
        print(f"  🌐 يعمل الخادم المحلي على: {url}")
        print("=" * 60)
        
        if len(sys.argv) > 1 and sys.argv[1] == '--open':
            webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

if __name__ == '__main__':
    main()
