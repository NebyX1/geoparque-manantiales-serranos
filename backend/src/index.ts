import { createSerranaServer } from './http.js';

const host = process.env.HOST?.trim() || '127.0.0.1';
const port = Number(process.env.PORT || 4319);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT debe estar entre 1 y 65535.');
}

const server = createSerranaServer();
server.listen(port, host, () => console.info(`[serrana] API escuchando en ${host}:${port}`));

function stop() {
  server.close();
  server.closeAllConnections();
}

process.once('SIGINT', stop);
process.once('SIGTERM', stop);
