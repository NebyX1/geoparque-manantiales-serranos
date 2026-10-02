const LOCAL_SITE = 'http://localhost:4321/';
const RESERVED_HOSTS = new Set(['example.com', 'example.net', 'example.org']);

function isPlaceholderHost(hostname: string): boolean {
  return (
    RESERVED_HOSTS.has(hostname) ||
    hostname.endsWith('.example') ||
    hostname.endsWith('.invalid') ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.test') ||
    !hostname.includes('.')
  );
}

function normalizeSite(value: string): string {
  const url = new URL(value);
  url.pathname = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
  url.search = '';
  url.hash = '';
  return url.toString();
}

export function getBuildSite(env: NodeJS.ProcessEnv = process.env): {
  url: string;
  indexable: boolean;
} {
  const indexable = env.SITE_INDEXABLE === 'true';
  const rawUrl = env.SITE_URL?.trim();
  const url = normalizeSite(rawUrl || LOCAL_SITE);
  const parsed = new URL(url);

  if (indexable) {
    if (!rawUrl) throw new Error('SITE_URL is required when SITE_INDEXABLE=true.');
    if (parsed.protocol !== 'https:') {
      throw new Error('SITE_URL must use HTTPS when SITE_INDEXABLE=true.');
    }
    if (['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname)) {
      throw new Error('SITE_URL cannot be a local address when SITE_INDEXABLE=true.');
    }
    if (isPlaceholderHost(parsed.hostname)) {
      throw new Error('SITE_URL cannot use a placeholder or reserved hostname.');
    }
  }

  return { url, indexable };
}

export function absoluteUrl(pathname: string, site = getBuildSite().url): string {
  return new URL(pathname.replace(/^\//, ''), site).toString();
}
