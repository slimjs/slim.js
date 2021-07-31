import {
  processDOM,
  removeBindings,
  Internals,
  DirectiveRegistry,
} from '../index.js';
const { block, internals, repeatCtx } = Internals;

const lateClear = (domCopies = [], scope) => {
  domCopies.forEach((dom) => {
    removeBindings(scope, dom);
    dom[internals][CLEAR]();
  });
};

const BOUNDS = Symbol();
const CLEAR = Symbol();

/**
 * @param {Function[]} arr
 */
const runAll = (arr) => arr.forEach((f) => f());

/**
 *
 * @param {number} n
 * @param {string} text
 * @returns
 */
const replicate = (n, text) => {
  /*
  This is probably the best high-numbers cloning of strings.
  The idea is to replicate an HTML tag (i.e. <div class="something">{{item}}</div>)
  by creating a big string containing all replicas, then using template element to convert into real elements.
  this method is faster then cloning nodes in a loop, and faster than DOMParser
  */
  let temp = text;
  let result = '';
  while (n > 1) {
    if (n & 1) result += temp;
    n >>= 1;
    temp += temp;
  }
  return result + temp;
};

/**
 *
 * @param {string} template HTML string
 */
const nodePool = (template) => ({
  tpl: document.createElement('template'),
  ptr: 0,
  /** @type {HTMLElement[]} */
  pool: [],
  /**
   * @param {number} amount
   */
  alloc(amount) {
    const diff = amount - this.pool.length;
    const { tpl } = this;
    if (diff > 0) {
      tpl.innerHTML = replicate(diff, template);
      this.pool = this.pool.concat(
        /** @type {HTMLElement[]} */ (Array.from(tpl.content.children)),
      );
    }
  },
  /**
   * @param {number} amount
   * @returns {HTMLElement[]}
   */
  get(amount) {
    if (this.ptr + amount > this.pool.length) {
      this.alloc(this.ptr + amount - this.pool.length);
    }
    this.ptr += amount;
    return this.pool.slice(this.ptr - amount, this.ptr);
  },

  /**
   * @param {number} amount
   */
  dump(amount) {
    this.ptr -= amount;
    this.ptr < 0 ? (this.ptr = 0) : void 0;
    return this.pool.slice(this.ptr);
  },
});

const REPEAT = '*repeat';
const REPEAT_CLEANUP = '*repeat-cleanup';
const delRng = new Range();
let toRecycle = [];

/**
 * @type {import('../typedefs.js').Directive}
 */
const repeatDirective = {
  attribute: (_, nodeName) => nodeName === REPEAT,
  process: ({ targetNode: tNode, scopeNode: scope, expression: ex }) => {
    let repeatCleanup = parseInt(tNode.getAttribute(REPEAT_CLEANUP)) || 5000;
    tNode[block] = 'abort';
    tNode.removeAttribute(REPEAT);
    tNode.removeAttribute(REPEAT_CLEANUP);
    const template = /** @type {HTMLElement} */ (tNode).outerHTML;
    const hook = document.createComment(`*repeat`);
    const parent =
      tNode.parentElement || tNode.parentNode || scope.shadowRoot || scope;
    const pool = nodePool(template);
    parent.insertBefore(hook, tNode);
    let cleanupInterval;
    const frag = document.createDocumentFragment();

    /** @type {HTMLElement[]} */
    let clones = [];

    let bounds, clear;

    function update(
      /** @type {any[]} */ dataSource = [],
      /** @type {boolean} */ forceUpdate = false,
    ) {
      if (cleanupInterval) {
        clearTimeout(cleanupInterval);
      }
      const diff = Math.abs(dataSource.length - clones.length);
      pool.alloc(dataSource.length);

      if (dataSource.length < clones.length) {
        toRecycle = pool.dump(diff);
        delRng.setStartBefore(toRecycle[0]);
        delRng.setEndAfter(toRecycle[diff - 1]);
        delRng.deleteContents();
        // toRecycle.length = 0; // free memory
        clones.length = dataSource.length;
      }

      for (let i = 0; i < clones.length; i++) {
        const node = clones[i];
        const item = dataSource[i];
        if (forceUpdate || node[repeatCtx] !== item) {
          node[repeatCtx] = item;
          runAll(node[internals][BOUNDS]);
        }
      }

      if (dataSource.length > clones.length) {
        const newNodes = pool.get(diff);
        const iterator = newNodes[Symbol.iterator]();

        for (let i = clones.length; i < dataSource.length; i++) {
          const node = iterator.next().value;
          const item = dataSource[i];
          node[repeatCtx] = item;
          const meta = node[internals];
          if (!meta) {
            ({ bounds, clear } = processDOM(scope, node));
            Object.assign(node[internals], {
              [BOUNDS]: bounds,
              [CLEAR]: clear,
            });
          }
          runAll(node[internals][BOUNDS]);
        }
        clones = clones.concat(newNodes);
        frag.append(...newNodes);
        parent.insertBefore(frag, hook);
      }
      cleanupInterval = setTimeout(() => {
        lateClear(toRecycle.concat(), scope);
        pool.pool = pool.pool.slice(0, pool.ptr);
        toRecycle.length = 0;
      }, repeatCleanup);
    }

    return { update, removeNode: true };
  },
};

DirectiveRegistry.add(repeatDirective, true);
