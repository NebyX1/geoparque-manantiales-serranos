import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
const prototype = readFileSync('Manantiales_Serranos_v2.html', 'utf8').replace(
  /<link[^>]+href="https:\/\/fonts[^>]+>/g,
  '',
);
const faces = ['barlow-condensed', 'montserrat']
  .flatMap((font) =>
    [400, 500, 600, 700, 800].map(
      (weight) =>
        `@font-face{font-family:'${font === 'montserrat' ? 'Montserrat' : 'Barlow Condensed'}';font-style:normal;font-weight:${weight};font-display:swap;src:url('/fonts/${font}/${weight}.woff2') format('woff2')}`,
    ),
  )
  .join('');
createServer((request, response) => {
  const match = request.url?.match(/^\/fonts\/(barlow-condensed|montserrat)\/([4-8]00)\.woff2$/);
  if (match) {
    try {
      response.writeHead(200, { 'Content-Type': 'font/woff2' });
      response.end(
        readFileSync(
          `node_modules/@fontsource/${match[1]}/files/${match[1]}-latin-${match[2]}-normal.woff2`,
        ),
      );
    } catch {
      response.writeHead(404);
      response.end();
    }
  } else if (request.url === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(prototype.replace('</head>', `<style>${faces}</style></head>`));
  } else {
    response.writeHead(404);
    response.end();
  }
}).listen(4323, '127.0.0.1');
