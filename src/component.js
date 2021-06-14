import { processDOM } from './template.js';
import { Registry, Phase } from './plugins.js';

const internals = Symbol('slim');
const LC_Create = Symbol();
const LC_Render = Symbol();

/**
 * @param {Function | undefined} cb
 * @param {...any} args
 * @this {any}
 */
function safeCall(cb, ...args) {
  cb ? cb.call(this, ...args) : void 0;
}

/**
 *
 * @param {HTMLElement|Slim} target
 */
function getRoot(target) {
  return target.shadowRoot || target;
}

/**
 * @class
 * @static {string} template
 */
export class Slim extends HTMLElement {
  [internals] = {
    created: false,
    createBlocked: false,
  };

  constructor() {
    super();
    this[LC_Create]();
    this[LC_Render]();
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
    safeCall(super.connectedCallback);
  }

  disconnectedCallback() {
    // @ts-ignore
    safeCall(super.disconnectedCallback);
  }

  [LC_Create]() {
    this.onBeforeCreated();
    // @ts-ignore
    if (this.constructor.useShadow && !this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    this[internals].created = true;
    this.onCreated();
    Registry.execute(Phase.CREATE, this);
  }

  [LC_Render]() {
    // @ts-ignore
    const template = this.constructor.template;
    if (template) {
      const e = document.createElement('template');
      e.innerHTML = template;
      const content = e.content.cloneNode(true);
      requestAnimationFrame(() => {
        const { flush } = processDOM(this, content);
        flush();
        this.onRender();
        Registry.execute(Phase.RENDER, this);
        getRoot(this).appendChild(content);
      });
    }
  }
}

/**
 * @type {string}
 */
Slim.template = '';

/**
 * @type {boolean}
 */
Slim.useShadow = true;
