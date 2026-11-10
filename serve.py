"""Serve the self-contained game on loopback with a stable save origin.

Standard library only. Importing this module never opens a browser or a socket.
Only the selected game HTML is exposed, never source folders or private logs.
"""
from argparse import ArgumentParser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
import sys
import socket
import webbrowser

ROOT = Path(__file__).resolve().parent
DEFAULT_PORT = 8766


class LoopbackServer(ThreadingHTTPServer):
    # Windows SO_REUSEADDR can let a second process share a live listening port.
    allow_reuse_address = sys.platform != 'win32'
    allow_reuse_port = False

    def server_bind(self):
        if sys.platform == 'win32':
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()


def create_server(game_file, port=DEFAULT_PORT):
    game = Path(game_file).resolve()
    if not game.is_relative_to(ROOT) or not game.is_file() or game.suffix.lower() != '.html':
        raise ValueError('Game HTML must exist inside this folder.')
    payload = game.read_bytes()
    routes = {'/', '/' + game.name}

    class Handler(BaseHTTPRequestHandler):
        def reply(self, include_body):
            route = unquote(urlsplit(self.path).path)
            if route not in routes:
                self.send_error(404, 'Only the game HTML is served.')
                return
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.end_headers()
            if include_body:
                self.wfile.write(payload)

        def do_GET(self):
            self.reply(True)

        def do_HEAD(self):
            self.reply(False)

    return LoopbackServer(('127.0.0.1', port), Handler)


def main():
    parser = ArgumentParser(description='Chạy MảiMêRáp trong trình duyệt bằng máy chủ cục bộ.')
    parser.add_argument('--file', default='MAI_ME_RAP.html', help='Tệp HTML trong thư mục này.')
    parser.add_argument('--port', type=int, default=DEFAULT_PORT)
    parser.add_argument('--no-open', action='store_true', help='Không tự mở trình duyệt.')
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error('Cổng phải nằm trong khoảng 1–65535.')
    game = ROOT / args.file
    if not game.is_file():
        print('Không tìm thấy ' + args.file + '. Hãy giải nén toàn bộ gói game rồi chạy CHOI_GAME.cmd trong cùng thư mục.')
        return 1
    try:
        server = create_server(game, args.port)
    except (OSError, ValueError) as exc:
        print('Không mở được máy chủ cục bộ ở cổng ' + str(args.port) + ': ' + str(exc))
        print('Nếu một phiên game cũ còn chạy, hãy đóng đúng cửa sổ máy chủ của phiên đó rồi thử lại.')
        return 1
    url = 'http://127.0.0.1:' + str(args.port) + '/' + game.name
    print('MảiMêRáp đang chạy tại ' + url)
    print('Giữ cửa sổ này trong khi chơi. Ctrl+C để tắt máy chủ. Game không cần Internet.')
    print('Dùng cùng cổng cho những lần chơi tiếp theo để trình duyệt tìm đúng các thế giới đã lưu.')
    if not args.no_open:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == '__main__':
    sys.exit(main())
