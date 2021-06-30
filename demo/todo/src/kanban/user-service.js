import { define } from './modules/depinj.js';
import { getEnv } from './modules/env-vars.js';

// https://jsonplaceholder.typicode.com/users/

const cache = {};

const UserService = {
  async getById(id) {
    if (!id) {
      return;
    }
    if (cache[id]) {
      return cache[id];
    }
    const endpoint = getEnv().userEndpoint;
    const url = `${endpoint}/?seed=${id}`;
    const r = await fetch(url);
    const data = (await r.json()).results[0];
    cache[id] = data;
    return data;
  },
};

const serviceName = 'UserService';

define(serviceName, () => UserService);

export default serviceName;
