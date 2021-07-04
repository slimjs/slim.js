import { processDOM } from './dom.js';
import { PluginRegistry } from './enhance.js';
import { ADDED, CREATE, REMOVED, RENDER, block } from './internals.js';
import { markFlush, normalize } from './utils.js';
const S = Symbol;
const LIFECYCLE_CREATE = S();
const LIFECYCLE_RENDER = S();

export default class Component extends HTMLElement {
  static template = '';
  static useShadow = true;
  /**
   *
   * @param {string} tag Dashed string for element tagName
   * @param {string} template HTML with Slim-annotations
   * @param {typeof Component} [base] Class extending Slim Base Component
   */
  // @ts-expect-error
  static element(tag, template, base = class extends Slim {}) {
    base.template = template;
    customElements.define(tag, base);
  }

  constructor() {
    super();
    this[LIFECYCLE_CREATE]();
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
    this.onAdded();
    PluginRegistry.exec(ADDED, this);
  }

  disconnectedCallback() {
    this.onRemoved();
    PluginRegistry.exec(REMOVED, this);
  }

  [LIFECYCLE_CREATE]() {
    if (this[block] === 'abort') return;
    if (this[block]) {
      return requestAnimationFrame(() => this[LIFECYCLE_CREATE]());
    }
    this.onBeforeCreated();
    // @ts-ignore
    if (this.constructor.useShadow && !this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    PluginRegistry.exec(CREATE, this);
    this[LIFECYCLE_RENDER]();
  }

  [LIFECYCLE_RENDER]() {
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
        (this.shadowRoot || this).appendChild(tpl.content);
        this.onRender();
      });
    }
  }
}
