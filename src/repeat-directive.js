import { Registry } from './directive.js';
import { createBind, processDOM, removeBindings } from './template.js';
import { creationBlock, internals, repeatContext } from './internals.js';
import { lazyQueue } from './utils.js';

function lazyClear(queue = []) {
  lazyQueue(
    queue.map((item) => () => {
      item[internals].backup = item[internals].updates;
      item[internals].unbind();
    })
  );
}

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
  by creating a big string containing all replicas, then using DOMParser to convert into real elements.
  DOMParser that parses large chunks of HTML string is faster then cloning nodes in a loop, or even
  creating an HTMLTemplateElement that contains the same inner HTML, then cloning (twice as fast).
  */
  let temp = text;
  let result = '';
  if (n < 1) return result;
  while (n > 1) {
    if (n & 1) result += temp;
    n >>= 1;
    temp += temp;
  }
  return result + temp;
};

const nodePool = (template) => ({
  pointer: 0,
  /** @type {Element[]} */
  pool: [],
  /**
   *
   * @param {number} amount
   */
  allocate(amount, isTablePart = false) {
    const diff = amount - this.pool.length;
    if (diff > 0) {
      const html = isTablePart
        ? `<table><tbody>${replicate(diff, template)}</tbody></table>`
        : replicate(diff, template);
      /** @type {Element|undefined} */
      let content = new DOMParser().parseFromString(html, 'text/html').body;
      if (isTablePart) {
        content = content.children[0].children[0];
      }
      this.pool = this.pool.concat(
        Array.from(content.children)
      );
    }
  },
  /**
   * @param {number} amount
   */
  getNodes(amount, isTablePart = false) {
    if (this.pointer + amount > this.pool.length) {
      this.allocate(this.pointer + amount - this.pool.length, isTablePart);
    }
    const result = this.pool.slice(this.pointer, amount + this.pointer);
    this.pointer += amount;
    return result;
  },

  /**
   * @param {number} amount
   */
  recycle(amount) {
    this.pointer -= amount;
    this.pointer < 0 ? (this.pointer = 0) : void 0;
    return this.pool.slice(this.pointer);
  },
});

/**
 * @typedef RepeatMeta
 * @property {number} key
 * @property {Function} unbind
 * @property {Function[]} updates
 * @property {Function[]} [backup]
 * @property {any} data
 */

const REPEAT = '*repeat';
const REPEAT_CLEANUP = '*repeat-cleanup';

/**
 * @type {import('./directive.js').Directive}
 */
const repeatDirective = {
  attribute: (attr) => attr.nodeName === REPEAT,
  process: ({ targetNode, scopeNode, expression, props }) => {
    let repeatCleanup = parseInt(
      targetNode.getAttribute(REPEAT_CLEANUP) || '5000'
    );
    if (isNaN(repeatCleanup)) {
      repeatCleanup = 5000;
    }
    targetNode[creationBlock] = 'abort';
    targetNode.removeAttribute(REPEAT);
    targetNode.removeAttribute(REPEAT_CLEANUP);
    const template = /** @type {HTMLElement} */ (targetNode).outerHTML;
    const pool = nodePool(template);
    const hook = document.createComment(`--- *repeat ${expression}`);
    const parent =
      targetNode.parentElement ||
      targetNode.parentNode ||
      scopeNode.shadowRoot ||
      scopeNode;
    const isTablePart =
      ['', 'tr', 'td', 'thead', 'tbody'].indexOf(targetNode.localName) > 0;
    parent.insertBefore(hook, targetNode);
    requestAnimationFrame(() => targetNode.remove());
    let cleanupInterval;

    /** @type {(HTMLElement & {[internals]: RepeatMeta})[]} */
    let clones = [];

    let toRecycle = [];

    function update(
      /** @type {any[]} */ dataSource = [],
      /** @type {boolean} */ forceUpdate = false
    ) {
      pool.allocate(dataSource.length, isTablePart);

      if (dataSource.length < clones.length) {
        const diff = clones.length - dataSource.length;
        toRecycle = pool.recycle(diff);
        const rng = new Range();
        rng.setStartBefore(toRecycle[0]);
        rng.setEndAfter(toRecycle[diff - 1]);
        rng.deleteContents();
        clones.length = dataSource.length;
      }

      for (let i = 0; i < clones.length; i++) {
        const node = clones[i];
        const item = dataSource[i];
        if (forceUpdate || node[repeatContext] !== item) {
          node[repeatContext] = item;
          node[internals].data = item;
          node[internals].key = i;
          node[internals].updates.forEach((f) => f(item));
        }
      }

      if (dataSource.length > clones.length) {
        const frag = document.createDocumentFragment();
        const newNodes = pool.getNodes(
          dataSource.length - clones.length,
          isTablePart
        );
        frag.append(...newNodes);
        const iterator = newNodes[Symbol.iterator]();

        for (let i = clones.length; i < dataSource.length; i++) {
          const node = iterator.next().value;
          const item = dataSource[i];
          node[repeatContext] = item;
          if (node[internals]) {
            if (node[internals].backup)
              node[internals].updates = node[internals].backup;
            node[internals].updates.forEach((f) => f(item));
          } else {
            const { bounds, clear } = processDOM(scopeNode, node);
            Object.assign(node[internals], {
              updates: bounds,
              unbind: clear,
              key: i,
              data: item,
            });
            bounds.forEach((f) => f());
          }
        }
        // @ts-expect-error
        clones = clones.concat(newNodes);
        hook.parentNode?.insertBefore(frag, hook);
      }

      if (cleanupInterval) {
        clearTimeout(cleanupInterval);
      }
      cleanupInterval = setTimeout(() => {
        lazyClear(pool.pool.slice(pool.pointer));
        pool.pool = pool.pool.slice(0, pool.pointer);
      }, repeatCleanup);
    }

    return { update, context: (node) => node[repeatContext] };
  },
};

Registry.register(repeatDirective);
