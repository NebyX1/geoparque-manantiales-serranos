"""Translate the Geoparque widget's NDJSON contract to Gianna's native Flask answer."""

import json
import sqlite3
from contextlib import closing
from pathlib import Path
from urllib.parse import urlsplit
from uuid import uuid4

from flask import Response, jsonify, request
from werkzeug.exceptions import BadRequest, RequestEntityTooLarge

ROOT = Path(__file__).resolve().parents[2]
CHAT_PATH = '/api/serrana/chat'
MESSAGE_LIMIT = 1200
HISTORY_LIMIT = 12
HISTORY_BUDGET = 4800
REQUEST_LIMIT = 24 * 1024
INVALID_REQUEST = 'La consulta de Serrana no tiene un formato válido.'
UNAVAILABLE = 'No pude completar la consulta. Volvé a intentarlo en unos instantes.'


def _history_pairs(history):
    if not isinstance(history, list) or len(history) > HISTORY_LIMIT:
        raise ValueError(INVALID_REQUEST)
    pairs = []
    question = ''
    for entry in history:
        if (not isinstance(entry, dict) or entry.get('role') not in ('user', 'assistant')
                or not isinstance(entry.get('content'), str)):
            raise ValueError(INVALID_REQUEST)
        content = entry['content'].strip()[:1600]
        if entry['role'] == 'user':
            question = content
        else:
            if question and content:
                pairs.append({'user': question, 'assistant': content})
            question = ''
    recent = []
    budget = HISTORY_BUDGET
    for pair in reversed(pairs):
        budget -= len(pair['user']) + len(pair['assistant'])
        if budget < 0:
            break
        recent.append(pair)
    return list(reversed(recent))


def _request_payload(body, places):
    if not isinstance(body, dict) or not isinstance(body.get('message'), str):
        raise ValueError(INVALID_REQUEST)
    question = body['message'].strip()
    if not question or len(question) > MESSAGE_LIMIT:
        raise ValueError(f'Escribí una consulta de hasta {MESSAGE_LIMIT} caracteres.')
    history = _history_pairs(body.get('history', []))
    place = None
    if 'context' in body:
        context = body['context']
        place_id = context.get('placeId') if isinstance(context, dict) else None
        if type(place_id) is not int or place_id not in places:
            raise ValueError(INVALID_REQUEST)
        place = dict(places[place_id])
    # Gianna defaults to a shared session when no ID is provided. Each request
    # instead projects only the completed turns supplied by this widget.
    session = uuid4().hex
    return ({
        'question': question,
        'conversation_id': f'serrana-{session}',
        'generation_id': session,
        'source': 'human',
    }, history, place)


def _safe_source_url(url):
    if (not isinstance(url, str) or not url or len(url) > 2048
            or any(char.isspace() or ord(char) < 32 for char in url) or '\\' in url):
        return None
    try:
        parts = urlsplit(url)
        if url.startswith('/') and not url.startswith('//') and not parts.netloc:
            return url
        if (url.startswith('https://') and parts.hostname and parts.username is None
                and parts.password is None):
            return url
    except ValueError:
        pass
    return None


def _visible_sources(payload, sources):
    evidence = payload.get('evidence')
    if not isinstance(evidence, list):
        return []
    assessment = payload.get('evidence_assessment')
    if isinstance(assessment, dict) and isinstance(assessment.get('evidence_ids'), list):
        evidence = [evidence[index - 1] for index in assessment['evidence_ids']
                    if type(index) is int and 1 <= index <= len(evidence)]
    elif payload.get('state') != 'ANSWERABLE':
        return []

    link_groups = []
    for item in evidence:
        if not isinstance(item, dict):
            continue
        title = item.get('title')
        if not isinstance(title, str) or not title.strip():
            title = 'Fuente de la respuesta'
        refs = item.get('source_refs')
        candidates = [item.get('url'), *(refs if isinstance(refs, list) else [])]
        group = []
        for ref in candidates:
            source_title, url = sources.get(ref, ('', None)) if type(ref) is int else (title, ref)
            safe = _safe_source_url(url)
            if safe:
                group.append({'title': (source_title or title)[:240], 'url': safe})
        if group:
            link_groups.append(group)
    links = {}
    for link in [group[0] for group in link_groups] + [link for group in link_groups for link in group[1:]]:
        links.setdefault(link['url'], link)
        if len(links) == 10:
            break
    return list(links.values())


def register_serrana_transport(app, ask_text, *, snapshot_path=None, source_db=None):
    """Use Gianna's Flask answer pipeline with the existing browser protocol."""
    snapshot_path = snapshot_path or ROOT / 'data' / 'knowledge.json'
    source_db = source_db or ROOT / 'data' / 'generated' / 'giana.sqlite3'
    snapshot = json.loads(snapshot_path.read_text(encoding='utf-8'))
    places = {
        place['id']: {key: place[key] for key in ('id', 'name', 'slug', 'zone')}
        for place in snapshot['places']
    }
    # Both files are validated and packaged together at build time. The
    # bibliographic mapping is immutable for this instance of the adapter.
    with closing(sqlite3.connect(f'{source_db.resolve().as_uri()}?mode=ro', uri=True)) as db:
        sources = {number: (title, url) for number, title, url in
                   db.execute('SELECT source_number, title, url FROM sources')}

    @app.post(CHAT_PATH)
    def serrana_chat():
        request.max_content_length = REQUEST_LIMIT
        if request.mimetype != 'application/json':
            return jsonify(error='Enviá la consulta en formato JSON.'), 415
        try:
            body, history, place = _request_payload(request.get_json(), places)
        except RequestEntityTooLarge:
            return jsonify(error='La consulta o el historial son demasiado largos.'), 413
        except BadRequest:
            return jsonify(error='No pude leer la consulta.'), 400
        except ValueError as exc:
            return jsonify(error=str(exc)), 400
        try:
            response = app.make_response(ask_text(body, initial_history=history, place_context=place))
            payload = response.get_json(silent=True)
        except Exception as exc:
            app.logger.error('Fallo en la consulta de Serrana (%s)', type(exc).__name__)
            return jsonify(error=UNAVAILABLE), 503
        if response.status_code != 200:
            return jsonify(error=UNAVAILABLE), response.status_code
        if not isinstance(payload, dict):
            return jsonify(error=UNAVAILABLE), 502
        state = payload.get('state')
        if state == 'INTERRUPTED':
            return jsonify(error='La consulta fue interrumpida. Podés volver a enviarla.'), 409
        answer = payload.get('answer')
        if (state not in ('ANSWERABLE', 'NO_EVIDENCE', 'NO_CONFIRMED_RESULT')
                or not isinstance(answer, str) or not answer.strip()):
            return jsonify(error=UNAVAILABLE), 502
        events = [
            {'type': 'delta', 'text': answer.strip()},
            {'type': 'done', 'sources': _visible_sources(payload, sources)},
        ]
        return Response(
            ''.join(json.dumps(event, ensure_ascii=False) + '\n' for event in events),
            content_type='application/x-ndjson; charset=utf-8',
            headers={'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no'},
        )
