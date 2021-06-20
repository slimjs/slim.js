import { processDOM } from './template.js';
import { Plugins } from './plugins.js';
import { Internals } from './internals.js';
import { Utils } from './utils.js';

const { internals, block } = Internals;

const { Registry, Phase } = Plugins;

const LC_Create = Symbol();
const LC_Render = Symbol();

/**
 * @param {Function | undefined} cb
 * @param {...any} args
 * @this {any}
 */
function safeCall(this: Component, cb: Function, ...args: any[]) {
  cb ? cb.call(this, ...args) : void 0;
}

/**
 *
 * @param {HTMLElement|Slim} target
 */
function getRoot(target) {
  return target.shadowRoot || target;
}

export default class Component extends HTMLElement {
  static template = '';
  static useShadow = true;

  constructor() {
    super();
    this[internals] = { created: false };
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
    safeCall.call(this, super.connectedCallback);
  }

  disconnectedCallback() {
    // @ts-ignore
    safeCall.call(this, super.disconnectedCallback);
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
    Registry.execute(Phase.CREATE, this);
  }

  [LC_Render]() {
    // @ts-ignore
    const template = Utils.normalizeHTML(this.constructor.template);
    if (template) {
      let frag = document.createDocumentFragment();
      const body = new DOMParser().parseFromString(template, 'text/html').body;
      frag.append(...body.children);
      requestAnimationFrame(() => {
        const { flush } = processDOM(this, frag);
        Utils.markFlush(this, flush);
        Promise.resolve()
          .then(this.onCreated.bind(this))
          .then(() => {
            flush();
            Promise.resolve().then(this.onRender.bind(this));
            Registry.execute(Phase.RENDER, this);
            getRoot(this).appendChild(frag);
          });
      });
    }
  }
}
