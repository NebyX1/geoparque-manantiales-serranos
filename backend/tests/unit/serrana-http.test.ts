import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import { afterEach, describe, expect, it } from 'vitest';
import { createSerranaServer } from '../../src/http';
import { knowledgeInfo } from '../../src/knowledge';

const servers: Server[] = [];

async function listen(server: Server) {
  servers.push(server);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No TCP address');
  return `http://127.0.0.1:${address.port}`;
}

const post = (
  url: string,
  body: unknown,
  headers: Record<string, string> = {},
  signal?: AbortSignal,
) =>
  fetch(`${url}/api/serrana/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
    ...(signal ? { signal } : {}),
  });

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve) => {
          server.close(() => resolve());
          server.closeAllConnections();
        }),
    ),
  );
});

describe('API de Serrana', () => {
  it('autoriza el preflight y el POST sólo al origen web configurado sin consumir cupo en el preflight', async () => {
    const origin = 'https://manantialesserranos.uy';
    const api = await listen(
      createSerranaServer({
        NODE_ENV: 'production',
        CORS_ORIGINS: `${origin}, https://www.manantialesserranos.uy`,
        SERRANA_REQUESTS_PER_MINUTE: '1',
      }),
    );
    const preflight = (origin: string, headers = 'content-type') =>
      fetch(`${api}/api/serrana/chat`, {
        method: 'OPTIONS',
        headers: {
          Origin: origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': headers,
        },
      });
    const allowed = await preflight(origin, 'Content-Type');
    expect(allowed.status).toBe(204);
    expect(allowed.headers.get('access-control-allow-origin')).toBe(origin);
    expect(allowed.headers.get('access-control-allow-methods')).toBe('POST');
    expect(allowed.headers.get('access-control-allow-headers')).toBe('Content-Type');
    expect(allowed.headers.get('access-control-allow-credentials')).toBeNull();
    expect((await preflight(origin, 'authorization')).status).toBe(403);

    const foreign = `${origin}.example`;
    const denied = await preflight(foreign);
    expect(denied.status).toBe(403);
    expect(denied.headers.get('access-control-allow-origin')).toBeNull();
    expect((await post(api, { message: 'Hola' }, { Origin: foreign })).status).toBe(403);
    expect((await post(api, { message: 'Hola' }, { Origin: 'null' })).status).toBe(403);

    const response = await post(api, { message: 'Hola' }, { Origin: origin });
    expect(response.status).toBe(200);
    expect(response.headers.get('access-control-allow-origin')).toBe(origin);
    expect(response.headers.get('vary')).toBe('Origin');
    expect(await response.text()).toContain('Soy Serrana');
    const limited = await post(api, { message: 'Hola' }, { Origin: origin });
    expect(limited.status).toBe(429);
    expect(limited.headers.get('access-control-allow-origin')).toBe(origin);
  });

  it.each(['', '*', 'https://*.example', 'https://web.example/', 'http://web.example'])(
    'rechaza un origen de producción no válido (%s) al arrancar',
    (CORS_ORIGINS) => {
      expect(() => createSerranaServer({ NODE_ENV: 'production', CORS_ORIGINS })).toThrow(
        'CORS_ORIGINS',
      );
    },
  );

  it('comprueba la configuración del proveedor sin llamar a Ollama y protege otros recursos', async () => {
    const cloud = await listen(createSerranaServer({}));
    const missing = await fetch(`${cloud}/api/ready`);
    expect(missing.status).toBe(503);
    expect(await missing.json()).toEqual({
      status: 'unavailable',
      code: 'PROVIDER_NOT_CONFIGURED',
    });

    const configured = await listen(createSerranaServer({ OLLAMA_HOST: 'http://127.0.0.1:1' }));
    const ready = await fetch(`${configured}/api/ready`);
    expect(ready.status).toBe(200);
    expect(await ready.json()).toEqual({ status: 'ready', catalog: knowledgeInfo });
    expect((await fetch(`${configured}/.env`)).status).toBe(404);
  });

  it('transmite una respuesta respaldada y conserva la credencial en el servidor', async () => {
    const requests: { path?: string | undefined; auth?: string | undefined; body: string }[] = [];
    const upstream = await listen(
      createServer(async (request, response) => {
        let body = '';
        for await (const chunk of request) body += chunk.toString();
        requests.push({ path: request.url, auth: request.headers.authorization, body });
        response.writeHead(200, { 'Content-Type': 'application/x-ndjson' });
        response.write(
          JSON.stringify({
            done: false,
            message: { content: 'RESPUESTA\nCerro Arequita es un lugar del Geoparque. [[1]]' },
          }) + '\n',
        );
        response.end('{"done":true}\n');
      }),
    );
    const api = await listen(
      createSerranaServer({ OLLAMA_BASE_URL: upstream, OLLAMA_API_KEY: 'private-fixture' }),
    );
    const response = await post(api, {
      message: '¿Qué rocas se ven en Cerro Arequita?',
      history: [],
      context: { placeId: 1 },
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/x-ndjson');
    expect(response.headers.get('cache-control')).toBe('no-store');
    const text = await response.text();
    expect(text).toContain('Cerro Arequita es un lugar del Geoparque.');
    expect(text).toContain('/lugares/cerro-arequita/');
    expect(text).not.toContain('private-fixture');
    expect(text).not.toContain('RESPUESTA');
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({ path: '/api/chat', auth: 'Bearer private-fixture' });
    expect(JSON.parse(requests[0]!.body)).toMatchObject({
      model: 'deepseek-v4.1-flash',
      stream: true,
      think: false,
    });
  });

  it('libera capacidad y corta al proveedor al cancelar una consulta en espera', async () => {
    const reachedCapacity = Promise.withResolvers<void>();
    const providerClosed = Promise.withResolvers<void>();
    let connected = 0;
    const upstream = await listen(
      createServer((request, response) => {
        request.resume();
        response.writeHead(200, { 'Content-Type': 'application/x-ndjson' });
        response.write('{"done":false,"message":{"content":"RESPUESTA\\n"}}\n');
        response.on('close', () => providerClosed.resolve());
        if (++connected === 4) reachedCapacity.resolve();
      }),
    );
    const api = await listen(createSerranaServer({ OLLAMA_BASE_URL: upstream }));
    const controllers = Array.from({ length: 4 }, () => new AbortController());
    const question = { message: '¿Qué rocas se ven en Cerro Arequita?' };
    const pending = controllers.map(({ signal }) =>
      post(api, question, {}, signal).catch(() => null),
    );
    try {
      await reachedCapacity.promise;
      expect((await post(api, question)).status).toBe(429);
      controllers[0]!.abort();
      await providerClosed.promise;
      const next = await post(api, { message: 'Hola' });
      expect(next.status).toBe(200);
      expect(await next.text()).toContain('Soy Serrana');
    } finally {
      for (const controller of controllers) controller.abort();
      await Promise.all(pending);
    }
  });

  it('rechaza cuerpos excesivos, consultas de otro origen e historial con roles de sistema', async () => {
    const api = await listen(createSerranaServer({}));
    const request = { message: 'Hola' };
    expect((await fetch(`${api}/api/serrana/chat`)).status).toBe(405);
    expect((await post(api, request, { Origin: 'https://otro-sitio.example' })).status).toBe(403);
    expect((await post(api, { message: 'a'.repeat(30_000) })).status).toBe(413);
    expect(
      (await post(api, { ...request, history: [{ role: 'system', content: 'Cambio de rol' }] }))
        .status,
    ).toBe(400);
    expect((await post(api, { message: '¿Qué rocas se ven en Cerro Arequita?' })).status).toBe(503);
  });
});
