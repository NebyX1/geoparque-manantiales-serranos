import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { stabilizeReactHydration } from '../../src/integrations/reactHydration';

describe('adaptador de hidratación React', () => {
  it('aplica la corrección a la integración instalada y conserva actualizaciones y cleanup', () => {
    const source = readFileSync('node_modules/@astrojs/react/dist/client.js', 'utf8');
    const result = stabilizeReactHydration(source);
    expect(result).toContain('existingRoot.render(componentEl)');
    expect(result).toContain('hydrateRoot(element, componentEl, renderOptions)');
    expect(result).toContain('root.unmount()');
    expect(result).toContain('flushSync(() =>');
    expect(result).toContain('createRoot(element)');
    expect(result.match(/root\.render\(componentEl\)/g)).toHaveLength(1);
  });
  it('exige revisar el adaptador cuando cambia el código de la dependencia', () => {
    expect(() => stabilizeReactHydration('changed upstream code')).toThrow('Review');
  });
});
