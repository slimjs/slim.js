import { processDOM } from './dom.js';
import { PluginRegistry } from './enhance.js';
import {
  ADDED,
  CREATE,
  REMOVED,
  RENDER,
  block,
  internals,
} from './internals.js';
import { markFlush, normalize } from './utils.js';

const LC_Create = Symbol();
const LC_Render = Symbol();

function safeCall(cb, ...args) {
  cb ? cb.call(this, ...args) : void 0;
}

/**
 *
 * @param {HTMLElement|Component} target
 */
function getRoot(target) {
  return target.shadowRoot || target;
}

export default class Component extends HTMLElement {
  static template = '';
  static useShadow = true;
  /**
   *
   * @param {string} tag Dashed string for element tagName
   * @param {string} template HTML with Slim-annotations
   * @param {typeof Component} base Class extending Slim Base Component
   */
  // @ts-expect-error
  static element(tag, template, base = class extends Slim {}) {
    Object.defineProperty(base, 'template', { value: template });
    customElements.define(tag, base);
  }

  constructor() {
    super();
    this[internals] = this[internals] || {};
    this[internals].created = true;
    this[LC_Create]();
  }

  /** @abstract */
  onBeforeCreated() {}

  /** @abstract */
  onCreated() {}

  /** @abstract */
  onAdded() {}

  /** @abstract */
  onRemoved() {}

  /** @abstract */
  onRender() {}

  /** @protected */
  connectedCallback() {
    // @ts-ignore
    safeCall.call(this, super.connectedCallback);
    this.onAdded();
    PluginRegistry.exec(ADDED, this);
  }

  disconnectedCallback() {
    // @ts-ignore
    safeCall.call(this, super.disconnectedCallback);
    this.onRemoved();
    PluginRegistry.exec(REMOVED, this);
  }

  [LC_Create]() {
    if (this[block] === 'abort') return;
    if (this[block]) {
      return requestAnimationFrame(() => this[LC_Create]());
    }
    this.onBeforeCreated();
    // @ts-ignore
    if (this.constructor.useShadow && !this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    this[internals].created = true;
    PluginRegistry.exec(CREATE, this);
    this[LC_Render]();
  }

  [LC_Render]() {
    // @ts-ignore
    const template = normalize(this.constructor.template);
    if (template) {
      const tpl = document.createElement('template');
      tpl.innerHTML = template;
      Promise.resolve().then(() => {
        const { flush } = processDOM(this, tpl.content);
        markFlush(this, flush);
        flush();
        this.onCreated();
        PluginRegistry.exec(RENDER, this);
        getRoot(this).appendChild(tpl.content);
        this.onRender();
      });
    }
  }
}
