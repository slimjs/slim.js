import { processDOM } from './template.js';
import { Registry, Phase } from './plugins.js';
import { componentInternals as internals, creationBlock } from './internals.js';
import { normalizeHTML } from './utils.js';

const LC_Create = Symbol();
const LC_Render = Symbol();

const flushMap = new Map();
const forceUpdateMap = new WeakSet();

export const isForcedUpdate = (target) => forceUpdateMap.has(target);

export function forceUpdate(target, ...keys) {
  const props = [...arguments].slice(1);
  const flush = flushMap.get(target);
  if (!flush) {
    throw new Error(
      'Error flushing component, Weakmap does not hold instance reference'
    );
  }
  forceUpdateMap.add(target);
  if (props) {
    flush(...props);
  } else {
    flush();
  }
  requestAnimationFrame(() => forceUpdateMap.delete(target));
}

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
 * @static @property {string} template
 * @static @property {boolean} useShadow
 */
export class Slim extends HTMLElement {
  /** @private */
  [internals] = {
    created: false,
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

  /** @private */
  [LC_Create]() {
    if (this[creationBlock] === 'abort') return;
    if (this[creationBlock]) {
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

  /** @private */
  [LC_Render]() {
    // @ts-ignore
    const template = normalizeHTML(this.constructor.template);
    if (template) {
      let frag = document.createDocumentFragment();
      const body = new DOMParser().parseFromString(
        `${template}`,
        'text/html'
      ).body;
      frag.append(...body.children);
      requestAnimationFrame(() => {
        const { flush } = processDOM(this, frag);
        flushMap.set(this, flush);
        Promise.resolve().then(this.onCreated.bind(this));
        flush();
        Promise.resolve().then(this.onRender.bind(this));
        Registry.execute(Phase.RENDER, this);
        getRoot(this).appendChild(frag);
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
