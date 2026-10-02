import { atom } from 'nanostores';
import { setPersistentEngine, windowPersistentEvents } from '@nanostores/persistent';

export type StorageStatus = 'available' | 'memory' | 'write-failed';
export const $storageStatus = atom<StorageStatus>('available');

function report(status: StorageStatus): void {
  $storageStatus.set(status);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('geopark:storage', { detail: status }));
  }
}

export function createStorageProxy(storageOverride?: Storage): Record<string, string> {
  const memory: Record<string, string> = {};
  if (typeof window === 'undefined' && !storageOverride) return memory;
  let storage: Storage;
  try {
    storage = storageOverride ?? window.localStorage;
    const probe = '__manantiales_serranos_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
  } catch {
    report('memory');
    return memory;
  }

  return new Proxy(memory, {
    has(_target, key) {
      try {
        return typeof key === 'string' && storage.getItem(key) !== null;
      } catch {
        report('memory');
        return key in memory;
      }
    },
    get(_target, key) {
      if (typeof key !== 'string') return undefined;
      try {
        return storage.getItem(key) ?? memory[key];
      } catch {
        report('memory');
        return memory[key];
      }
    },
    set(_target, key, value) {
      if (typeof key !== 'string') return false;
      memory[key] = String(value);
      try {
        storage.setItem(key, String(value));
      } catch {
        report('write-failed');
      }
      return true;
    },
    deleteProperty(_target, key) {
      if (typeof key !== 'string') return false;
      delete memory[key];
      try {
        storage.removeItem(key);
      } catch {
        report('write-failed');
      }
      return true;
    },
    ownKeys() {
      const keys = new Set(Object.keys(memory));
      try {
        for (let index = 0; index < storage.length; index += 1) {
          const key = storage.key(index);
          if (key) keys.add(key);
        }
      } catch {
        report('memory');
      }
      return [...keys];
    },
    getOwnPropertyDescriptor() {
      return { enumerable: true, configurable: true };
    },
  });
}

export const persistentStorage = createStorageProxy();
setPersistentEngine(
  persistentStorage,
  typeof window === 'undefined'
    ? { addEventListener() {}, removeEventListener() {} }
    : windowPersistentEvents,
);
