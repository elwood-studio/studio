import set from 'lodash.set';
import get from 'lodash.get';

import { JsonObject, Json } from '@elwood/types';

export class RuntimeRunContext {
  readonly #data: JsonObject = {};

  get data() {
    return this.#data;
  }

  set(key: string, value: Json) {
    set(this.#data, key, value);
  }

  get<T = Json>(key: string): T {
    return get(this.#data, key);
  }

  merge(value: JsonObject) {
    Object.keys(value).forEach((key) => {
      this.#data[key] = value[key];
    });
  }
}
