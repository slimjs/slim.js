import { Slim } from './component.js';
export { Registry } from './directive.js';
import { camelToDash, dashToCamel, syntaxMethod } from './utils.js';
import './event-directive.js';
import './if-directive.js';
import './property-directive.js';
import './repeat-directive.js';

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
};

const Component = Slim;

export { Slim, Utils, element, Component };
