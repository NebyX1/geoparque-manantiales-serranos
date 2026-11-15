import { readFile } from 'node:fs/promises';
import { root } from 'astro:config/server';
import type { APIRoute, GetStaticPaths } from 'astro';

export const getStaticPaths = (() => {
  const directory = '/src/assets/images/experience-miniature/';
  return Object.keys(import.meta.glob('/src/assets/images/experience-miniature/*/*.webp')).map(
    (photoPath) => {
      const [modelo, textura] = photoPath.slice(directory.length, -'.webp'.length).split('/');
      return { params: { modelo, textura }, props: { file: photoPath.slice(1) } };
    },
  );
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ file: string }> = async ({ props }) =>
  new Response(new Uint8Array(await readFile(new URL(props.file, root))), {
    headers: { 'Content-Type': 'image/webp' },
  });
