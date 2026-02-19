import Conf from 'conf';

const store = new Conf({ projectName: 'ktmcp-symanto' });

export function getConfig(key) {
  return store.get(key);
}

export function setConfig(key, value) {
  store.set(key, value);
}

export function getAllConfig() {
  return store.store;
}

export function clearConfig() {
  store.clear();
}

export function isConfigured() {
  return Boolean(store.get('apiKey'));
}
