import {
  processDOM,
  removeBindings,
  Internals,
  DirectiveRegistry,
} from '../index.js';
const { block, internals, repeatCtx } = Internals;

const lateClear = (queue = [], scope) => {
  queue.forEach((item) => {
    removeBindings(scope, item, '*');
    item[internals].clear();
  });
};

const raf = requestAnimationFrame;

/**
 *
 * @param {number} n
 * @param {string} text
 * @returns
 */
const replicate = (n, text) => {
  /*
  This is probably the b\est high-numbers cloning of strings.
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
  tpl: document.createElement('template'),
  ptr: 0,
  /** @type {Element[]} */
  pool: [],
  /**
   *
   * @param {number} amount
   */
  alloc(amount, isTablePart = false) {
    const diff = amount - this.pool.length;
    if (diff > 0) {
      const html = isTablePart
        ? `<table><tbody>${replicate(diff, template)}</tbody></table>`
        : replicate(diff, template);
      this.tpl.innerHTML = html;
      /** @type {Element|DocumentFragment} */
      let content = this.tpl.content;
      if (isTablePart) {
        content = content.children[0].children[0];
      }
      this.pool = this.pool.concat(Array.from(content.children));
    }
  },
  /**
   * @param {number} amount
   */
  get(amount, isTablePart = false) {
    if (this.ptr + amount > this.pool.length) {
      this.alloc(this.ptr + amount - this.pool.length, isTablePart);
    }
    const result = this.pool.slice(this.ptr, amount + this.ptr);
    this.ptr += amount;
    return result;
  },

  /**
   * @param {number} amount
   */
  recycle(amount) {
    this.ptr -= amount;
    this.ptr < 0 ? (this.ptr = 0) : void 0;
    return this.pool.slice(this.ptr);
  },
});

const REPEAT = '*repeat';
const REPEAT_CLEANUP = '*repeat-cleanup';

/**
 * @type {import('../typedefs.js').Directive}
 */
const repeatDirective = {
  attribute: (_, nodeName) => nodeName === REPEAT,
  process: ({
    targetNode: tNode,
    scopeNode: scope,
    expression: ex,
    targetNodeName,
  }) => {
    let repeatCleanup =
      parseInt(tNode.getAttribute(REPEAT_CLEANUP) || '5000') || 5000;
    let delRng = new Range();
    tNode[block] = 'abort';
    tNode.removeAttribute(REPEAT);
    tNode.removeAttribute(REPEAT_CLEANUP);
    const template = /** @type {HTMLElement} */ (tNode).outerHTML;
    const pool = nodePool(template);
    const hook = document.createComment(`*repeat ${ex}`);
    const parent =
      tNode.parentElement || tNode.parentNode || scope.shadowRoot || scope;
    const isTablePart =
      ['', 'tr', 'td', 'thead', 'tbody'].indexOf(targetNodeName) > 0;
    parent.insertBefore(hook, tNode);
    let cleanupInterval;
    const frag = document.createDocumentFragment();

    /** @type {HTMLElement[]} */
    let clones = [];

    let toRecycle = [];

    let bounds, clear;

    function update(
      /** @type {any[]} */ dataSource = [],
      /** @type {boolean} */ forceUpdate = false
    ) {
      let changeSet = [];
      if (cleanupInterval) {
        clearTimeout(cleanupInterval);
      }
      pool.alloc(dataSource.length, isTablePart);

      if (dataSource.length < clones.length) {
        const diff = clones.length - dataSource.length;
        toRecycle = pool.recycle(diff);
        delRng.setStartBefore(toRecycle[0]);
        delRng.setEndAfter(toRecycle[diff - 1]);
        toRecycle.length = 0; // free memory
        clones.length = dataSource.length;
      }

      for (let i = 0; i < clones.length; i++) {
        const node = clones[i];
        const meta = node[internals];
        const item = dataSource[i];
        if (forceUpdate || node[repeatCtx] !== item) {
          node[repeatCtx] = item;
          meta.data = item;
          changeSet.push(...meta.bounds);
        }
      }

      if (dataSource.length > clones.length) {
        const newNodes = pool.get(
          dataSource.length - clones.length,
          isTablePart
        );
        frag.append(...newNodes);
        const iterator = newNodes[Symbol.iterator]();

        for (let i = clones.length; i < dataSource.length; i++) {
          const node = iterator.next().value;
          const item = dataSource[i];
          node[repeatCtx] = item;
          const meta = node[internals];
          if (meta) {
            meta.bounds.forEach((f) => f(item));
          } else {
            ({ bounds, clear } = processDOM(scope, node));
            Object.assign(node[internals], {
              bounds,
              clear,
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
      raf(() => {
        delRng.deleteContents();
        delRng.detach();
        changeSet.forEach((f) => f());
        // changeSet.forEach((change) => change.forEach((f) => f()));
      });
      cleanupInterval = setTimeout(() => {
        lateClear(pool.pool.slice(pool.ptr), scope);
        pool.pool = pool.pool.slice(0, pool.ptr);
      }, repeatCleanup);
    }

    return { update, removeNode: true };
  },
};

DirectiveRegistry.add(repeatDirective, true);
