import { buildBaseElement } from './builder.js';
import { workFlow } from './workflow/index.js';
import { _null } from '../utils/index.js';

export default new Proxy(_null(), {
  get(_, elementType) {
    return buildBaseElement(elementType);
  }
});