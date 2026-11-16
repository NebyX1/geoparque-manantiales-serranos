"""Deployment boundaries for the public chat API."""
import os
import threading
import time
from collections import deque
from urllib.parse import urlsplit

from flask import jsonify, request

from backend.app.ollama_connection import base_url, configured


CHAT_PATHS = {'/api/ask-text', '/api/serrana/chat'}
PUBLIC_PATHS = CHAT_PATHS | {'/api/ready', '/api/turn-progress', '/health', '/api/health', '/ready'}


def configure_deployment(app):
    environment = os.getenv('FLASK_ENV', 'development')
    if environment not in {'development', 'production'}:
        raise ValueError('FLASK_ENV must be development or production.')
    production = environment == 'production'
    origins = set()
    local_origins = 'http://localhost:4321,http://127.0.0.1:4321'
    for origin in os.getenv('CORS_ORIGINS', '' if production else local_origins).split(','):
        origin = origin.strip()
        if not origin:
            continue
        url = urlsplit(origin)
        if (url.scheme not in {'http', 'https'} or not url.hostname or url.username or url.password
                or url.path or url.query or url.fragment or '*' in url.hostname
                or url.netloc != url.netloc.lower()
                or (production and url.scheme != 'https')):
            raise ValueError('CORS_ORIGINS must contain exact origins, without paths or trailing slashes; use HTTPS in production.')
        origins.add(origin)
    if production and not origins:
        raise ValueError('Configurá CORS_ORIGINS con el origen HTTPS del sitio.')
    provider = urlsplit(base_url())
    if (provider.scheme not in {'http', 'https'} or not provider.hostname or provider.username
            or provider.password or provider.path or provider.query or provider.fragment):
        raise ValueError('OLLAMA_HOST must be an HTTP(S) origin without paths or credentials.')
    if production and not configured():
        raise ValueError('OLLAMA_API_KEY is required for a remote Ollama provider.')
    if production and provider.scheme != 'https' and provider.hostname not in {
        'localhost', '127.0.0.1', '::1', 'host.docker.internal'
    }:
        raise ValueError('Use HTTPS for remote Ollama providers.')
    app.config['MAX_CONTENT_LENGTH'] = 24 * 1024
    rate_limit = int(os.getenv('SERRANA_REQUESTS_PER_MINUTE', '30'))
    if not 1 <= rate_limit <= 300:
        raise ValueError('SERRANA_REQUESTS_PER_MINUTE debe estar entre 1 y 300.')
    requests_this_minute = deque()
    rate_lock = threading.Lock()

    @app.before_request
    def check_public_request():
        if production and request.path not in PUBLIC_PATHS:
            return jsonify(error_code='NOT_FOUND'), 404
        if request.path not in PUBLIC_PATHS:
            return None
        origin = request.headers.get('Origin')
        if origin and origin not in origins:
            app.logger.warning('Rejected request from an origin not listed in CORS_ORIGINS.')
            return jsonify(error_code='ORIGIN_NOT_ALLOWED'), 403
        if request.method == 'OPTIONS':
            expected = 'POST' if request.path in CHAT_PATHS else 'GET'
            headers = {value.strip().lower() for value in request.headers.get('Access-Control-Request-Headers', '').split(',') if value.strip()}
            if not origin or request.headers.get('Access-Control-Request-Method') != expected or headers - {'content-type'}:
                return jsonify(error_code='INVALID_PREFLIGHT'), 403
            return '', 204
        if request.path in CHAT_PATHS and request.method == 'POST':
            now = time.monotonic()
            with rate_lock:
                while requests_this_minute and now - requests_this_minute[0] >= 60:
                    requests_this_minute.popleft()
                if len(requests_this_minute) >= rate_limit:
                    return jsonify(error='Serrana alcanzó el límite de consultas.'), 429, {'Retry-After': '60'}
                requests_this_minute.append(now)
        return None

    @app.after_request
    def cors_headers(response):
        if request.path in PUBLIC_PATHS:
            response.headers['Cache-Control'] = 'no-store'
            response.vary.add('Origin')
            origin = request.headers.get('Origin')
            if origin in origins:
                response.headers['Access-Control-Allow-Origin'] = origin
                if request.method == 'OPTIONS' and response.status_code == 204:
                    response.headers['Access-Control-Allow-Methods'] = 'POST' if request.path in CHAT_PATHS else 'GET'
                    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
                    response.headers['Access-Control-Max-Age'] = '600'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        return response
