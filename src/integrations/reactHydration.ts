import type { Plugin } from 'vite';

// hydrateRoot already receives its initial children. React 19.3 can report #424
// when the integration immediately schedules root.render before that commit.
// Complete the initial commit before a fast navigation can unmount the island.
// Keep subsequent renders (including persisted islands) and normal unmounts.
export function stabilizeReactHydration(source: string): string {
  const initialRender =
    /const root = getOrCreateRoot\(element, \(\) => \{\s*const r = hydrateRoot\(element, componentEl, renderOptions\);\s*element.addEventListener\("astro:unmount", \(\) => r.unmount\(\), \{ once: true \}\);\s*return r;\s*\}\);\s*root.render\(componentEl\);/;
  if (!initialRender.test(source)) {
    throw new Error('Review the React hydration adapter after upgrading @astrojs/react.');
  }
  return (
    `import { flushSync } from "react-dom";\n` +
    source.replace(
      initialRender,
      `const existingRoot = rootMap.get(element);
    if (existingRoot) {
      existingRoot.render(componentEl);
    } else {
      getOrCreateRoot(element, () => {
        let root;
        flushSync(() => {
          root = hydrateRoot(element, componentEl, renderOptions);
        });
        element.addEventListener("astro:unmount", () => root.unmount(), { once: true });
        return root;
      });
    }`,
    )
  );
}

export function reactHydration(): Plugin {
  return {
    name: 'geopark-react-hydration',
    enforce: 'pre',
    transform(source, id) {
      if (!id.replaceAll('\\', '/').endsWith('/@astrojs/react/dist/client.js')) return;
      return { code: stabilizeReactHydration(source), map: null };
    },
  };
}
