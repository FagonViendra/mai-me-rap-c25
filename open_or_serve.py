"""Open the exact current game at its stable loopback origin, or start its server."""
from argparse import ArgumentParser
from pathlib import Path
from urllib.request import ProxyHandler, HTTPRedirectHandler, build_opener
import sys
import webbrowser
import serve

ROOT = Path(__file__).resolve().parent

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, message, headers, new_url):
        return None

def matches_existing(url, payload):
    try:
        opener = build_opener(ProxyHandler({}), NoRedirect())
        with opener.open(url, timeout=1.5) as response:
            return response.geturl() == url and response.status == 200 and response.read(len(payload) + 1) == payload
    except (OSError, ValueError):
        return False

def main():
    parser = ArgumentParser(description='Mở đúng bản MảiMêRáp trong thư mục này.')
    parser.add_argument('--file', default='MAI_ME_RAP.html')
    parser.add_argument('--port', type=int, default=8766)
    parser.add_argument('--no-open', action='store_true')
    args = parser.parse_args()
    game = (ROOT / args.file).resolve()
    valid = game.is_relative_to(ROOT) and game.is_file() and game.suffix.lower() == '.html'
    if valid and 1 <= args.port <= 65535:
        url = 'http://127.0.0.1:' + str(args.port) + '/' + game.name
        if matches_existing(url, game.read_bytes()):
            print('Đúng bản game này đã chạy tại ' + url)
            if not args.no_open:
                webbrowser.open(url)
            return 0
    return serve.main()

if __name__ == '__main__':
    sys.exit(main())
