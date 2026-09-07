import http.server
import socketserver
import os
import sys

PORTS = [8000, 8080, 8085, 3000]
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

class ReuseTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

if __name__ == '__main__':
    httpd = None
    active_port = None
    
    for port in PORTS:
        try:
            httpd = ReuseTCPServer(("", port), Handler)
            active_port = port
            break
        except OSError:
            continue

    if httpd:
        print(f"Starting Event Spin Wheel Web Server at http://localhost:{active_port}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            sys.exit(0)
    else:
        print("Error: Could not bind to any port in", PORTS)
        sys.exit(1)
