"""Fetch identified source photographs for an editorial audit, never during build."""

import concurrent.futures
import hashlib
import html
import json
import pathlib
import re
from urllib.parse import quote
import requests
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'reports/experience-review/photo-audit'
OUT.mkdir(parents=True, exist_ok=True)


def commons(title):
    page_url = 'https://commons.wikimedia.org/wiki/File:' + quote(title.replace(' ', '_'))
    response = requests.get(page_url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=30)
    response.raise_for_status()
    response.encoding = 'utf8'
    page = html.unescape(response.text)
    (OUT / ('commons-' + hashlib.sha256(title.encode()).hexdigest()[:12] + '.html')).write_text(page, encoding='utf8')
    image = re.search(r'class="fullMedia".*?<a href="([^"]+)"', page, re.S)
    if not image:
        raise ValueError('No original photograph link in Commons file page')
    text = re.sub(r'\s+', ' ', re.sub('<[^>]+>', ' ', re.sub('<script.*?</script>', '', page, flags=re.S)))
    author = re.search(r'\bAuthor\s+(.+?)(?=\s+(?:Camera location|Other versions|Permission|Licensing|This file|$))', text)
    license_name = re.search(r'class="licensetpl_short"[^>]*>(.*?)</span>', page, re.S)
    license_url = re.search(r'class="licensetpl_link"[^>]*>(.*?)</span>', page, re.S)
    return {'title': title, 'sourcePage': page_url,
            'sourceImage': image[1], 'author': author[1] if author else '',
            'license': re.sub('<[^>]+>', '', license_name[1]).strip() if license_name else '',
            'licenseUrl': license_url[1].strip() if license_url else '',
            'description': text[text.find('Summary [ edit ]'):text.find('Licensing [ edit ]')]}


def download(record):
    name = str(record['id']).zfill(2)
    output = OUT / ('source-' + name + '.jpg')
    if not output.exists():
        response = requests.get(record['sourceImage'], timeout=45,
                                headers={'User-Agent': 'GeoparquePhotoAudit/1.0'})
        response.raise_for_status()
        output.write_bytes(response.content)
    with Image.open(output) as image:
        record['width'], record['height'] = image.size
    record['file'] = output.relative_to(ROOT).as_posix()
    record['sourceSha256'] = hashlib.sha256(output.read_bytes()).hexdigest()
    return record


if __name__ == '__main__':
    jobs = json.loads((OUT / 'download-jobs.json').read_text(encoding='utf8'))

    def work(job):
        try:
            record = {**job, **commons(job['commons'])} if 'commons' in job else job
            result = download(record)
            print(f"PHOTO {job['id']}: {result['width']}x{result['height']}", flush=True)
            return result
        except Exception as error:
            print(f"FAILED {job['id']}: {str(error)[:100]}", flush=True)
            return {**job, 'error': str(error)}

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        results = list(pool.map(work, jobs))
    (OUT / 'download-results.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf8')
