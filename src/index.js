import { Slim } from './component.js';
export { Registry } from './directive.js';
export { forceUpdate } from './component.js';
import { camelToDash, dashToCamel, syntaxMethod } from './utils.js';
import { debug } from './internals.js';
import './repeat-directive.js';
import './event-directive.js';
import './if-directive.js';
import './property-directive.js';
import './ref-directive.js';
import './attribute-directive.js';

/**
 *
 * @param {string} tag
 * @param {string} template
 * @param {CustomElementConstructor} [base]
 */
function element(tag, template, base = class extends Slim {}) {
  Object.defineProperty(base, 'template', {
    value: template,
  });
  customElements.define(tag, base);
}

const Utils = {
  camelToDash,
  dashToCamel,
  syntaxMethod,
  debug: () => Slim[debug] = true,
};

const Component = Slim;

export { Slim, Utils, element, Component };
