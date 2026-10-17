import { createStore, del, delMany, get, set, type UseStore } from 'idb-keyval'

let store: UseStore | null = null

/** IndexedDB do navegador. Piloto: rascunho, fotos e áudios gerados ficam só aqui. */
function db(): UseStore {
  store ??= createStore('falamor', 'kv')
  return store
}

export const idb = {
  get: <T>(key: string) => get<T>(key, db()),
  set: (key: string, value: unknown) => set(key, value, db()),
  del: (key: string) => del(key, db()),
  delMany: (keys: string[]) => delMany(keys, db()),
}
