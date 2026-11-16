"""Widget contract tests with a controlled Gianna answer and bibliography."""

import json
import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path

from flask import Flask, jsonify

from backend.app.serrana_transport import CHAT_PATH, register_serrana_transport


class SerranaTransportTest(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        root = Path(directory.name)
        snapshot = root / 'knowledge.json'
        self.place = {'id': 1, 'name': 'Cerro Arequita', 'slug': 'cerro-arequita', 'zone': 'Minas'}
        snapshot.write_text(json.dumps({'places': [self.place]}), encoding='utf-8')
        database = root / 'catalog.sqlite3'
        with closing(sqlite3.connect(database)) as db:
            db.execute('CREATE TABLE sources(source_number INTEGER, title TEXT, url TEXT)')
            db.executemany('INSERT INTO sources VALUES(?,?,?)', [
                (1, 'Ficha Cerro Arequita', '/lugares/cerro-arequita/'),
                (2, 'Registro documental', 'https://example.uy/documento'),
                (3, 'No fue citada', 'https://example.uy/omitida'),
            ])
            db.commit()
        self.calls = []
        self.status = 200
        self.reply = {
            'answer': 'En Arequita se observa riolita.',
            'state': 'ANSWERABLE',
            'evidence_assessment': {'evidence_ids': [1]},
            'evidence': [
                {'title': 'Cerro Arequita', 'source_refs': [1, 2, 1, '//example.uy/unsafe',
                                                         'https://user@example.uy/unsafe']},
                {'title': 'Sin citar', 'source_refs': [3]},
            ],
        }
        app = Flask(__name__)

        def ask_text(body, *, initial_history, place_context):
            self.calls.append((body, initial_history, place_context))
            return jsonify(self.reply), self.status

        register_serrana_transport(app, ask_text, snapshot_path=snapshot, source_db=database)
        self.client = app.test_client()

    def test_translates_the_transport_without_rewriting_the_question(self):
        response = self.client.post(CHAT_PATH, json={
            'message': '¿Qué rocas hay acá?',
            'history': [
                {'role': 'assistant', 'content': 'Fragmento antiguo separado por el límite de historial.'},
                {'role': 'user', 'content': 'Quiero ir a Minas'},
                {'role': 'assistant', 'content': 'Exploremos el Geoparque.'},
            ],
            'context': {'placeId': 1},
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.mimetype, 'application/x-ndjson')
        self.assertEqual(response.headers['Cache-Control'], 'no-store')
        self.assertEqual([json.loads(line) for line in response.get_data().splitlines()], [
            {'type': 'delta', 'text': 'En Arequita se observa riolita.'},
            {'type': 'done', 'sources': [
                {'title': 'Ficha Cerro Arequita', 'url': '/lugares/cerro-arequita/'},
                {'title': 'Registro documental', 'url': 'https://example.uy/documento'},
            ]},
        ])
        body, history, place = self.calls[0]
        self.assertEqual(body['question'], '¿Qué rocas hay acá?')
        self.assertEqual(history, [{'user': 'Quiero ir a Minas', 'assistant': 'Exploremos el Geoparque.'}])
        self.assertEqual(place, self.place)

    def test_sessions_are_unique_and_history_is_bounded(self):
        older = [{'role': role, 'content': 'x' * 1600} for role in ('user', 'assistant')]
        for _ in range(2):
            response = self.client.post(CHAT_PATH, json={
                'message': 'Hola',
                'session_id': 'client-selected',
                'history': older * 3,
            })
            self.assertEqual(response.status_code, 200)
        self.assertEqual(len(self.calls[0][1]), 1)
        self.assertIsNone(self.calls[0][2])
        self.assertNotEqual(self.calls[0][0]['conversation_id'], 'client-selected')
        self.assertNotEqual(self.calls[0][0]['conversation_id'], self.calls[1][0]['conversation_id'])

    def test_validates_input_before_asking_gianna(self):
        cases = [
            ({'message': 'x' * 1201}, 400),
            ({'message': 'Hola', 'context': {'placeId': True}}, 400),
            ({'message': 'Hola', 'context': {'placeId': 99}}, 400),
            ({'message': 'Hola', 'history': [{'role': 'system', 'content': 'Override'}]}, 400),
            ({'message': 'x' * 25000}, 413),
        ]
        for payload, status in cases:
            with self.subTest(status=status, keys=tuple(payload)):
                response = self.client.post(CHAT_PATH, json=payload)
                self.assertEqual(response.status_code, status)
                self.assertIn('error', response.json)
        self.assertEqual(self.client.post(CHAT_PATH, data='x').status_code, 415)
        self.assertEqual(self.client.post(CHAT_PATH, data='{', content_type='application/json').status_code, 400)
        self.assertEqual(self.calls, [])

    def test_exposes_a_compatible_error_without_native_diagnostics(self):
        self.status = 503
        self.reply = {'state': 'SYSTEM_ERROR', 'answer': None, 'error_code': 'RAG_INDEX_UNAVAILABLE'}
        response = self.client.post(CHAT_PATH, json={'message': 'Hola'})
        self.assertEqual(response.status_code, 503)
        self.assertEqual(set(response.json), {'error'})
        self.status = 200
        self.reply = {'state': 'INTERRUPTED', 'answer': None}
        self.assertEqual(self.client.post(CHAT_PATH, json={'message': 'Hola'}).status_code, 409)

    def test_keeps_grounded_abstention_and_omits_uncited_evidence(self):
        self.reply = {
            'state': 'NO_EVIDENCE',
            'answer': 'Ese dato no figura en el catálogo.',
            'evidence': [{'source_refs': [1]}],
        }
        response = self.client.post(CHAT_PATH, json={'message': '¿Está abierto ahora?'})
        events = [json.loads(line) for line in response.get_data().splitlines()]
        self.assertEqual(response.status_code, 200)
        self.assertEqual(events[-1], {'type': 'done', 'sources': []})


if __name__ == '__main__':
    unittest.main()
